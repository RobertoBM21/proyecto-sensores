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
  const url = new URL(config.getDevicesActivityUrl);
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

// Resetea la página y vuelve a buscar (utilizado por el botón de búsqueda)
const searchDevicesWithReset = async () => {
  search.resetPage();
  await searchDevices();
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
  <form @submit.prevent="searchDevicesWithReset">
    <div class="grid grid-cols-1 md:grid-cols-[0.5fr,1fr,auto] gap-4 items-end">
      <!-- Date Range Selector -->
      <fieldset>
        <DateRangeSelector ref="dateRangeSelectorRef" storeName="devices" />
      </fieldset>

      <!-- Server Selector -->
      <fieldset>
        <ServerSelector storeName="devices" />
      </fieldset>

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
