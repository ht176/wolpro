<template>
  <el-container class="h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Sidebar -->
    <el-aside
      width="240px"
      class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-300"
    >
      <div class="h-16 flex items-center justify-center gap-3 border-b border-gray-200 dark:border-gray-700">
        <div class="i-ep-monitor text-blue-500 w-8 h-8 inline-block" />
        <h1 class="text-lg font-bold text-gray-800 dark:text-gray-100 m-0">WOL 管家</h1>
      </div>

      <el-menu :default-active="activeTab" class="border-none flex-1 bg-transparent" @select="handleSelect">
        <el-menu-item index="dashboard">
          <div class="i-ep-list w-5 h-5 mr-2 inline-block" />
          <span>设备列表</span>
        </el-menu-item>
        <el-menu-item index="scanner">
          <div class="i-ep-search w-5 h-5 mr-2 inline-block" />
          <span>网络扫描</span>
        </el-menu-item>
      </el-menu>

      <div class="p-4 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400">v1.1.0</div>
    </el-aside>

    <!-- Main Content -->
    <el-container>
      <!-- Header -->
      <el-header
        class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6 transition-colors duration-300"
      >
        <div class="text-lg font-medium text-gray-700 dark:text-gray-200">
          {{ activeTab === 'dashboard' ? '我的设备' : '局域网扫描' }}
        </div>

        <div class="flex items-center gap-4">
          <el-button circle plain @click="toggleDark()" class="!dark:bg-gray-700 !dark:text-gray-200">
            <div class="i-carbon-sun dark:i-carbon-moon w-5 h-5 inline-block" />
          </el-button>
        </div>
      </el-header>

      <el-main class="p-6 overflow-y-auto">
        <!-- Dashboard View -->
        <div v-if="activeTab === 'dashboard'" class="animate-fade-in">
          <StatsCards :stats="statsCards" />
          <DeviceTable
            :devices="devices"
            :statuses="deviceStatuses"
            :is-checking-status="isCheckingStatus"
            @refresh="handleCheckStatus"
            @add="openAddModal"
            @wake="handleWake"
            @edit="openEditModal"
            @delete="handleDelete"
          />
        </div>

        <!-- Scanner View -->
        <div v-else-if="activeTab === 'scanner'" class="animate-fade-in">
          <ScannerView
            :scanned-devices="scanStore.scannedDevices"
            :is-scanning="scanStore.isScanning"
            :saved-devices="devices"
            @scan="handleScan"
            @save="addScannedDevice"
          />
        </div>
      </el-main>
    </el-container>

    <DeviceModal v-model="showModal" :device="currentDevice" @submit="handleModalSubmit" />
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useScanStore, type ScannedDevice } from '../stores/deviceStore'
import DeviceModal from '../components/DeviceModal.vue'
import StatsCards, { type StatItem } from '../components/StatsCards.vue'
import DeviceTable from '../components/DeviceTable.vue'
import ScannerView from '../components/ScannerView.vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  DevicesServiceProxy,
  WolServiceProxy,
  WakeDeviceDto,
  CreateDeviceDto,
  UpdateDeviceDto,
  Device,
} from '../api/WolServiceProxies'

// --- State ---
const scanStore = useScanStore()
const activeTab = ref<string>('dashboard')
const showModal = ref<boolean>(false)
const currentDevice = ref<Partial<Device> | null>(null)
const isCheckingStatus = ref<boolean>(false)
const isDark = ref<boolean>(false)
const devices = ref<Device[]>([])
const deviceStatuses = ref<Record<number, boolean>>({})

// --- API Clients ---
const devicesClient = new DevicesServiceProxy()
const wolClient = new WolServiceProxy()

// --- Computed ---
const onlineDevicesCount = computed(() => {
  return devices.value.filter((d) => deviceStatuses.value[d.id]).length
})

const statsCards = computed<StatItem[]>(() => [
  {
    label: '设备总数',
    value: devices.value.length,
    iconClass: 'i-ep-monitor',
    iconBgClass: 'bg-blue-50 dark:bg-blue-900/30 text-blue-500',
    valueClass: 'text-gray-800 dark:text-gray-100',
  },
  {
    label: '在线设备',
    value: onlineDevicesCount.value,
    iconClass: 'i-ep-connection',
    iconBgClass: 'bg-green-50 dark:bg-green-900/30 text-green-500',
    valueClass: 'text-green-600 dark:text-green-400',
  },
  {
    label: '快速操作',
    value: '去扫描新设备 \u2192',
    link: true,
    iconClass: 'i-ep-search',
    iconBgClass: 'bg-purple-50 dark:bg-purple-900/30 text-purple-500',
    onClick: () => (activeTab.value = 'scanner'),
  },
])

// --- Lifecycle ---
onMounted(async () => {
  await fetchDevices()
  handleCheckStatus()
  scanStore.initSocket()

  // Init Dark Mode
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    toggleDark(true)
  }
})

// --- API Methods ---
async function fetchDevices(): Promise<void> {
  try {
    const res = await devicesClient.devicesController_findAll()
    devices.value = res || []
  } catch (e) {
    ElMessage.error('获取设备列表失败')
  }
}

async function handleCheckStatus(): Promise<void> {
  isCheckingStatus.value = true
  try {
    const statuses = await devicesClient.devicesController_checkStatus()
    if (Array.isArray(statuses)) {
      deviceStatuses.value = statuses.reduce((acc: Record<number, boolean>, curr: any) => {
        acc[curr.id] = curr.isOnline
        return acc
      }, {})
    }
  } catch (e) {
    console.error('Failed to check status:', e)
  } finally {
    isCheckingStatus.value = false
  }
}

async function handleWake(device: Device): Promise<void> {
  try {
    const dto = new WakeDeviceDto({ macAddress: device.macAddress })
    await wolClient.wolController_wake(dto)
    ElMessage.success(`已向 ${device.name} 发送唤醒包`)
  } catch (e) {
    ElMessage.error('唤醒信号发送失败')
  }
}

async function handleDelete(device: Device): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定要删除设备 "${device.name}" 吗?`, '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
    })
    
    await devicesClient.devicesController_remove(device.id)
    await fetchDevices()
    ElMessage.success('设备已删除')
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除设备失败')
    }
  }
}

async function handleModalSubmit(formData: Partial<Device>): Promise<void> {
  try {
    if (currentDevice.value && currentDevice.value.id) {
      const dto = new UpdateDeviceDto(formData)
      await devicesClient.devicesController_update(currentDevice.value.id, dto)
      ElMessage.success('设备已更新')
    } else {
      const dto = new CreateDeviceDto(formData as any)
      await devicesClient.devicesController_create(dto)
      ElMessage.success('设备已添加')
    }
    showModal.value = false
    await fetchDevices()
  } catch (e: any) {
    const msg = e.response?.data?.message || '操作失败'
    ElMessage.error(msg)
  }
}

// --- UI Methods ---
function toggleDark(force?: boolean): void {
  const html = document.documentElement
  const isCurrentlyDark = html.classList.contains('dark')
  const shouldBeDark = force !== undefined ? force : !isCurrentlyDark

  if (shouldBeDark) {
    html.classList.add('dark')
    isDark.value = true
  } else {
    html.classList.remove('dark')
    isDark.value = false
  }
}

function handleSelect(key: string): void {
  activeTab.value = key
}

function handleScan(): void {
  if (activeTab.value !== 'scanner') {
    activeTab.value = 'scanner'
  }
  scanStore.startScan()
}

function openAddModal(): void {
  currentDevice.value = null
  showModal.value = true
}

function openEditModal(device: Device): void {
  currentDevice.value = { ...device }
  showModal.value = true
}

function addScannedDevice(scanned: ScannedDevice): void {
  currentDevice.value = new Device({
    name: scanned.hostname || '新设备',
    ipAddress: scanned.ip,
    macAddress: scanned.mac,
    notes: '',
  } as any)
  showModal.value = true
}
</script>

<style>
.el-menu {
  border-right: none !important;
}

.el-menu-item.is-active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border-right: 3px solid var(--el-color-primary);
}

html.dark .el-menu-item.is-active {
  background-color: #1f2937;
  color: #60a5fa;
  border-right: 3px solid #60a5fa;
}

html.dark .el-menu-item:hover {
  background-color: #374151;
}
</style>