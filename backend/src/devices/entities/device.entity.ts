import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Device {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ unique: true })
  ipAddress: string;

  @ApiProperty()
  @Column({ unique: true })
  macAddress: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  notes: string;
}
