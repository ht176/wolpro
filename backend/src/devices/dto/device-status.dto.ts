import { ApiProperty } from '@nestjs/swagger';

export class DeviceStatusDto {
  @ApiProperty({ description: 'The ID of the device' })
  id: number;

  @ApiProperty({ description: 'Whether the device is online' })
  isOnline: boolean;
}
