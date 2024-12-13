<script setup>
// UI components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

// Icons
import { Server, X, Plus, Layers } from "lucide-vue-next";

// Store
import { useMessagesStore } from "../stores/messages";
import { useDevicesStore } from "../stores/devices";

// Utilities
import { ref, computed, onMounted } from "vue";
import { useConfigStore } from "../stores/config";

// Prop para determinar qué store usar
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

// Store initialization
const config = useConfigStore();
const getStore = () => {
  switch (props.storeName) {
    case "devices":
      return useDevicesStore();
    default:
      return useMessagesStore();
  }
};

const search = getStore();

// Component state
const servers = ref([]);
const loading = ref(false);
const error = ref(null);

// Computed properties
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

// Methods
const fetchServers = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(config.getServersUrl);
    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

    servers.value = await response.json();

    // Se actualiza la selección de servidores en función de si es una búsqueda nueva o una redirección
    if (servers.value.length > 0 && !search.filters.selectedServers.length) {
      if (props.initialValues?.selectedServers?.length) {
        search.updateServerSelection(props.initialValues.selectedServers);
      } else {
        search.updateServerSelection(servers.value.map((server) => server.id));
      }
    }
  } catch (err) {
    console.error("Error fetching servers:", err);
    error.value =
      err.name === "TypeError"
        ? "No se puede conectar al servidor. Verifique que el servidor esté en ejecución."
        : "Error al cargar los servidores";
  } finally {
    loading.value = false;
  }
};

const handleServerChange = (serverId) => {
  const currentSelection = new Set(search.filters.selectedServers);
  currentSelection.has(serverId)
    ? currentSelection.delete(serverId)
    : currentSelection.add(serverId);

  search.updateServerSelection([...currentSelection]);
};

const isServerSelected = (serverId) =>
  search.filters.selectedServers.includes(serverId);

const toggleAllServers = () => {
  const newSelection =
    selectionState.value === "all"
      ? []
      : servers.value.map((server) => server.id);

  search.updateServerSelection(newSelection);
};

// Inicializar la lista de servidores al montar el componente
onMounted(fetchServers);
</script>

<template>
  <div class="server-selector">
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

      <DropdownMenuContent class="w-auto">
        <!-- Loading State -->
        <div v-if="loading" class="px-2 py-1.5">
          <p class="text-sm text-muted-foreground text-center">
            Cargando servidores...
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="px-2 py-1.5">
          <p class="text-sm text-destructive text-center whitespace-normal">
            {{ error }}
          </p>
        </div>

        <!-- Empty State -->
        <div v-else-if="servers.length === 0" class="px-2 py-1.5">
          <p class="text-sm text-muted-foreground text-center">
            No hay servidores disponibles
          </p>
        </div>

        <!-- Server List -->
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
