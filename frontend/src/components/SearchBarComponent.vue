<script>
import { useConfigStore } from "../stores/config";
import { useSearchStore } from "../stores/search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import DateRangeSelector from "./DateRangeSelector.vue";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

export default {
  components: {
    Button,
    Input,
    Label,
    Checkbox,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DateRangeSelector,
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
      servers: [],
      serial: "",
      apikey: "",
    };
  },
  computed: {
    selectedServers: {
      get() {
        return this.search.filters.selectedServers;
      },
      set(value) {
        this.search.setSelectedServers(value);
      },
    },
  },
  methods: {
    getTextColorClass(hasValue) {
      return hasValue ? "text-foreground" : "text-muted-foreground";
    },
    fetchServers() {
      fetch(`${this.apiUrl}/servers`)
        .then((response) => response.json())
        .then((data) => {
          this.servers = data;
          // Inicializar con todos los servidores seleccionados
          this.selectedServers = data.map((server) => server.id);
        })
        .catch((error) => {
          console.error("Error fetching servers:", error);
        });
    },
    searchMessages() {
      // Actualizar los filtros en el store
      this.search.setFilters({
        serial: this.serial,
        apikey: this.apikey,
        selectedServers: this.selectedServers,
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
  watch: {
    // Asegurarse de que los cambios en selectedServers se persistan en el store
    selectedServers: {
      handler(newValue) {
        this.search.setSelectedServers(newValue);
      },
      deep: true,
    },
  },
  created() {
    this.fetchServers();
  },
};
</script>

<template>
  <form @submit.prevent="searchMessages">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
      <!-- Serial input -->
      <div class="md:col-span-3">
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
      <div class="md:col-span-2">
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
      <div class="md:col-span-3">
        <DateRangeSelector />
      </div>

      <!-- Servers selector -->
      <div class="md:col-span-3">
        <div class="space-y-2">
          <Label>Servidores</Label>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="outline"
                :class="[
                  'w-full justify-between h-10',
                  getTextColorClass(selectedServers.length > 0),
                  'font-normal',
                ]"
              >
                {{
                  selectedServers.length > 0
                    ? `${selectedServers.length} servidor(es) seleccionado(s)`
                    : "Seleccionar servidores"
                }}
                <i class="bi bi-chevron-down ml-2"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-56">
              <div class="px-2 py-1.5" v-if="servers.length === 0">
                <p class="text-sm text-muted-foreground text-center">
                  No hay servidores disponibles
                </p>
              </div>
              <div v-else>
                <div class="flex items-center space-x-2 px-2 py-1.5 border-b">
                  <Checkbox
                    id="select-all"
                    :checked="selectedServers.length === servers.length"
                    @change="
                      selectedServers = $event.target.checked
                        ? servers.map((s) => s.id)
                        : []
                    "
                  />
                  <Label for="select-all">Seleccionar todos</Label>
                </div>
                <div
                  v-for="server in servers"
                  :key="server.id"
                  class="flex items-center space-x-2 px-2 py-1.5"
                >
                  <Checkbox
                    :id="'server-' + server.id"
                    :value="server.id"
                    v-model="selectedServers"
                  />
                  <Label :for="'server-' + server.id">{{ server.name }}</Label>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <!-- Submit button -->
      <div class="md:col-span-1">
        <Button type="submit" class="w-full">Buscar</Button>
      </div>
    </div>
  </form>
</template>
