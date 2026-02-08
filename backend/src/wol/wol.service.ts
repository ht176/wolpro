import { Injectable, Logger } from '@nestjs/common';
import { WakeDeviceDto } from './dto/wake-device.dto';
import * as wol from 'wake_on_lan';

@Injectable()
export class WolService {
  private readonly logger = new Logger(WolService.name);

  wake(wakeDeviceDto: WakeDeviceDto): Promise<void> {
    this.logger.log(`Attempting to wake device: ${wakeDeviceDto.macAddress}`);
    return new Promise((resolve, reject) => {
      wol.wake(wakeDeviceDto.macAddress, (error: Error | null) => {
        if (error) {
          this.logger.error(`Failed to send magic packet: ${error.message}`);
          return reject(error);
        }
        this.logger.log(`Magic packet sent to ${wakeDeviceDto.macAddress}`);
        resolve();
      });
    });
  }
}
