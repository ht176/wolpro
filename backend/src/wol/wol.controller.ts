import { Controller, Post, Body } from '@nestjs/common';
import { WolService } from './wol.service';
import { WakeDeviceDto } from './dto/wake-device.dto';

@Controller('wol')
export class WolController {
  constructor(private readonly wolService: WolService) {}

  @Post()
  wake(@Body() wakeDeviceDto: WakeDeviceDto) {
    return this.wolService.wake(wakeDeviceDto);
  }
}

