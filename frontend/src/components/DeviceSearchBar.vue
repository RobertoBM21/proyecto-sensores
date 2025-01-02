<script setup>
// Componentes Vue
import DateRangeSelector from "./DateRangeSelector.vue";
import ServerSelector from "./ServerSelector.vue";
import AutoRefreshControl from "./AutoRefreshControl.vue";

// Componentes UI
import { Button } from "@/components/ui/button";

// Stores
import { useConfigStore } from "../stores/config";
import { useDevicesStore } from "../stores/devices";

// Utilidades y Referencias
import { ref } from "vue";
import { fetchWithAuth } from "../lib/http";

// Estado y Referencias
const config = useConfigStore();
const search = useDevicesStore();
const dateRangeSelectorRef = ref(null);

// Utilidades de búsqueda
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

  const response = await fetchWithAuth(url);
  const data = await response.json();

  if (!response.ok) {
    const error = {
      name:
        response.status === 404
          ? "NotFoundError"
          : response.status === 400
          ? "BadRequestError"
          : "Error",
      message: data.error,
    };
    throw error;
  }

  return data;
};

// Manejadores de búsqueda
const searchDevices = async () => {
  // Resetear errores previos
  search.clearError();

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
    search.updateError(error);
    search.clearResults();
  }
};

const searchDevicesWithReset = async () => {
  search.resetPage();
  await searchDevices();
};

// Utilidades de formulario
const clearFilters = () => {
  // Reset componentes hijo
  if (dateRangeSelectorRef.value) {
    dateRangeSelectorRef.value.clearAll();
  }

  // Reset valores de búsqueda
  search.resetFilters();
  search.clearResults();
  search.clearError();
};

// Exposición de métodos
defineExpose({ searchDevices });
</script>

<template>
  <form @submit.prevent="searchDevicesWithReset">
    <div class="grid grid-cols-1 md:grid-cols-[2fr,auto] gap-4 items-end">
      <!-- Selector de Rango de Fechas -->
      <fieldset>
        <DateRangeSelector ref="dateRangeSelectorRef" storeName="devices" />
      </fieldset>

      <!-- Botones -->
      <div class="flex items-end gap-4">
        <ServerSelector storeName="devices" />
        <div class="shrink-0">
          <AutoRefreshControl @refresh="searchDevices" />
        </div>
        <Button type="button" variant="secondary" @click="clearFilters">
          Limpiar Filtros
        </Button>
        <Button type="submit">Buscar</Button>
      </div>
    </div>
  </form>
</template>
