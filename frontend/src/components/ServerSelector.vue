<script setup>
// Componentes UI
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

// Iconos
import { Server, X, Plus, Layers } from "lucide-vue-next";

// Stores
import { useMessagesStore } from "../stores/messages";
import { useDevicesStore } from "../stores/devices";
import { useConfigStore } from "../stores/config";

// Utilidades y Hooks
import { ref, computed, onMounted } from "vue";
import { fetchWithAuth } from "../lib/http";

// Props y Validación
const props = defineProps({
  storeName: {
    type: String,
    default: "messages",
    validator: (value) => ["messages", "devices"].includes(value),
  },
  initialValues: {
    type: Object,
    default: () => ({}),
  },
});

// Estado y Referencias
const config = useConfigStore();
const servers = ref([]);
const loading = ref(false);
const error = ref(null);

// Inicialización del Store
const getStore = () => {
  switch (props.storeName) {
    case "devices":
      return useDevicesStore();
    default:
      return useMessagesStore();
  }
};

const search = getStore();

// Propiedades Computadas
const selectionState = computed(() => {
  const totalServers = servers.value.length;
  const selectedCount = search.filters.selectedServers.length;

  return selectedCount === 0
    ? "none"
    : selectedCount === totalServers
    ? "all"
    : "partial";
});

const selectionIcon = computed(() => {
  const icons = { all: X, partial: Plus, none: Layers };
  return icons[selectionState.value];
});

const selectionTitle = computed(() =>
  selectionState.value === "all" ? "Borrar selección" : "Seleccionar todos"
);

// Utilidades de Datos
const fetchServers = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetchWithAuth(config.getServersUrl);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    servers.value = await response.json();

    // Inicialización de selección
    if (servers.value.length > 0 && !search.filters.selectedServers.length) {
      if (props.initialValues?.selectedServers?.length) {
        search.updateServerSelection(props.initialValues.selectedServers);
      } else {
        search.updateServerSelection(servers.value.map((server) => server.id));
      }
    }
  } catch (err) {
    console.error("Error fetching servers:", err);
    error.value = {
      name: err instanceof TypeError ? "ConnectionError" : "Error",
      message:
        err instanceof TypeError
          ? "No se puede conectar al servidor. Verifique su conexión a internet y que el servidor esté en ejecución."
          : "Ha ocurrido un error inesperado al cargar los servidores.",
    };
  } finally {
    loading.value = false;
  }
};

// Manejadores de Eventos
const handleServerChange = (serverId) => {
  const currentSelection = new Set(search.filters.selectedServers);
  currentSelection.has(serverId)
    ? currentSelection.delete(serverId)
    : currentSelection.add(serverId);

  search.updateServerSelection([...currentSelection]);
};

const toggleAllServers = () => {
  const newSelection =
    selectionState.value === "all"
      ? []
      : servers.value.map((server) => server.id);

  search.updateServerSelection(newSelection);
};

// Utilidades de UI
const isServerSelected = (serverId) =>
  search.filters.selectedServers.includes(serverId);

// Inicialización
onMounted(fetchServers);
</script>

<template>
  <div class="server-selector">
    <!-- Menú Desplegable -->
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="outline"
          class="w-auto gap-2 hover:bg-muted/50 transition-colors duration-200"
        >
          <Server class="h-4 w-4" />
          <span>Servidores ({{ search.filters.selectedServers.length }})</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent class="w-auto mx-4 rounded-lg">
        <!-- Estado de Carga -->
        <div v-if="loading" class="px-2 py-1.5">
          <p class="text-sm text-muted-foreground text-center">
            Cargando servidores...
          </p>
        </div>

        <!-- Estado de Error -->
        <div v-else-if="error" class="px-2 py-1.5">
          <p class="text-sm text-destructive text-center text-balance">
            {{ error.message }}
          </p>
        </div>

        <!-- Estado Vacío -->
        <div v-else-if="servers.length === 0" class="px-2 py-1.5">
          <p class="text-sm text-muted-foreground text-center">
            No hay servidores disponibles
          </p>
        </div>

        <!-- Selección de Servidores -->
        <section v-else>
          <header
            class="flex items-center justify-between px-2 py-2.5 border-b"
          >
            <Label>Servidores disponibles</Label>
            <Button
              variant="ghost"
              size="icon"
              class="h-4 w-4 text-muted-foreground hover:text-foreground ml-4"
              @click="toggleAllServers"
              :title="selectionTitle"
            >
              <component :is="selectionIcon" class="h-4 w-4" />
            </Button>
          </header>

          <ul class="list-none m-0 p-0">
            <li
              v-for="server in servers"
              :key="server.id"
              class="flex items-center space-x-2 px-2 py-2.5 hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
              @click="handleServerChange(server.id)"
            >
              <Checkbox
                :id="'server-' + server.id"
                :checked="isServerSelected(server.id)"
                @click.stop
              />
              <Label :for="'server-' + server.id" class="cursor-pointer">
                {{ server.name }}
              </Label>
            </li>
          </ul>
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
