import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Device } from './entities/device.entity';
import { DeviceStatusDto } from './dto/device-status.dto';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new device' })
  @ApiOkResponse({ type: Device })
  create(@Body() createDeviceDto: CreateDeviceDto): Promise<Device> {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all devices' })
  @ApiOkResponse({ type: [Device] })
  findAll(): Promise<Device[]> {
    return this.devicesService.findAll();
  }

  @Get('status')
  @ApiOperation({ summary: 'Check online status of all devices' })
  @ApiOkResponse({ type: [DeviceStatusDto] })
  checkStatus(): Promise<DeviceStatusDto[]> {
    return this.devicesService.checkAllStatus();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a device by ID' })
  @ApiOkResponse({ type: Device })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Device | null> {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a device' })
  @ApiOkResponse({ type: Device })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<Device> {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a device' })
  @ApiOkResponse({ description: 'Device deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.devicesService.remove(id);
  }
}
