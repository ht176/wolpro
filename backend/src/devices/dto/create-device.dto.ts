import { IsNotEmpty, IsIP, IsMACAddress, IsOptional, IsString } from 'class-validator';

export class CreateDeviceDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsIP()
  ipAddress: string;

  @IsMACAddress()
  macAddress: string;

  @IsOptional()
  @IsString()
  notes: string;
}

