import { Controller, Post, Body } from '@nestjs/common';
import { WolService } from './wol.service';
import { WakeDeviceDto } from './dto/wake-device.dto';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('wol')
@Controller('wol')
export class WolController {
  constructor(private readonly wolService: WolService) {}

  @Post()
  @ApiOperation({ summary: 'Send WOL magic packet to a device' })
  @ApiOkResponse({ description: 'Magic packet sent successfully' })
  wake(@Body() wakeDeviceDto: WakeDeviceDto): Promise<void> {
    return this.wolService.wake(wakeDeviceDto);
  }
}
