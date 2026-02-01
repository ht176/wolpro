<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? 'Edit Device' : 'Add Device'"
    width="500px"
    @close="resetForm"
  >
    <el-form :model="form" label-width="120px">
      <el-form-item label="Name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="IP Address">
        <el-input v-model="form.ipAddress" />
      </el-form-item>
      <el-form-item label="MAC Address">
        <el-input v-model="form.macAddress" />
      </el-form-item>
      <el-form-item label="Notes">
        <el-input v-model="form.notes" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">Cancel</el-button>
        <el-button type="primary" @click="submit">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  device: Object,
});

const emit = defineEmits(['update:modelValue', 'submit']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const isEdit = computed(() => !!props.device);

const form = ref({
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
  visible.value = false;
}
</script>
