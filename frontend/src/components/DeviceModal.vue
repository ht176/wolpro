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
import { ref, watch, computed } from 'vue';
import type { Device } from '../stores/deviceStore';

const props = defineProps<{
  modelValue: boolean;
  device: Partial<Device> | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', value: Partial<Device>): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.device);

const form = ref<Partial<Device>>({
  name: '',
  ipAddress: '',
  macAddress: '',
  notes: '',
});

watch(
  () => props.device,
  (val) => {
    if (val) {
      form.value = { ...val };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  if (!props.device) {
    form.value = {
      name: '',
      ipAddress: '',
      macAddress: '',
      notes: '',
    };
  }
}

function submit() {
  emit('submit', form.value);
}
</script>
