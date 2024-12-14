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

// Prop para inicializar el formulario con valores iniciales
const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({}),
  },
});

// Store initialization
const config = useConfigStore();
const search = useMessagesStore();
const dateRangeSelectorRef = ref(null);

// Form state
const serial = ref(props.initialValues.serial || "");
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
  search.clearResults();
  search.clearError();
};

defineExpose({ searchMessages, searchMessagesOnly });
</script>

<template>
  <form @submit.prevent="searchMessages">
    <div
      class="grid grid-cols-1 md:grid-cols-[2fr,1.5fr,2fr,auto,auto,auto] gap-4 items-end"
    >
      <!-- Serial Input -->
      <fieldset class="space-y-2">
        <Label for="serial">Número de serie</Label>
        <Input
          type="text"
          id="serial"
          v-model="serial"
          placeholder="Introduce el número de serie"
        />
      </fieldset>

      <!-- API Key Input -->
      <fieldset class="space-y-2">
        <Label for="apikey">API Key</Label>
        <Input
          type="text"
          id="apikey"
          v-model="apikey"
          placeholder="Introduce la API Key"
        />
      </fieldset>

      <!-- Date Range Selector -->
      <fieldset>
        <DateRangeSelector
          ref="dateRangeSelectorRef"
          :initial-values="initialValues"
        />
      </fieldset>

      <!-- Server Selector -->
      <fieldset class="flex items-end">
        <ServerSelector :initial-values="initialValues" />
      </fieldset>

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
