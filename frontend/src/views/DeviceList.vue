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
          <!-- Stats Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div
              v-for="(stat, index) in statsCards"
              :key="index"
              class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-shadow hover:shadow-md cursor-pointer"
              @click="stat.onClick && stat.onClick()"
            >
              <div>
                <div class="text-gray-500 dark:text-gray-400 text-sm mb-1">
                  {{ stat.label }}
                </div>
                <div class="text-2xl font-bold" :class="stat.valueClass || 'text-gray-800 dark:text-gray-100'">
                  <span v-if="stat.link" class="text-base font-medium text-blue-600 dark:text-blue-400">{{
                    stat.value
                  }}</span>
                  <span v-else>{{ stat.value }}</span>
                </div>
              </div>
              <div class="p-3 rounded-full" :class="stat.iconBgClass">
                <div :class="[stat.iconClass, 'w-6 h-6 inline-block']" />
              </div>
            </div>
          </div>

          <!-- Device Table -->
          <el-card shadow="never" class="!border-none !rounded-lg shadow-sm dark:bg-gray-800 dark:text-gray-200">
            <template #header>
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-gray-700 dark:text-gray-200">设备列表</span>
                  <el-button size="small" :loading="isCheckingStatus" @click="handleCheckStatus" type="primary" plain>
                    <template #icon>
                      <div class="i-ep-refresh w-4 h-4" />
                    </template>
                    刷新状态
                  </el-button>
                </div>
                <el-button type="primary" @click="openAddModal">
                  <template #icon>
                    <div class="i-ep-plus w-4 h-4" />
                  </template>
                  添加设备
                </el-button>
              </div>
            </template>

            <el-table :data="devices" style="width: 100%" size="large">
              <el-table-column prop="name" label="设备名称" min-width="150">
                <template #default="{ row }">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-2.5 h-2.5 rounded-full transition-colors duration-300"
                      :class="
                        deviceStatuses[row.id]
                          ? 'bg-green-500 shadow-[0_0_4px_#22c55e]'
                          : 'bg-gray-300 dark:bg-gray-600'
                      "
                    ></div>
                    <span class="font-medium text-gray-800 dark:text-gray-200">{{ row.name }}</span>
                  </div>
                </template>
              </el-table-column>

              <el-table-column prop="ipAddress" label="IP 地址" width="160" />

              <el-table-column prop="macAddress" label="MAC 地址" width="180">
                <template #default="{ row }">
                  <el-tooltip content="点击复制" placement="top">
                    <span
                      class="font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded cursor-pointer hover:text-blue-500 transition-colors"
                      @click="copyToClipboard(row.macAddress)"
                    >
                      {{ row.macAddress }}
                    </span>
                  </el-tooltip>
                </template>
              </el-table-column>

              <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />

              <el-table-column label="操作" width="200" fixed="right" align="right">
                <template #default="scope">
                  <div class="flex justify-end gap-2">
                    <el-tooltip content="发送唤醒包 (WOL)" placement="top">
                      <el-button size="small" type="primary" plain @click="handleWake(scope.row)">
                        <template #icon>
                          <div class="i-ep-video-play w-4 h-4" />
                        </template>
                      </el-button>
                    </el-tooltip>
                    <el-button size="small" plain @click="openEditModal(scope.row)">
                      <template #icon>
                        <div class="i-ep-edit w-4 h-4" />
                      </template>
                    </el-button>
                    <el-button size="small" type="danger" plain @click="handleDelete(scope.row)">
                      <template #icon>
                        <div class="i-ep-delete w-4 h-4" />
                      </template>
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- Scanner View -->
        <div v-else-if="activeTab === 'scanner'" class="animate-fade-in">
          <el-card shadow="never" class="!border-none !rounded-lg shadow-sm dark:bg-gray-800">
            <div
              class="flex flex-col items-center justify-center py-10"
              v-if="!scanStore.isScanning && scanStore.scannedDevices.length === 0"
            >
              <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
                <div class="i-ep-search w-12 h-12 text-blue-500 inline-block" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">局域网设备扫描</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
                点击下方按钮开始扫描局域网内的所有在线设备。扫描过程可能需要几秒钟。
              </p>
              <el-button type="primary" size="large" @click="handleScan" class="px-8"> 开始扫描 </el-button>
            </div>

            <div v-else>
              <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                  <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 m-0">扫描结果</h3>
                  <el-tag
                    v-if="scanStore.isScanning"
                    type="warning"
                    effect="dark"
                    class="animate-pulse flex items-center"
                  >
                    <div class="i-ep-loading w-4 h-4 mr-1 animate-spin inline-block" />
                    正在扫描...
                  </el-tag>
                  <el-tag v-else type="success" effect="plain">
                    扫描完成，发现 {{ scanStore.scannedDevices.length }} 个设备
                  </el-tag>
                </div>
                <el-button v-if="!scanStore.isScanning" @click="handleScan" plain>
                  <template #icon>
                    <div class="i-ep-refresh w-4 h-4" />
                  </template>
                  重新扫描
                </el-button>
              </div>

              <el-table :data="mergedScannedDevices" style="width: 100%" stripe>
                <el-table-column prop="ip" label="IP 地址" width="180" />
                <el-table-column prop="mac" label="MAC 地址" width="180">
                  <template #default="{ row }">
                    <span class="font-mono text-gray-600 dark:text-gray-400">{{ row.mac }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="vendor" label="厂商/主机名" min-width="150">
                  <template #default="{ row }">
                    {{ row.hostname || row.vendor || 'Unknown' }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="120">
                  <template #default="scope">
                    <el-tag v-if="scope.row.isSaved" type="success" effect="light" round>已保存</el-tag>
                    <el-tag v-else type="info" effect="light" round>新发现</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right" align="right">
                  <template #default="scope">
                    <el-button
                      v-if="!scope.row.isSaved"
                      size="small"
                      type="primary"
                      plain
                      @click="addScannedDevice(scope.row)"
                    >
                      <div class="flex items-center">
                        <div class="i-ep-plus w-3 h-3 mr-1 inline-block" />
                        <span>保存</span>
                      </div>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>

    <DeviceModal v-model="showModal" :device="currentDevice" @submit="handleModalSubmit" />
  </el-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useScanStore, type ScannedDevice } from '../stores/deviceStore'
import DeviceModal from '../components/DeviceModal.vue'
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
  if (!devices.value) return 0
  return devices.value.filter((d) => deviceStatuses.value[d.id]).length
})

const statsCards = computed(() => [
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

const mergedScannedDevices = computed(() => {
  const savedMacs = new Set(devices.value.map((d) => d.macAddress))
  return scanStore.scannedDevices.map((d) => ({
    ...d,
    isSaved: savedMacs.has(d.mac),
  }))
})

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
async function fetchDevices() {
  try {
    const res = await devicesClient.devicesController_findAll()
    devices.value = res || []
  } catch (e) {
    ElMessage.error('获取设备列表失败')
  }
}

async function handleCheckStatus() {
  isCheckingStatus.value = true
  try {
    const statuses = await devicesClient.devicesController_checkStatus()
    if (Array.isArray(statuses)) {
      deviceStatuses.value = statuses.reduce((acc: any, curr: any) => {
        acc[curr.id] = curr.isOnline
        return acc
      }, {})
    } else {
      deviceStatuses.value = {}
    }
  } catch (e) {
    console.error(e)
  }
  isCheckingStatus.value = false
}

async function handleWake(device: Device) {
  try {
    const dto = new WakeDeviceDto({ macAddress: device.macAddress })
    await wolClient.wolController_wake(dto)
    ElMessage.success(`已向 ${device.name} 发送唤醒包`)
  } catch (e) {
    ElMessage.error('唤醒信号发送失败')
  }
}

async function handleDelete(device: Device) {
  ElMessageBox.confirm(`确定要删除设备 "${device.name}" 吗?`, '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
  }).then(async () => {
    try {
      await devicesClient.devicesController_remove(device.id.toString())
      await fetchDevices()
      ElMessage.success('设备已删除')
    } catch (e) {
      ElMessage.error('删除设备失败')
    }
  })
}

async function handleModalSubmit(formData: Partial<Device>) {
  try {
    if (currentDevice.value && currentDevice.value.id) {
      const dto = new UpdateDeviceDto(formData)
      await devicesClient.devicesController_update(currentDevice.value.id.toString(), dto)
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
function toggleDark(force?: boolean) {
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

function handleSelect(key: string) {
  activeTab.value = key
}

function handleScan() {
  if (activeTab.value !== 'scanner') {
    activeTab.value = 'scanner'
  }
  scanStore.startScan()
}

function openAddModal() {
  currentDevice.value = null
  showModal.value = true
}

function openEditModal(device: Device) {
  currentDevice.value = { ...device }
  showModal.value = true
}

function addScannedDevice(scanned: ScannedDevice) {
  currentDevice.value = new Device({
    name: scanned.hostname || '新设备',
    ipAddress: scanned.ip,
    macAddress: scanned.mac,
    notes: '',
  } as any)
  showModal.value = true
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.info('MAC 地址已复制')
  })
}
</script>

<style>
/* Global overrides handled by UnoCSS mostly */
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
