import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as os from 'os';
import * as util from 'util';

const execPromise = util.promisify(exec);

export interface ScannedDevice {
  ip: string;
  mac: string;
  vendor?: string;
  hostname?: string;
}

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name);

  async scanNetwork(): Promise<ScannedDevice[]> {
    this.logger.log('Starting network scan...');

    // 0. Check for Docker/Env hints
    if (process.env.DOCKER_ENV && os.platform() === 'linux') {
      this.logger.debug(
        'Running in Docker environment. Ensure network_mode: "host" is used.',
      );
    }

    // 1. Try using arp-scan first (Fastest & Most reliable for Linux/Docker)
    try {
      const arpScanResults = await this.tryArpScan();
      if (arpScanResults.length > 0) {
        this.logger.log(`arp-scan found ${arpScanResults.length} devices.`);
        return arpScanResults;
      }
    } catch {
      this.logger.debug(
        'arp-scan failed or not available, falling back to ping sweep.',
      );
    }

    // 2. Fallback: Ping Sweep + Read System ARP Table
    return this.fallbackScan();
  }

  /**
   * Method 1: Use `arp-scan` tool (Linux/Unix mostly).
   * Requires `sudo apt-get install arp-scan` in Dockerfile.
   */
  private async tryArpScan(): Promise<ScannedDevice[]> {
    // Check if arp-scan exists
    try {
      await execPromise('arp-scan --version');
    } catch {
      throw new Error('arp-scan not installed');
    }

    const devices: ScannedDevice[] = [];
    const interfaces = os.networkInterfaces();

    // Iterate interfaces to scan local subnets
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === 'IPv4' && !iface.internal) {
          try {
            // -l: Localnet, -I: Interface, -g: Ignore header/footer
            const { stdout } = await execPromise(`arp-scan -I ${name} -l -g`);
            const lines = stdout.split('\n');

            for (const line of lines) {
              // Output format: 192.168.1.1   00:11:22:33:44:55   Vendor Name
              const parts = line.split('\t');
              if (parts.length >= 2) {
                devices.push({
                  ip: parts[0].trim(),
                  mac: parts[1].trim(),
                  vendor: parts[2] ? parts[2].trim() : undefined,
                });
              }
            }
          } catch (e) {
            // Ignore interface scan errors (some interfaces might not support arp-scan)
            this.logger.warn(
              `Failed to run arp-scan on ${name}: ${(e as Error).message}`,
            );
          }
        }
      }
    }
    return devices;
  }

  /**
   * Method 2: Manually Ping subnet + Read ARP Table
   * Works on Windows/Mac/Linux but is slower and relies on system ARP cache.
   */
  private async fallbackScan(): Promise<ScannedDevice[]> {
    const interfaces = os.networkInterfaces();
    const devicesMap = new Map<string, ScannedDevice>();

    // 1. Ping Sweep to populate ARP table
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        if (iface.family === 'IPv4' && !iface.internal) {
          // Simple assumption: /24 subnet.
          const subnet = iface.address.substring(
            0,
            iface.address.lastIndexOf('.'),
          );
          await this.pingSubnet(subnet);
        }
      }
    }

    // 2. Read ARP Table
    try {
      const { stdout } = await execPromise('arp -a');
      const lines = stdout.split('\n');

      for (const line of lines) {
        // Parse ARP output.
        const ipMatch =
          line.match(/\((\d+\.\d+\.\d+\.\d+)\)/) ||
          line.match(/(\d+\.\d+\.\d+\.\d+)/);
        // Robust MAC Regex
        const macMatch = line.match(
          /([0-9a-fA-F]{1,2}[:-]){5}[0-9a-fA-F]{1,2}/,
        );

        if (ipMatch && macMatch) {
          const ip = ipMatch[1];
          let mac = macMatch[0];

          // Normalize MAC to colon-separated (Windows uses dashes)
          mac = mac.replace(/-/g, ':').toLowerCase();

          // Filter out multicast/broadcast
          if (mac !== 'ff:ff:ff:ff:ff:ff' && !devicesMap.has(mac)) {
            devicesMap.set(mac, { ip, mac });
          }
        }
      }
    } catch (e) {
      this.logger.error('Error reading ARP table', e);
    }

    return Array.from(devicesMap.values());
  }

  private async pingSubnet(subnet: string) {
    const promises = [];
    const limit = 50; // Concurrency limit

    for (let i = 1; i < 255; i++) {
      const ip = `${subnet}.${i}`;

      let cmd = '';
      if (os.platform() === 'win32') {
        // Windows: -n 1 (count), -w 200 (timeout in ms)
        cmd = `ping -n 1 -w 200 ${ip}`;
      } else if (os.platform() === 'darwin') {
        // MacOS: -c 1 (count), -W 200 (timeout in ms)
        cmd = `ping -c 1 -W 200 ${ip}`;
      } else {
        // Linux: -c 1 (count), -W 1 (timeout in seconds usually, some versions support ms)
        // Using -W 1 (1 second) is safer for standard ping
        cmd = `ping -c 1 -W 1 ${ip}`;
      }

      // Swallow errors (host unreachable)
      const p = execPromise(cmd).catch(() => {});
      promises.push(p);

      if (promises.length >= limit) {
        await Promise.all(promises);
        promises.length = 0;
      }
    }
    await Promise.all(promises);
  }
}
