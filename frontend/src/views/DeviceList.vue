<template>
  <div class="device-list-container">
    <el-header class="header">
      <h2>WOL Manager</h2>
      <div class="actions">
        <el-button type="primary" :loading="store.isScanning" @click="handleScan">
          {{ store.isScanning ? 'Scanning...' : 'Scan Network' }}
        </el-button>
        <el-button type="success" @click="openAddModal">Add Device</el-button>
      </div>
    </el-header>

    <el-main>
      <!-- Saved Devices Section -->
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>Saved Devices</span>
          </div>
        </template>
        <el-table :data="store.devices" style="width: 100%" stripe>
          <el-table-column prop="name" label="Name" width="180" />
          <el-table-column prop="ipAddress" label="IP" width="150" />
          <el-table-column prop="macAddress" label="MAC" width="180" />
          <el-table-column prop="notes" label="Notes" />
          <el-table-column label="Actions" width="250" fixed="right">
            <template #default="scope">
              <el-button size="small" type="primary" @click="handleWake(scope.row)">Wake</el-button>
              <el-button size="small" @click="openEditModal(scope.row)">Edit</el-button>
              <el-button size="small" type="danger" @click="handleDelete(scope.row)">Delete</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Scanned Devices Section -->
      <el-card class="box-card" style="margin-top: 20px" v-if="store.scannedDevices.length > 0">
        <template #header>
          <div class="card-header">
            <span>Scanned Devices</span>
          </div>
        </template>
        <el-table :data="store.scannedDevices" style="width: 100%" stripe>
          <el-table-column prop="ip" label="IP" width="180" />
          <el-table-column prop="mac" label="MAC" width="180" />
          <el-table-column label="Status">
            <template #default="scope">
               <el-tag v-if="scope.row.isSaved" type="success">Saved</el-tag>
               <el-tag v-else type="info">New</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Actions" width="150" fixed="right">
            <template #default="scope">
              <el-button 
                v-if="!scope.row.isSaved" 
                size="small" 
                type="success" 
                @click="addScannedDevice(scope.row)"
              >
                Save
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-main>

    <DeviceModal
      v-model="showModal"
      :device="currentDevice"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDeviceStore } from '../stores/deviceStore';
import DeviceModal from '../components/DeviceModal.vue';
import { ElMessageBox } from 'element-plus';

const store = useDeviceStore();
const showModal = ref(false);
const currentDevice = ref(null);

onMounted(() => {
  store.fetchDevices();
  store.initSocket();
});

function handleScan() {
  store.startScan();
}

function handleWake(device) {
  store.wakeDevice(device.macAddress);
}

function handleDelete(device) {
  ElMessageBox.confirm(
    'Are you sure you want to delete this device?',
    'Warning',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(() => {
    store.deleteDevice(device.id);
  });
}

function openAddModal() {
  currentDevice.value = null;
  showModal.value = true;
}

function openEditModal(device) {
  currentDevice.value = device;
  showModal.value = true;
}

function addScannedDevice(scanned) {
  currentDevice.value = {
    name: 'New Device',
    ipAddress: scanned.ip,
    macAddress: scanned.mac,
    notes: ''
  };
  showModal.value = true;
}

function handleModalSubmit(formData) {
  if (currentDevice.value && currentDevice.value.id) {
    store.updateDevice(currentDevice.value.id, formData);
  } else {
    store.addDevice(formData);
  }
}
</script>

<style scoped>
.device-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
