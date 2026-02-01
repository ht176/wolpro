import { defineStore } from 'pinia';
import api from '../api';
import { io } from 'socket.io-client';
import { ElMessage } from 'element-plus';

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: [],
    scannedDevices: [],
    isScanning: false,
    socket: null,
  }),
  actions: {
    async fetchDevices() {
      try {
        const response = await api.get('/devices');
        this.devices = response.data;
      } catch (error) {
        ElMessage.error('Failed to fetch devices');
      }
    },
    async addDevice(device) {
      try {
        await api.post('/devices', device);
        await this.fetchDevices();
        ElMessage.success('Device added');
      } catch (error) {
        ElMessage.error('Failed to add device');
      }
    },
    async updateDevice(id, device) {
      try {
        await api.patch(`/devices/${id}`, device);
        await this.fetchDevices();
        ElMessage.success('Device updated');
      } catch (error) {
        ElMessage.error('Failed to update device');
      }
    },
    async deleteDevice(id) {
      try {
        await api.delete(`/devices/${id}`);
        await this.fetchDevices();
        ElMessage.success('Device deleted');
      } catch (error) {
        ElMessage.error('Failed to delete device');
      }
    },
    async wakeDevice(macAddress) {
      try {
        await api.post('/wol', { macAddress });
        ElMessage.success(`Magic packet sent to ${macAddress}`);
      } catch (error) {
        ElMessage.error('Failed to wake device');
      }
    },
    initSocket() {
      if (this.socket) return;
      this.socket = io('http://localhost:3000');
      
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      this.socket.on('scan:status', (data) => {
        if (data.status === 'scanning') {
          this.isScanning = true;
          this.scannedDevices = [];
        } else {
          this.isScanning = false;
          if (data.status === 'error') {
            ElMessage.error(data.message || 'Scan failed');
          } else {
             ElMessage.success('Scan completed');
          }
        }
      });

      this.socket.on('scan:result', (devices) => {
        // Filter out devices that are already saved (by mac)
        const savedMacs = new Set(this.devices.map(d => d.macAddress));
        this.scannedDevices = devices.map(d => ({
            ...d,
            isSaved: savedMacs.has(d.mac)
        }));
      });
    },
    startScan() {
      if (!this.socket) this.initSocket();
      this.socket.emit('scan:start');
    }
  },
});
