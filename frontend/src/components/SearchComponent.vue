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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ref } from "vue";
import { RangeCalendar } from "@/components/ui/range-calendar";
import { getLocalTimeZone } from "@internationalized/date";

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
    Popover,
    PopoverContent,
    PopoverTrigger,
    RangeCalendar,
  },
  setup() {
    const config = useConfigStore();
    const search = useSearchStore();
    const apiUrl = config.getApiUrl;
    const dateValue = ref({
      start: null,
      end: null,
    });

    return {
      apiUrl,
      search,
      dateValue,
    };
  },
  data() {
    return {
      servers: [],
      serial: "",
      apikey: "",
      dateRange: "",
      dateRangeOptions: [
        { value: "last_5_minutes", label: "Últimos 5 minutos" },
        { value: "last_15_minutes", label: "Últimos 15 minutos" },
        { value: "last_30_minutes", label: "Últimos 30 minutos" },
        { value: "last_hour", label: "Última hora" },
        { value: "today", label: "Hoy" },
        { value: "last_24_hours", label: "Últimas 24 horas" },
        { value: "yesterday", label: "Ayer" },
        { value: "last_week", label: "Última semana" },
        { value: "last_month", label: "Último mes" },
        { value: "last_year", label: "Último año" },
      ],
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
    selectedDateRangeLabel() {
      const option = this.dateRangeOptions.find(
        (opt) => opt.value === this.dateRange
      );
      return option ? option.label : "Selecciona un rango de fechas";
    },
    selectedDateLabel() {
      if (this.dateRange) {
        return this.selectedDateRangeLabel;
      }
      if (this.dateValue.start && this.dateValue.end) {
        const start = this.dateValue.start.toDate(getLocalTimeZone());
        const end = this.dateValue.end.toDate(getLocalTimeZone());
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
      }
      return "Selecciona un rango de fechas";
    },
    hasDateSelection() {
      return this.dateRange || (this.dateValue.start && this.dateValue.end);
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
      this.search.setFilters({
        serial: this.serial,
        apikey: this.apikey,
        dateRange: this.dateRange,
        selectedServers: this.selectedServers,
      });

      let url = new URL(`${this.apiUrl}/messages/search`);
      let params = new URLSearchParams();

      // Solo añadir parámetros que tengan valor
      const filters = {
        serial: this.serial,
        apikey: this.apikey,
        startDate: this.search.filters.startDate,
        endDate: this.search.filters.endDate,
        dateRange: this.dateRange,
        page: this.search.filters.page.toString(),
        limit: this.search.filters.limit.toString(),
      };

      // Añadir solo los parámetros que no estén vacíos
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      // Añadir servidores seleccionados solo si hay alguno
      if (this.selectedServers.length > 0) {
        this.selectedServers.forEach((serverId) => {
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
    updateDateRange(range) {
      if (range.start && range.end) {
        // Convertir las fechas al formato ISO para la API
        this.search.setFilters({
          startDate: range.start.toDate(getLocalTimeZone()).toISOString(),
          endDate: range.end.toDate(getLocalTimeZone()).toISOString(),
          dateRange: "", // Limpiar dateRange cuando se usa el calendario
        });
      }
    },
    clearDateRange() {
      this.dateRange = "";
      this.search.setFilters({
        dateRange: "",
      });
    },
    clearCalendar() {
      this.dateValue = {
        start: null,
        end: null,
      };
      this.search.setFilters({
        startDate: "",
        endDate: "",
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
    dateValue: {
      handler(newValue) {
        if (newValue.start && newValue.end) {
          this.clearDateRange(); // Limpiar el select cuando se usa el calendario
          this.updateDateRange(newValue);
        }
      },
      deep: true,
    },
    dateRange(newValue) {
      if (newValue) {
        this.clearCalendar(); // Limpiar el calendario cuando se usa el select
      }
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
      <form @submit.prevent="searchMessages">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
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
          <div class="md:col-span-3">
            <div class="space-y-2">
              <Label for="dateRange">Rango de fecha</Label>
              <Popover>
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    :class="[
                      'w-full justify-start',
                      getTextColorClass(hasDateSelection),
                      'font-normal',
                    ]"
                  >
                    {{ selectedDateLabel }}
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-auto">
                  <div class="grid gap-4">
                    <div class="space-y-2">
                      <h4 class="font-medium leading-none">Rango de fechas</h4>
                      <p class="text-sm text-muted-foreground">
                        Selecciona el período de tiempo para la búsqueda
                      </p>
                    </div>
                    <div class="grid gap-2">
                      <Select v-model="dateRange" class="w-full">
                        <SelectTrigger>
                          <SelectValue :placeholder="selectedDateRangeLabel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem
                              v-for="option in dateRangeOptions"
                              :key="option.value"
                              :value="option.value"
                            >
                              {{ option.label }}
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <div class="border-t my-2"></div>
                      <RangeCalendar
                        v-model="dateValue"
                        class="rounded-md border p-3"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
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
                    <div
                      class="flex items-center space-x-2 px-2 py-1.5 border-b"
                    >
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
                      <Label :for="'server-' + server.id">{{
                        server.name
                      }}</Label>
                    </div>
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
