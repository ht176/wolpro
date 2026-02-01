import { defineStore } from 'pinia';
import api from '../api';
import { io, type Socket } from 'socket.io-client';
import { ElMessage } from 'element-plus';

export interface Device {
  id: number;
  name: string;
  ipAddress: string;
  macAddress: string;
  notes: string;
}

export interface ScannedDevice {
  ip: string;
  mac: string;
  hostname?: string;
  vendor?: string;
  isSaved?: boolean;
}

interface DeviceState {
  devices: Device[];
  scannedDevices: ScannedDevice[];
  isScanning: boolean;
  socket: Socket | null;
  deviceStatuses: Record<number, boolean>;
}

export const useDeviceStore = defineStore('device', {
  state: (): DeviceState => ({
    devices: [],
    scannedDevices: [],
    isScanning: false,
    socket: null,
    deviceStatuses: {},
  }),
  actions: {
    async fetchDevices() {
      try {
        const response = await api.get<Device[]>('/devices');
        this.devices = response.data;
      } catch (error) {
        ElMessage.error('获取设备列表失败');
      }
    },
    async checkDeviceStatuses() {
      try {
        const response = await api.get<{ id: number; isOnline: boolean }[]>('/devices/status');
        this.deviceStatuses = response.data.reduce((acc, curr) => {
          acc[curr.id] = curr.isOnline;
          return acc;
        }, {} as Record<number, boolean>);
      } catch (error) {
        console.error('检查在线状态失败', error);
      }
    },
    async addDevice(device: Partial<Device>) {
      try {
        await api.post('/devices', device);
        await this.fetchDevices();
        ElMessage.success('设备已添加');
      } catch (error: any) {
        const message = error.response?.data?.message;
        const errorText = Array.isArray(message) ? message.join(', ') : (message || '添加设备失败');
        ElMessage.error(errorText);
        throw error;
      }
    },
    async updateDevice(id: number, device: Partial<Device>) {
      try {
        await api.patch(`/devices/${id}`, device);
        await this.fetchDevices();
        ElMessage.success('设备已更新');
      } catch (error: any) {
        const message = error.response?.data?.message;
        const errorText = Array.isArray(message) ? message.join(', ') : (message || '更新设备失败');
        ElMessage.error(errorText);
        throw error;
      }
    },
    async deleteDevice(id: number) {
      try {
        await api.delete(`/devices/${id}`);
        await this.fetchDevices();
        ElMessage.success('设备已删除');
      } catch (error) {
        ElMessage.error('删除设备失败');
      }
    },
    async wakeDevice(macAddress: string) {
      try {
        await api.post('/wol', { macAddress });
        ElMessage.success(`已向 ${macAddress} 发送唤醒包`);
      } catch (error) {
        ElMessage.error('唤醒请求失败');
      }
    },
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
        const savedMacs = new Set(this.devices.map(d => d.macAddress));
        this.scannedDevices = devices.map(d => ({
            ...d,
            isSaved: savedMacs.has(d.mac)
        }));
      });
    },
    startScan() {
      if (!this.socket) this.initSocket();
      this.socket?.emit('scan:start');
    }
  },
});