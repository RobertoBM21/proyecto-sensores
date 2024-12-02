<script>
import { useConfigStore } from "../stores/config";
import { useSearchStore } from "../stores/search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DateRangeSelector from "./DateRangeSelector.vue";
import ServerSelector from "./ServerSelector.vue";

export default {
  components: {
    Button,
    Input,
    Label,
    DateRangeSelector,
    ServerSelector,
  },
  setup() {
    const config = useConfigStore();
    const search = useSearchStore();
    const apiUrl = config.getApiUrl;

    return {
      apiUrl,
      search,
    };
  },
  data() {
    return {
      serial: "",
      apikey: "",
      dateRangeSelectorRef: null,
    };
  },
  methods: {
    searchMessages() {
      this.search.setFilters({
        serial: this.serial,
        apikey: this.apikey,
      });

      // Crear un objeto con todos los parámetros
      const params = {
        ...(this.search.filters.serial && {
          serial: this.search.filters.serial,
        }),
        ...(this.search.filters.apikey && {
          apikey: this.search.filters.apikey,
        }),
        ...(this.search.filters.selectedServers.length > 0 && {
          serverIds: this.search.filters.selectedServers.join(","),
          ...(this.search.filters.startDate && {
            startDate: this.search.filters.startDate,
          }),
          ...(this.search.filters.endDate && {
            endDate: this.search.filters.endDate,
          }),
          ...(this.search.filters.dateRange && {
            dateRange: this.search.filters.dateRange,
          }),
          page: this.search.filters.page,
          limit: this.search.filters.limit,
        }),
      };

      // Crear la URL con los parámetros
      const url = new URL(`${this.apiUrl}/messages/search`);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });

      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then((data) => {
          this.search.setResults(data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          this.search.clearResults();
        });
    },
    clearFilters() {
      // Limpiar campos locales
      this.serial = "";
      this.apikey = "";

      // Limpiar componentes hijos
      if (this.$refs.dateRangeSelector) {
        this.$refs.dateRangeSelector.clearAll();
      }

      // Limpiar el store
      this.search.clearFilters();
    },
  },
};
</script>

<template>
  <form @submit.prevent="searchMessages">
    <div
      class="grid grid-cols-1 md:grid-cols-[2fr,1.5fr,2fr,auto,auto,auto] gap-4 items-end"
    >
      <!-- Serial input -->
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

      <!-- API Key input -->
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
        <DateRangeSelector ref="dateRangeSelector" />
      </div>

      <!-- Servers selector -->
      <div class="flex items-end">
        <ServerSelector />
      </div>

      <!-- Submit and Clear buttons -->
      <div class="flex items-end gap-4">
        <Button type="button" variant="secondary" @click="clearFilters">
          Limpiar Filtros
        </Button>
        <Button type="submit">Buscar</Button>
      </div>
    </div>
  </form>
</template>
