<script setup>
// Componentes Vue
import DateRangeSelector from "./DateRangeSelector.vue";
import ServerSelector from "./ServerSelector.vue";
import AutoRefreshControl from "./AutoRefreshControl.vue";

// Componentes UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Stores
import { useConfigStore } from "../stores/config";
import { useMessagesStore } from "../stores/messages";

// Utilidades y Hooks
import { ref } from "vue";

// Props y Referencias
const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({}),
  },
});

// Estado y Referencias
const config = useConfigStore();
const search = useMessagesStore();
const dateRangeSelectorRef = ref(null);
const serial = ref(props.initialValues.serial || "");
const apikey = ref("");

// Utilidades de búsqueda
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
  const baseUrl =
    endpoint === "search"
      ? config.getMessagesSearchUrl
      : config.getMessagesStatsUrl;
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const response = await fetch(url);
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
const searchMessages = async () => {
  // Resetear los valores de store
  search.clearError();
  search.resetPage();
  search.resetRedirectState();
  // Actualizar filtros del formulario
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
    search.updateError(error);
    search.clearResults();
  }
};

// Búsqueda de mensajes únicamente
const searchMessagesOnly = async () => {
  // Resetear los valores de store
  search.clearError();

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
    search.updateError(error);
    search.clearResults();
  }
};

// Utilidades de formulario
const clearFilters = () => {
  // Reset valores de formulario
  serial.value = "";
  apikey.value = "";

  // Reset valor de selector de fechas
  if (dateRangeSelectorRef.value) {
    dateRangeSelectorRef.value.clearAll();
  }

  // Reset valores de store
  search.resetFilters();
  search.clearResults();
  search.clearError();
};

// Exposición de métodos
defineExpose({ searchMessages, searchMessagesOnly });
</script>

<template>
  <form @submit.prevent="searchMessages">
    <div
      class="grid grid-cols-1 lg:grid-cols-[2fr,2fr,2fr,auto,auto,auto] gap-4 items-end"
    >
      <!-- Entrada de Número de Serie -->
      <fieldset class="space-y-2">
        <Label for="serial">Número de serie</Label>
        <Input
          type="text"
          id="serial"
          v-model="serial"
          placeholder="Introduce el número de serie"
        />
      </fieldset>

      <!-- Entrada de API Key -->
      <fieldset class="space-y-2">
        <Label for="apikey" class="whitespace-nowrap">API Key</Label>
        <Input
          type="text"
          id="apikey"
          v-model="apikey"
          placeholder="Introduce la API Key"
        />
      </fieldset>

      <!-- Selector de Rango de Fechas -->
      <fieldset>
        <DateRangeSelector
          ref="dateRangeSelectorRef"
          :initial-values="initialValues"
        />
      </fieldset>

      <!-- Botones de Acción -->
      <div class="flex items-end gap-4">
        <!-- Selector de Servidor -->
        <fieldset class="flex items-end">
          <ServerSelector :initial-values="initialValues" />
        </fieldset>
        <div class="shrink-0">
          <AutoRefreshControl @refresh="searchMessages" />
        </div>
        <Button type="button" variant="secondary" @click="clearFilters">
          Limpiar Filtros
        </Button>
        <Button type="submit">Buscar</Button>
      </div>
    </div>
  </form>
</template>
