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
    };
  },
  methods: {
    searchMessages() {
      this.search.setFilters({
        serial: this.serial,
        apikey: this.apikey,
      });

      let url = new URL(`${this.apiUrl}/messages/search`);
      let params = new URLSearchParams();

      // Obtener todos los filtros directamente del store
      const filters = {
        serial: this.search.filters.serial,
        apikey: this.search.filters.apikey,
        startDate: this.search.filters.startDate,
        endDate: this.search.filters.endDate,
        dateRange: this.search.filters.dateRange,
        page: this.search.filters.page.toString(),
        limit: this.search.filters.limit.toString(),
      };

      // Añadir solo los parámetros que no estén vacíos
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      // Añadir servidores seleccionados
      const selectedServers = this.search.filters.selectedServers;
      if (selectedServers.length > 0) {
        selectedServers.forEach((serverId) => {
          params.append("serverId", serverId);
        });
      }

      url.search = params.toString();

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
  },
};
</script>

<template>
  <form @submit.prevent="searchMessages">
    <div
      class="grid grid-cols-1 md:grid-cols-[2fr,1.5fr,2fr,auto,auto] gap-4 items-end"
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
        <DateRangeSelector />
      </div>

      <!-- Servers selector -->
      <div class="flex items-end">
        <ServerSelector />
      </div>

      <!-- Submit button -->
      <div class="flex items-end">
        <Button type="submit">Buscar</Button>
      </div>
    </div>
  </form>
</template>
