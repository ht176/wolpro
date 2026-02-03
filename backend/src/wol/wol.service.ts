import { Injectable } from '@nestjs/common';
import { WakeDeviceDto } from './dto/wake-device.dto';
import * as wol from 'wake_on_lan';

@Injectable()
export class WolService {
  wake(wakeDeviceDto: WakeDeviceDto): Promise<void> {
    return new Promise((resolve, reject) => {
      wol.wake(wakeDeviceDto.macAddress, (error: Error | null) => {
        if (error) {
          return reject(error);
        }
        resolve();
      });
    });
  }
}
