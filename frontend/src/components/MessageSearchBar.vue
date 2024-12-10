<script setup>
// Layout components
import DateRangeSelector from "./DateRangeSelector.vue";
import ServerSelector from "./ServerSelector.vue";

// UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Store
import { useConfigStore } from "../stores/config";
import { useMessagesStore } from "../stores/messages";

// Utilities
import { ref } from "vue";

// Store initialization
const config = useConfigStore();
const search = useMessagesStore();
const apiUrl = config.getApiUrl;
const dateRangeSelectorRef = ref(null);

// Form state
const serial = ref("");
const apikey = ref("");

// Methods
const buildParams = () => {
  return {
    ...(search.filters.serial && { serial: search.filters.serial }),
    ...(search.filters.apikey && { apikey: search.filters.apikey }),
    ...(search.filters.selectedServers.length > 0 && {
      serverIds: search.filters.selectedServers.join(","),
    }),
    ...(search.filters.startDate && { startDate: search.filters.startDate }),
    ...(search.filters.endDate && { endDate: search.filters.endDate }),
    ...(search.filters.dateRange && { dateRange: search.filters.dateRange }),
  };
};

const fetchData = async (endpoint, params = {}) => {
  const url = new URL(`${apiUrl}/messages/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};

// Búsqueda de mensajes y estadísticas
const searchMessages = async () => {
  // Update store with form values
  search.updateFilters({
    serial: serial.value,
    apikey: apikey.value,
  });

  try {
    // Construir parámetros base
    const baseParams = buildParams();

    // Realizar ambas llamadas en paralelo ya que es una búsqueda completa
    const [searchData, statsData] = await Promise.all([
      fetchData("search", {
        ...baseParams,
        page: search.filters.page,
        limit: search.filters.limit,
      }),
      fetchData("stats", baseParams),
    ]);

    // Actualizar store con resultados
    search.updateSearchResults(searchData);
    search.updateStats(statsData);
  } catch (error) {
    console.error("Error fetching data:", error);
    search.clearResults();
  }
};

// Búsqueda de mensajes únicamente
const searchMessagesOnly = async () => {
  try {
    const baseParams = buildParams();
    const searchData = await fetchData("search", {
      ...baseParams,
      page: search.filters.page,
      limit: search.filters.limit,
    });

    search.updateSearchResults(searchData);
  } catch (error) {
    console.error("Error fetching messages:", error);
    search.clearResults();
  }
};

const clearFilters = () => {
  // Reset local state
  serial.value = "";
  apikey.value = "";

  // Reset child components
  if (dateRangeSelectorRef.value) {
    dateRangeSelectorRef.value.clearAll();
  }

  // Reset store
  search.resetFilters();
};

defineExpose({ searchMessagesOnly });
</script>

<template>
  <form @submit.prevent="searchMessages">
    <div
      class="grid grid-cols-1 md:grid-cols-[2fr,1.5fr,2fr,auto,auto,auto] gap-4 items-end"
    >
      <!-- Serial Input -->
      <div>
        <div class="space-y-2">
          <Label for="serial">Número de serie</Label>
          <Input
            type="text"
            id="serial"
            v-model="serial"
            placeholder="Introduce el número de serie"
          />
        </div>
      </div>

      <!-- API Key Input -->
      <div>
        <div class="space-y-2">
          <Label for="apikey">API Key</Label>
          <Input
            type="text"
            id="apikey"
            v-model="apikey"
            placeholder="Introduce la API Key"
          />
        </div>
      </div>

      <!-- Date Range Selector -->
      <div>
        <DateRangeSelector ref="dateRangeSelectorRef" />
      </div>

      <!-- Server Selector -->
      <div class="flex items-end">
        <ServerSelector />
      </div>

      <!-- Action Buttons -->
      <div class="flex items-end gap-4">
        <Button type="button" variant="secondary" @click="clearFilters">
          Limpiar Filtros
        </Button>
        <Button type="submit">Buscar</Button>
      </div>
    </div>
  </form>
</template>
