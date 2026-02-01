import { IsMACAddress, IsNotEmpty } from 'class-validator';

export class WakeDeviceDto {
  @IsNotEmpty()
  @IsMACAddress()
  macAddress: string;
}
