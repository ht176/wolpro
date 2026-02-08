import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ScanService } from './scan.service';

const SCAN_EVENTS = {
  START: 'scan:start',
  STATUS: 'scan:status',
  RESULT: 'scan:result',
};

const SCAN_STATUS = {
  SCANNING: 'scanning',
  COMPLETED: 'completed',
  ERROR: 'error',
};

@WebSocketGateway({
  namespace: '/',
  cors: {
    origin: '*',
  },
})
export class ScanGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly scanService: ScanService) {}

  @SubscribeMessage(SCAN_EVENTS.START)
  async handleScan(_client: any, _payload: any): Promise<void> {
    this.server.emit(SCAN_EVENTS.STATUS, { status: SCAN_STATUS.SCANNING });

    try {
      const devices = await this.scanService.scanNetwork();
      this.server.emit(SCAN_EVENTS.RESULT, devices);
      this.server.emit(SCAN_EVENTS.STATUS, { status: SCAN_STATUS.COMPLETED });
    } catch (error) {
      this.server.emit(SCAN_EVENTS.STATUS, {
        status: SCAN_STATUS.ERROR,
        message: (error as Error).message,
      });
    }
  }
}
