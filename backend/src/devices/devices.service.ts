import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './entities/device.entity';
import { exec } from 'child_process';
import * as util from 'util';
import * as os from 'os';

const execPromise = util.promisify(exec);

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  create(createDeviceDto: CreateDeviceDto) {
    return this.deviceRepository.save(createDeviceDto);
  }

  findAll() {
    return this.deviceRepository.find();
  }

  findOne(id: number) {
    return this.deviceRepository.findOne({ where: { id } });
  }

  update(id: number, updateDeviceDto: UpdateDeviceDto) {
    return this.deviceRepository.update(id, updateDeviceDto);
  }

  remove(id: number) {
    return this.deviceRepository.delete(id);
  }

  async checkAllStatus(): Promise<{ id: number; isOnline: boolean }[]> {
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
      if (os.platform() === 'win32') {
        // Windows: -n 1 (count), -w 1000 (timeout in ms)
        cmd = `ping -n 1 -w 1000 ${ip}`;
      } else if (os.platform() === 'darwin') {
        // MacOS: -c 1 (count), -W 1000 (timeout in ms)
        cmd = `ping -c 1 -W 1000 ${ip}`;
      } else {
        // Linux: -c 1 (count), -W 1 (timeout in seconds)
        cmd = `ping -c 1 -W 1 ${ip}`;
      }
      await execPromise(cmd);
      return true;
    } catch {
      return false;
    }
  }
}
