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
      selectedServers: [],
      serial: "",
      dateRange: "",
      selectedServerNames: "",
    };
  },
  computed: {
    paginatedResults() {
      const start = (this.currentPage - 1) * this.resultsPerPage;
      const end = start + this.resultsPerPage;
      return this.searchResults.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.searchResults.length / this.resultsPerPage);
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
        selectedServers: this.selectedServers,
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
    updateSelectedServerNames() {
      const selectedNames = this.servers
        .filter((server) => this.selectedServers.includes(server.id))
        .map((server) => server.name);

      this.selectedServerNames = selectedNames.length
        ? selectedNames.join(", ")
        : "";
    },
  },
  watch: {
    servers: {
      handler: "updateSelectedServerNames",
      immediate: true,
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
    <div class="mt-2 text-right px-4">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            {{ selectedServerNames || "Servidores" }}
            <i class="bi bi-chevron-down ml-2"></i>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-48">
          <DropdownMenuLabel>Servidores disponibles</DropdownMenuLabel>
          <DropdownMenuSeparator />
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
              @change="updateSelectedServerNames"
            />
            <Label :for="'server-' + server.id">{{ server.name }}</Label>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    <div class="min-h-screen flex flex-col">
      <main class="flex-grow">
        <div class="container mx-auto px-4 my-20">
          <div class="text-center mb-20">
            <h1
              class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-6"
            >
              Sensores
            </h1>
            <p class="text-xl text-muted-foreground">
              Aquí podrás acceder a la información transmitida por los sensores
              de OdinS distribuidos por todo el país.
            </p>
          </div>

          <form class="max-w-4xl mx-auto" @submit.prevent="searchDevices">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
              <div class="md:col-span-8">
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
              <div class="md:col-span-4">
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
            </div>

            <div class="text-center mb-20">
              <Button type="submit" size="lg">Buscar</Button>
            </div>
          </form>

          <ResultsComponent />
        </div>
      </main>
    </div>
    <FooterComponent />
  </div>
</template>
