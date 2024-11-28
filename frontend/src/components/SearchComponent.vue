<script>
import HeaderComponent from "./HeaderComponent.vue";
import FooterComponent from "./FooterComponent.vue";
import ResultsComponent from "./ResultsComponent.vue";
import { useConfigStore } from "../stores/config";
import { useSearchStore } from "../stores/search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default {
  components: {
    HeaderComponent,
    FooterComponent,
    ResultsComponent,
    Button,
    Input,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuItem,
    Checkbox,
    Label,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
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
      dateRange: "",
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
    fetchServers() {
      fetch(`${this.apiUrl}/servers`)
        .then((response) => response.json())
        .then((data) => {
          this.servers = data;
        })
        .catch((error) => {
          console.error("Error fetching servers:", error);
        });
    },
    searchDevices() {
      this.search.setFilters({
        serial: this.serial,
        dateRange: this.dateRange,
      });

      let url = new URL(`${this.apiUrl}/messages/search`);
      let params = new URLSearchParams();

      if (this.serial) params.append("serial", this.serial);
      if (this.dateRange) params.append("dateRange", this.dateRange);
      if (this.selectedServers.length > 0) {
        this.selectedServers.forEach((serverId) => {
          params.append("serverId", serverId);
        });
      }

      // Añadir parámetros de paginación
      params.append("page", this.search.filters.page.toString());
      params.append("limit", this.search.filters.limit.toString());

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
  created() {
    this.fetchServers();
  },
};
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto px-4 py-4">
      <form @submit.prevent="searchDevices">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div class="md:col-span-5">
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
          <div class="md:col-span-3">
            <div class="space-y-2">
              <Label for="dateRange">Rango de fecha</Label>
              <Select v-model="dateRange">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rango de fecha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Rangos de fecha</SelectLabel>
                    <SelectItem value="">Sin filtro de fecha</SelectItem>
                    <SelectItem value="last_5_minutes"
                      >Últimos 5 minutos</SelectItem
                    >
                    <SelectItem value="last_15_minutes"
                      >Últimos 15 minutos</SelectItem
                    >
                    <SelectItem value="last_30_minutes"
                      >Últimos 30 minutos</SelectItem
                    >
                    <SelectItem value="last_hour">Última hora</SelectItem>
                    <SelectItem value="last_24_hours"
                      >Últimas 24 horas</SelectItem
                    >
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="yesterday">Ayer</SelectItem>
                    <SelectItem value="last_week">Última semana</SelectItem>
                    <SelectItem value="last_month">Último mes</SelectItem>
                    <SelectItem value="last_year">Último año</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="md:col-span-3">
            <div class="space-y-2">
              <Label>Servidores</Label>
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button
                    variant="outline"
                    class="w-full justify-between h-10 text-muted-foreground font-normal"
                  >
                    Seleccionar servidores
                    <i class="bi bi-chevron-down ml-2"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="w-56">
                  <div class="px-2 py-1.5" v-if="servers.length === 0">
                    <p class="text-sm text-muted-foreground text-center">
                      No hay servidores disponibles
                    </p>
                  </div>
                  <div
                    v-else
                    v-for="server in servers"
                    :key="server.id"
                    class="flex items-center space-x-2 px-2 py-1.5"
                  >
                    <Checkbox
                      :id="'server-' + server.id"
                      :value="server.id"
                      v-model="selectedServers"
                    />
                    <Label :for="'server-' + server.id">{{
                      server.name
                    }}</Label>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div class="md:col-span-1">
            <Button type="submit" class="w-full">Buscar</Button>
          </div>
        </div>
      </form>

      <div class="mt-8">
        <ResultsComponent />
      </div>
    </div>
    <FooterComponent />
  </div>
</template>
