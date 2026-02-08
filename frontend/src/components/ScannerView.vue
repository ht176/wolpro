<template>
  <el-card shadow="never" class="!border-none !rounded-lg shadow-sm dark:bg-gray-800">
    <div
      class="flex flex-col items-center justify-center py-10"
      v-if="!isScanning && scannedDevices.length === 0"
    >
      <div class="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-full mb-6">
        <div class="i-ep-search w-12 h-12 text-blue-500 inline-block" />
      </div>
      <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">局域网设备扫描</h3>
      <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
        点击下方按钮开始扫描局域网内的所有在线设备。扫描过程可能需要几秒钟。
      </p>
      <el-button type="primary" size="large" @click="$emit('scan')" class="px-8"> 开始扫描 </el-button>
    </div>

    <div v-else>
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 m-0">扫描结果</h3>
          <el-tag
            v-if="isScanning"
            type="warning"
            effect="dark"
            class="animate-pulse flex items-center"
          >
            <div class="i-ep-loading w-4 h-4 mr-1 animate-spin inline-block" />
            正在扫描...
          </el-tag>
          <el-tag v-else type="success" effect="plain">
            扫描完成，发现 {{ scannedDevices.length }} 个设备
          </el-tag>
        </div>
        <el-button v-if="!isScanning" @click="$emit('scan')" plain>
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
              @click="$emit('save', scope.row)"
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
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ScannedDevice } from '../stores/deviceStore';
import type { Device } from '../api/WolServiceProxies';

const props = defineProps<{
  scannedDevices: ScannedDevice[];
  isScanning: boolean;
  savedDevices: Device[];
}>();

defineEmits<{
  (e: 'scan'): void;
  (e: 'save', device: ScannedDevice): void;
}>();

const mergedScannedDevices = computed(() => {
  const savedMacs = new Set(props.savedDevices.map((d) => d.macAddress));
  return props.scannedDevices.map((d) => ({
    ...d,
    isSaved: savedMacs.has(d.mac),
  }));
});
</script>
