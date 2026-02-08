import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'
import { ElMessage } from 'element-plus'

export interface ScannedDevice {
  ip: string
  mac: string
  hostname?: string
  vendor?: string
  isSaved?: boolean
}

interface ScanState {
  scannedDevices: ScannedDevice[]
  isScanning: boolean
  socket: Socket | null
}

export const useScanStore = defineStore('scan', {
  state: (): ScanState => ({
    scannedDevices: [],
    isScanning: false,
    socket: null,
  }),
  actions: {
    initSocket(): void {
      if (this.socket?.connected) return
      
      const url: string = import.meta.env.VITE_API_URL || ''
      this.socket = io(url, {
        transports: ['websocket'],
        path: '/socket.io',
      })

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket')
      })

      this.socket.on('connect_error', (error: Error) => {
        console.error('Socket connection error:', error)
        ElMessage.error('无法连接到服务器，请检查后端状态')
      })

      this.socket.on('scan:status', (data: { status: string; message?: string }) => {
        if (data.status === 'scanning') {
          this.isScanning = true
          this.scannedDevices = []
        } else {
          this.isScanning = false
          if (data.status === 'error') {
            ElMessage.error(data.message || '扫描失败')
          } else if (data.status === 'completed') {
            ElMessage.success('扫描完成')
          }
        }
      })

      this.socket.on('scan:result', (devices: ScannedDevice[]) => {
        this.scannedDevices = devices || []
      })
    },
    startScan(): void {
      if (!this.socket?.connected) this.initSocket()
      this.socket?.emit('scan:start')
    },
    disconnect(): void {
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
        this.isScanning = false
      }
    }
  },
})
