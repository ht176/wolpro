import { Injectable } from '@nestjs/common';
import { WakeDeviceDto } from './dto/wake-device.dto';
import * as wol from 'wake_on_lan';

@Injectable()
export class WolService {
  wake(wakeDeviceDto: WakeDeviceDto): Promise<void> {
    console.log(`[WOL] Attempting to wake device: ${wakeDeviceDto.macAddress}`);
    return new Promise((resolve, reject) => {
      wol.wake(wakeDeviceDto.macAddress, (error: Error | null) => {
        if (error) {
          console.error(`[WOL] Failed to send magic packet: ${error.message}`);
          return reject(error);
        }
        console.log(`[WOL] Magic packet sent to ${wakeDeviceDto.macAddress}`);
        resolve();
      });
    });
  }
}
