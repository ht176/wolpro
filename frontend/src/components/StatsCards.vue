<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
    <div
      v-for="(stat, index) in stats"
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
</template>

<script setup lang="ts">
export interface StatItem {
  label: string;
  value: string | number;
  iconClass: string;
  iconBgClass: string;
  valueClass?: string;
  link?: boolean;
  onClick?: () => void;
}

defineProps<{
  stats: StatItem[];
}>();
</script>
