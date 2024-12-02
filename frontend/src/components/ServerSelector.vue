<script>
import { useConfigStore } from "../stores/config";
import { useSearchStore } from "../stores/search";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Server, X, Plus, Layers } from "lucide-vue-next";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

export default {
  components: {
    Button,
    Label,
    Checkbox,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    Server,
    X,
    Plus,
    Layers,
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
      loading: false,
      error: null,
    };
  },
  computed: {
    selectionState() {
      const totalServers = this.servers.length;
      const selectedCount = this.search.filters.selectedServers.length;

      return selectedCount === 0
        ? "none"
        : selectedCount === totalServers
        ? "all"
        : "partial";
    },
    selectionIcon() {
      const icons = {
        all: X,
        partial: Plus,
        none: Layers,
      };
      return icons[this.selectionState];
    },
    selectionTitle() {
      return this.selectionState === "all"
        ? "Borrar selección"
        : "Seleccionar todos";
    },
  },
  methods: {
    async fetchServers() {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch(`${this.apiUrl}/servers`);
        if (!response.ok) throw new Error("Error al cargar servidores");

        this.servers = await response.json();
        if (this.servers.length > 0) {
          this.search.setSelectedServers(
            this.servers.map((server) => server.id)
          );
        }
      } catch (error) {
        console.error("Error fetching servers:", error);
        this.error = "Error al cargar los servidores";
      } finally {
        this.loading = false;
      }
    },
    handleServerChange(serverId) {
      const currentSelection = new Set(this.search.filters.selectedServers);

      if (currentSelection.has(serverId)) {
        currentSelection.delete(serverId);
      } else {
        currentSelection.add(serverId);
      }

      this.search.setSelectedServers([...currentSelection]);
    },
    isServerSelected(serverId) {
      return this.search.filters.selectedServers.includes(serverId);
    },
    toggleAllServers() {
      const newSelection =
        this.selectionState === "all"
          ? []
          : this.servers.map((server) => server.id);

      this.search.setSelectedServers(newSelection);
    },
  },
  created() {
    this.fetchServers();
  },
};
</script>

<template>
  <div>
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" class="w-auto gap-2">
          <Server class="h-4 w-4" />
          Servidores ({{ search.filters.selectedServers.length }})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-auto">
        <div v-if="loading" class="px-2 py-1.5">
          <p class="text-sm text-muted-foreground text-center">
            Cargando servidores...
          </p>
        </div>
        <div v-else-if="error" class="px-2 py-1.5">
          <p class="text-sm text-destructive text-center">
            {{ error }}
          </p>
        </div>
        <div v-else-if="servers.length === 0" class="px-2 py-1.5">
          <p class="text-sm text-muted-foreground text-center">
            No hay servidores disponibles
          </p>
        </div>
        <div v-else>
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
