import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Device } from './entities/device.entity';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOkResponse({ type: Device })
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @ApiOkResponse({ type: [Device] })
  findAll() {
    return this.devicesService.findAll();
  }

  @Get('status')
  checkStatus() {
    // Return type is implied but usually complex to define for simple check
    return this.devicesService.checkAllStatus();
  }

  @Get(':id')
  @ApiOkResponse({ type: Device })
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: Device })
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(+id, updateDeviceDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: Device })
  remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }
}
