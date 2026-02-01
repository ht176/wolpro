import { Module } from '@nestjs/common';
import { ScanGateway } from './scan.gateway';
import { ScanService } from './scan.service';

@Module({
  providers: [ScanGateway, ScanService],
  exports: [ScanService],
})
export class ScanModule {}
