<script setup>
// UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PageSelectDialog,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Icons
import { ChevronDown, Activity, Cpu, BookOpen } from "lucide-vue-next";

// Store & Utilities
import { useDevicesStore } from "../stores/devices";
import { useMessagesStore } from "../stores/messages";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

// Types & Constants
const TableFieldConfig = {
  SERIAL: {
    key: "serial",
    label: "Serial",
    width: "w-[150px]",
    className: "font-medium",
  },
  LAST_COMMUNICATION: {
    key: "lastCommunication",
    label: "Última conexión",
    formatter: (value) => new Date(value).toLocaleString(),
    width: "w-[200px]",
  },
  MESSAGE_COUNT: {
    key: "messageCount",
    label: "Mensajes",
    width: "w-[100px]",
    className: "text-right",
    headerClassName: "pr-4",
  },
  ACTIONS: {
    key: "actions",
    label: "Buscar",
    width: "w-[120px]",
    className: "px-4",
  },
};

const STATS_CONFIG = [
  {
    label: "Cobertura de dispositivos",
    icon: Activity,
    description: "Porcentaje de dispositivos que no han vuelto a comunicar",
    value: (metadata) => {
      if (!metadata.totalDevices || !metadata.totalItems) return "0%";
      return `${((metadata.totalItems / metadata.totalDevices) * 100).toFixed(
        1
      )}%`;
    },
  },
  {
    key: "totalItems",
    label: "Dispositivos activos",
    icon: Cpu,
    description: "Número de dispositivos que comunicaron por última vez",
  },
  {
    label: "Página actual",
    icon: BookOpen,
    value: (meta) => `${meta.page} / ${meta.totalPages}`,
    description: "Página actual de los resultados",
  },
];

// Component setup
const router = useRouter();
const store = useDevicesStore();
const messagesStore = useMessagesStore();
const emit = defineEmits(["pageChange"]);

// Component state
const expandedContents = ref(new Set());
const isDialogOpen = ref(false);

// Computed properties
const tableFields = computed(() => Object.values(TableFieldConfig));

const statsData = computed(() => {
  if (!store.metadata) return [];
  return STATS_CONFIG.map(({ key, label, icon, value, description }) => ({
    label,
    icon,
    value: value ? value(store.metadata) : store.metadata[key],
    description,
  }));
});

// Methods
const toggleContent = (id) => {
  expandedContents.value.has(id)
    ? expandedContents.value.delete(id)
    : expandedContents.value.add(id);
};

const handlePageChange = (page) => {
  store.updatePage(page);
  emit("pageChange");
};

const formatFieldValue = (field, value) => {
  if (!value) return field.defaultValue;
  return field.formatter ? field.formatter(value) : value;
};

const navigateToMessages = (device) => {
  messagesStore.updateRedirectState(true);
  router.push({
    path: "/search/messages",
    query: {
      serial: device.serial,
      startDate: store.filters.startDate,
      endDate: store.filters.endDate,
      dateRange: store.filters.dateRange,
      serverIds: store.filters.selectedServers.join(","),
    },
  });
};
</script>

<template>
  <section class="space-y-6">
    <template v-if="store.hasError">
      <!-- Error Message -->
      <div class="text-balance text-center text-muted-foreground py-8">
        <template v-if="store.errorType === 'BadRequestError'">
          <h3 class="text-xl font-semibold mb-2">Parámetros Inválidos</h3>
          <p>
            Los parámetros de búsqueda proporcionados no son válidos. Por favor,
            verifica los datos ingresados e inténtalo nuevamente.
          </p>
        </template>
        <template v-else-if="store.errorType === 'NotFoundError'">
          <h3 class="text-xl font-semibold mb-2">Sin Resultados</h3>
          <p>
            No se encontraron dispositivos que coincidan con los criterios de
            búsqueda especificados.
          </p>
        </template>
        <template v-else>
          <h3 class="text-xl font-semibold mb-2">Error Inesperado</h3>
          <p>
            Ha ocurrido un error inesperado. Por favor, inténtalo nuevamente más
            tarde.
          </p>
        </template>
      </div>
    </template>

    <template v-else-if="store.hasResults">
      <!-- Stats Cards -->
      <section class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="stat in statsData"
          :key="stat.label"
          class="transition-all hover:shadow-lg hover:shadow-foreground/5 hover:bg-muted/50"
        >
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium">{{ stat.label }}</CardTitle>
            <component :is="stat.icon" class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stat.value }}</div>
            <p class="text-xs text-muted-foreground">
              {{ stat.description }}
            </p>
          </CardContent>
        </Card>
      </section>

      <!-- Results Table -->
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              v-for="field in tableFields"
              :key="field.key"
              :class="[field.width, field.headerClassName]"
            >
              {{ field.label }}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="result in store.results"
            :key="result.id"
            class="cursor-pointer hover:bg-muted/50 transition-colors"
            @click="toggleContent(result.id)"
          >
            <template v-for="field in tableFields" :key="field.key">
              <TableCell
                v-if="field.key !== 'actions'"
                :class="[field.width, field.className]"
              >
                <div class="flex items-start gap-2">
                  <p
                    :class="[
                      'transition-all duration-200',
                      field.expandable && {
                        'line-clamp-1': !expandedContents.has(result.id),
                        'whitespace-normal': expandedContents.has(result.id),
                        'whitespace-nowrap': !expandedContents.has(result.id),
                      },
                    ]"
                  >
                    {{ formatFieldValue(field, result[field.key]) }}
                  </p>
                  <div
                    v-if="field.expandable"
                    class="inline-flex items-center justify-center h-6 w-6 shrink-0"
                  >
                    <ChevronDown
                      class="h-4 w-4 transition-transform duration-200"
                      :class="
                        expandedContents.has(result.id) ? 'rotate-180' : ''
                      "
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell v-else class="w-[120px] px-4">
                <Button
                  variant="outline"
                  size="sm"
                  @click.stop="navigateToMessages(result)"
                >
                  Ver mensajes
                </Button>
              </TableCell>
            </template>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <nav class="mt-8 pb-8">
        <Pagination
          v-model:page="store.filters.page"
          :total="store.metadata.totalItems"
          :items-per-page="store.filters.limit"
          :sibling-count="2"
          show-edges
          v-slot="{ page }"
        >
          <PaginationList
            v-slot="{ items }"
            class="flex items-center justify-center gap-1"
          >
            <PaginationFirst />
            <PaginationPrev />

            <template v-for="(item, index) in items">
              <PaginationListItem
                v-if="item.type === 'page'"
                :key="index"
                :value="item.value"
                as-child
              >
                <Button
                  class="w-10 h-10 p-0"
                  :variant="item.value === page ? 'default' : 'outline'"
                  :aria-current="item.value === page ? 'page' : undefined"
                  @click.stop="
                    item.value === page
                      ? (isDialogOpen = true)
                      : handlePageChange(item.value)
                  "
                >
                  {{ item.value }}
                </Button>
              </PaginationListItem>
              <PaginationEllipsis v-else :key="item.type" :index="index" />
            </template>

            <PaginationNext />
            <PaginationLast />
          </PaginationList>
        </Pagination>
      </nav>
      <PageSelectDialog
        v-model:is-open="isDialogOpen"
        :current-page="store.filters.page"
        :total-pages="store.totalPages"
        @select="handlePageChange"
      />
    </template>
  </section>
</template>
