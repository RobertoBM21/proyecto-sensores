<script setup>
// Layout components
import DateRangeSelector from "./DateRangeSelector.vue";
import ServerSelector from "./ServerSelector.vue";

// UI components
import { Button } from "@/components/ui/button";

// Store
import { useConfigStore } from "../stores/config";
import { useDevicesStore } from "../stores/devices";

// Utilities
import { ref } from "vue";

// Store initialization
const config = useConfigStore();
const search = useDevicesStore();
const apiUrl = config.getApiUrl;
const dateRangeSelectorRef = ref(null);

// Methods
const buildParams = () => {
  return {
    ...(search.filters.selectedServers.length > 0 && {
      serverIds: search.filters.selectedServers.join(","),
    }),
    ...(search.filters.startDate && { startDate: search.filters.startDate }),
    ...(search.filters.endDate && { endDate: search.filters.endDate }),
    ...(search.filters.dateRange && { dateRange: search.filters.dateRange }),
  };
};

const fetchData = async (params = {}) => {
  const url = new URL(`${apiUrl}/devices/activity`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};

const searchDevices = async () => {
  try {
    const baseParams = buildParams();
    const searchData = await fetchData({
      ...baseParams,
      page: search.filters.page,
      limit: search.filters.limit,
    });

    search.updateSearchResults(searchData);
  } catch (error) {
    console.error("Error fetching devices:", error);
    search.clearResults();
  }
};

const clearFilters = () => {
  // Reset child components
  if (dateRangeSelectorRef.value) {
    dateRangeSelectorRef.value.clearAll();
  }

  // Reset store
  search.resetFilters();
};

defineExpose({ searchDevices });
</script>

<template>
  <form @submit.prevent="searchDevices">
    <div class="grid grid-cols-1 md:grid-cols-[2fr,1fr,auto] gap-4 items-end">
      <!-- Date Range Selector -->
      <div class="w-full">
        <DateRangeSelector ref="dateRangeSelectorRef" storeName="devices" />
      </div>

      <!-- Server Selector -->
      <div class="w-full">
        <ServerSelector storeName="devices" />
      </div>

      <!-- Action Buttons -->
      <div class="flex items-end justify-end gap-4 md:ml-auto">
        <Button type="button" variant="secondary" @click="clearFilters">
          Limpiar Filtros
        </Button>
        <Button type="submit">Buscar</Button>
      </div>
    </div>
  </form>
</template>
