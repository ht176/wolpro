import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  ipAddress: string;

  @Column({ unique: true })
  macAddress: string;

  @Column({ nullable: true })
  notes: string;
}