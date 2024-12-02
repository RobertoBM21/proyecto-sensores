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

// Utilities
import { ref, computed, onMounted } from "vue";
import { useConfigStore } from "../stores/config";
import { useMessagesStore } from "../stores/messages";

// Store initialization
const config = useConfigStore();
const search = useMessagesStore();
const apiUrl = config.getApiUrl;

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
    const response = await fetch(`${apiUrl}/servers`);
    if (!response.ok) throw new Error("Error al cargar servidores");

    servers.value = await response.json();
    if (servers.value.length > 0) {
      search.updateServerSelection(servers.value.map((server) => server.id));
    }
  } catch (err) {
    console.error("Error fetching servers:", err);
    error.value = "Error al cargar los servidores";
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

// Initial data fetch
onMounted(fetchServers);
</script>

<template>
  <div>
    <DropdownMenu>
      <!-- Dropdown Trigger -->
      <DropdownMenuTrigger as-child>
        <Button variant="outline" class="w-auto gap-2">
          <Server class="h-4 w-4" />
          Servidores ({{ search.filters.selectedServers.length }})
        </Button>
      </DropdownMenuTrigger>

      <!-- Dropdown Content -->
      <DropdownMenuContent class="w-auto">
        <!-- Loading State -->
        <div v-if="loading" class="px-2 py-1.5">
          <p class="text-sm text-muted-foreground text-center">
            Cargando servidores...
          </p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="px-2 py-1.5">
          <p class="text-sm text-destructive text-center">{{ error }}</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="servers.length === 0" class="px-2 py-1.5">
          <p class="text-sm text-muted-foreground text-center">
            No hay servidores disponibles
          </p>
        </div>

        <!-- Server List -->
        <div v-else>
          <!-- Header -->
          <div class="flex items-center justify-between px-2 py-2.5 border-b">
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
          </div>

          <!-- Server Items -->
          <div
            v-for="server in servers"
            :key="server.id"
            class="flex items-center space-x-2 px-2 py-2.5"
          >
            <Checkbox
              :id="'server-' + server.id"
              :checked="isServerSelected(server.id)"
              @update:checked="handleServerChange(server.id)"
            />
            <Label :for="'server-' + server.id">{{ server.name }}</Label>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
