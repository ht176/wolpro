import { defineStore } from 'pinia';
import { io, type Socket } from 'socket.io-client';
import { ElMessage } from 'element-plus';

export interface ScannedDevice {
  ip: string;
  mac: string;
  hostname?: string;
  vendor?: string;
  isSaved?: boolean;
}

interface ScanState {
  scannedDevices: ScannedDevice[];
  isScanning: boolean;
  socket: Socket | null;
}

export const useScanStore = defineStore('scan', {
  state: (): ScanState => ({
    scannedDevices: [],
    isScanning: false,
    socket: null,
  }),
  actions: {
    initSocket() {
      if (this.socket) return;
      this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000');
      
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      this.socket.on('scan:status', (data: { status: string; message?: string }) => {
        if (data.status === 'scanning') {
          this.isScanning = true;
          this.scannedDevices = [];
        } else {
          this.isScanning = false;
          if (data.status === 'error') {
            ElMessage.error(data.message || '扫描失败');
          } else {
             ElMessage.success('扫描完成');
          }
        }
      });

      this.socket.on('scan:result', (devices: ScannedDevice[]) => {
        this.scannedDevices = devices;
      });
    },
    startScan() {
      if (!this.socket) this.initSocket();
      this.socket?.emit('scan:start');
    }
  },
});
