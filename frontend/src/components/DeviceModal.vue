<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑设备' : '添加设备'"
    width="500px"
    @close="resetForm"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="设备名称">
        <el-input v-model.trim="form.name" placeholder="例如：客厅电视" />
      </el-form-item>
      <el-form-item label="IP 地址">
        <el-input v-model.trim="form.ipAddress" placeholder="192.168.1.100" />
      </el-form-item>
      <el-form-item label="MAC 地址">
        <el-input v-model.trim="form.macAddress" placeholder="AA:BB:CC:DD:EE:FF" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model.trim="form.notes" type="textarea" placeholder="可选备注信息" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, type WritableComputedRef, type ComputedRef } from 'vue'
import { Device, CreateDeviceDto } from '../api/WolServiceProxies'

// Props 定义
const props = defineProps<{
  modelValue: boolean
  device: Partial<Device> | null
}>()

// Emits 定义
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', value: CreateDeviceDto): void
}>()

// 双向绑定显示状态
const visible: WritableComputedRef<boolean> = computed({
  get: (): boolean => props.modelValue,
  set: (val: boolean): void => emit('update:modelValue', val),
})

// 是否为编辑模式
const isEdit: ComputedRef<boolean> = computed((): boolean => !!props.device)

// 表单数据
const form = ref<CreateDeviceDto>(
  new CreateDeviceDto({
    name: '',
    ipAddress: '',
    macAddress: '',
    notes: '',
  }),
)

// 监听 device 属性变化，更新表单
watch(
  () => props.device,
  (val: Partial<Device> | null): void => {
    if (val) {
      form.value = new CreateDeviceDto({
        name: val.name ?? '',
        ipAddress: val.ipAddress ?? '',
        macAddress: val.macAddress ?? '',
        notes: val.notes ?? '',
      })
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

// 重置表单
function resetForm(): void {
  if (!props.device) {
    form.value = new CreateDeviceDto({
      name: '',
      ipAddress: '',
      macAddress: '',
      notes: '',
    })
  }
}

// 提交表单
function submit(): void {
  emit('submit', form.value)
}
</script>
