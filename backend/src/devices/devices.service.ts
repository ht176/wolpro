import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';
import { DeviceStatusDto } from './dto/device-status.dto';
import { exec } from 'child_process';
import * as util from 'util';
import * as os from 'os';

const execPromise = util.promisify(exec);

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    return this.deviceRepository.save(createDeviceDto);
  }

  findAll(): Promise<Device[]> {
    return this.deviceRepository.find();
  }

  findOne(id: number): Promise<Device | null> {
    return this.deviceRepository.findOne({ where: { id } });
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    await this.deviceRepository.update(id, updateDeviceDto);
    return this.findOne(id) as Promise<Device>;
  }

  async remove(id: number): Promise<void> {
    await this.deviceRepository.delete(id);
  }

  async checkAllStatus(): Promise<DeviceStatusDto[]> {
    const devices = await this.findAll();
    const results = await Promise.all(
      devices.map(async (device) => {
        const isOnline = await this.ping(device.ipAddress);
        return { id: device.id, isOnline };
      }),
    );
    return results;
  }

  private async ping(ip: string): Promise<boolean> {
    try {
      let cmd = '';
      const platform = os.platform();
      
      if (platform === 'win32') {
        cmd = `ping -n 1 -w 1000 ${ip}`;
      } else if (platform === 'darwin') {
        cmd = `ping -c 1 -W 1000 ${ip}`;
      } else {
        cmd = `ping -c 1 -W 2 ${ip}`;
      }
      
      await execPromise(cmd);
      return true;
    } catch (e) {
      this.logger.debug(`Ping failed for ${ip}: ${e.message}`);
      return false;
    }
  }
}
