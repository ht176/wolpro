import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './devices/entities/device.entity';
import { DevicesModule } from './devices/devices.module';
import { WolModule } from './wol/wol.module';
import { ScanModule } from './scan/scan.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_PATH || 'db.sqlite',
      entities: [Device],
      synchronize: true,
    }),
    DevicesModule,
    WolModule,
    ScanModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

