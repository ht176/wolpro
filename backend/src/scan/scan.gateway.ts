import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ScanService } from './scan.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ScanGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly scanService: ScanService) {}

  @SubscribeMessage('scan:start')
  async handleScan(_client: any, _payload: any): Promise<void> {
    this.server.emit('scan:status', { status: 'scanning' });

    try {
      const devices = await this.scanService.scanNetwork();
      this.server.emit('scan:result', devices);
      this.server.emit('scan:status', { status: 'completed' });
    } catch (error) {
      this.server.emit('scan:status', {
        status: 'error',
        message: (error as Error).message,
      });
    }
  }
}
