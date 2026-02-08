<template>
  <el-card shadow="never" class="!border-none !rounded-lg shadow-sm dark:bg-gray-800 dark:text-gray-200">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="font-bold text-gray-700 dark:text-gray-200">设备列表</span>
          <el-button size="small" :loading="isCheckingStatus" @click="$emit('refresh')" type="primary" plain>
            <template #icon>
              <div class="i-ep-refresh w-4 h-4" />
            </template>
            刷新状态
          </el-button>
        </div>
        <el-button type="primary" @click="$emit('add')">
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
                statuses[row.id]
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
        <template #default="{ row }">
          <div class="flex justify-end gap-2">
            <el-tooltip content="发送唤醒包 (WOL)" placement="top">
              <el-button size="small" type="primary" plain @click="$emit('wake', row)">
                <template #icon>
                  <div class="i-ep-video-play w-4 h-4" />
                </template>
              </el-button>
            </el-tooltip>
            <el-button size="small" plain @click="$emit('edit', row)">
              <template #icon>
                <div class="i-ep-edit w-4 h-4" />
              </template>
            </el-button>
            <el-button size="small" type="danger" plain @click="$emit('delete', row)">
              <template #icon>
                <div class="i-ep-delete w-4 h-4" />
              </template>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import type { Device } from '../api/WolServiceProxies';

defineProps<{
  devices: Device[];
  statuses: Record<number, boolean>;
  isCheckingStatus: boolean;
}>();

defineEmits<{
  (e: 'refresh'): void;
  (e: 'add'): void;
  (e: 'wake', device: Device): void;
  (e: 'edit', device: Device): void;
  (e: 'delete', device: Device): void;
}>();

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.info('MAC 地址已复制');
  });
}
</script>
