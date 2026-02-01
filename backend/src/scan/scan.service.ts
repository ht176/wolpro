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
    const interfaces = os.networkInterfaces();
    const devices: ScannedDevice[] = [];
    const localIPs: string[] = [];

    // 1. Get Local IPs and Subnets
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]!) {
        // Skip internal and non-IPv4 addresses
        if (iface.family === 'IPv4' && !iface.internal) {
          localIPs.push(iface.address);
          // Simple assumption: /24 subnet for home networks
          // In a real app, calculate range from CIDR
          const subnet = iface.address.substring(0, iface.address.lastIndexOf('.'));
          await this.pingSubnet(subnet);
        }
      }
    }

    // 2. Read ARP Table
    try {
      const { stdout } = await execPromise('arp -a');
      const lines = stdout.split('\n');
      
      for (const line of lines) {
        // Parse ARP output. Format varies by OS.
        // MacOS: ? (192.168.1.1) at 12:34:56:78:90:ab on en0 ifscope [ethernet]
        // Linux: ? (192.168.1.1) at 12:34:56:78:90:ab [ether] on eth0
        // Windows: 192.168.1.1       12-34-56-78-90-ab     dynamic
        
        const ipMatch = line.match(/\((\d+\.\d+\.\d+\.\d+)\)/) || line.match(/(\d+\.\d+\.\d+\.\d+)/);
        const macMatch = line.match(/([0-9a-fA-F]{1,2}[:-]){5}[0-9a-fA-F]{1,2}/);

        if (ipMatch && macMatch) {
          const ip = ipMatch[1];
          const mac = macMatch[0];
          
          // Filter out multicast/broadcast if needed, or keep all
          if (mac !== 'ff:ff:ff:ff:ff:ff') {
             devices.push({ ip, mac });
          }
        }
      }
    } catch (e) {
      this.logger.error('Error reading ARP table', e);
    }

    return devices;
  }

  private async pingSubnet(subnet: string) {
    // Quick ping sweep.
    // Ideally use a library or smarter logic.
    // Doing a limited sweep for demo purposes (1-254)
    // To speed up, we batch them.
    const promises = [];
    for (let i = 1; i < 255; i++) {
        const ip = `${subnet}.${i}`;
        // Timeout 200ms, count 1. 
        // MacOS/Linux: -c 1 -W 200 (wait in ms not supported by all ping versions, use -t or -W with seconds)
        // MacOS: -c 1 -W 500 (wait time in ms)
        // Linux: -c 1 -W 1 (wait time in s)
        const cmd = process.platform === 'darwin' 
            ? `ping -c 1 -W 200 ${ip}` 
            : `ping -c 1 -W 1 ${ip}`;
            
        promises.push(execPromise(cmd).catch(() => {})); // Ignore failures
        
        // Limit concurrency to avoid too many open files/processes
        if (promises.length >= 20) {
            await Promise.all(promises);
            promises.length = 0;
        }
    }
    await Promise.all(promises);
  }
}
