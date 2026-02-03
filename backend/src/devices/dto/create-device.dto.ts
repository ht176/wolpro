import {
  IsNotEmpty,
  IsIP,
  IsMACAddress,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({
    description: 'The name of the device',
    example: 'Living Room TV',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The IP address of the device',
    example: '192.168.1.100',
  })
  @IsIP()
  ipAddress: string;

  @ApiProperty({
    description: 'The MAC address of the device',
    example: 'AA:BB:CC:DD:EE:FF',
  })
  @IsMACAddress()
  macAddress: string;

  @ApiProperty({
    description: 'Optional notes about the device',
    required: false,
    example: 'Samsung 55 inch',
  })
  @IsOptional()
  @IsString()
  notes: string;
}
