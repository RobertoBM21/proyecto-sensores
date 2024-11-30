<script>
import { useConfigStore } from "../stores/config";
import { useSearchStore } from "../stores/search";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/vue";
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
    Icon,
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
    };
  },
  computed: {
    selectionState() {
      const totalServers = this.servers.length;
      const selectedCount = this.search.filters.selectedServers.length;

      if (selectedCount === 0) return "none";
      if (selectedCount === totalServers) return "all";
      return "partial";
    },
  },
  methods: {
    fetchServers() {
      fetch(`${this.apiUrl}/servers`)
        .then((response) => response.json())
        .then((data) => {
          this.servers = data;
          this.search.setSelectedServers(data.map((server) => server.id));
        })
        .catch((error) => {
          console.error("Error fetching servers:", error);
        });
    },
    handleServerChange(serverId) {
      const currentSelection = [...this.search.filters.selectedServers];
      const index = currentSelection.indexOf(serverId);

      if (index === -1) {
        currentSelection.push(serverId);
      } else {
        currentSelection.splice(index, 1);
      }

      this.search.setSelectedServers(currentSelection);
    },
    isServerSelected(serverId) {
      return this.search.filters.selectedServers.includes(serverId);
    },
    selectAllServers() {
      const allServerIds = this.servers.map((server) => server.id);
      this.search.setSelectedServers(allServerIds);
    },
    toggleAllServers() {
      if (this.selectionState === "all") {
        // Si todos están seleccionados, deseleccionar todos
        this.search.setSelectedServers([]);
      } else {
        // Si hay algunos o ninguno seleccionado, seleccionar todos
        const allServerIds = this.servers.map((server) => server.id);
        this.search.setSelectedServers(allServerIds);
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
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" class="w-auto gap-2">
          <Icon icon="radix-icons:laptop" class="h-4 w-4" />
          Servidores ({{ search.filters.selectedServers.length }})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-auto">
        <div class="px-2 py-1.5" v-if="servers.length === 0">
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
              :title="
                selectionState === 'all'
                  ? 'Borrar selección'
                  : 'Seleccionar todos'
              "
            >
              <Icon
                :icon="
                  selectionState === 'all'
                    ? 'radix-icons:cross-2'
                    : selectionState === 'partial'
                    ? 'radix-icons:plus'
                    : 'radix-icons:stack'
                "
                class="h-3 w-3"
              />
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
