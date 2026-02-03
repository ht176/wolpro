import { Controller, Post, Body } from '@nestjs/common';
import { WolService } from './wol.service';
import { WakeDeviceDto } from './dto/wake-device.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('wol')
@Controller('wol')
export class WolController {
  constructor(private readonly wolService: WolService) {}

  @Post()
  wake(@Body() wakeDeviceDto: WakeDeviceDto) {
    return this.wolService.wake(wakeDeviceDto);
  }
}
