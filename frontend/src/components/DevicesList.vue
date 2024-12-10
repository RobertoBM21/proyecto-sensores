<script setup>
// UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
import {
  Pagination,
  PaginationEllipsis,
  PaginationFirst,
  PaginationLast,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
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
import { ChevronDown } from "lucide-vue-next";

// Store & Utilities
import { useDevicesStore } from "../stores/devices";
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
    key: "coverage",
    label: "Cobertura de dispositivos",
    value: (metadata) => {
      if (!metadata.totalDevices || !metadata.totalItems) return "0%";
      return `${((metadata.totalItems / metadata.totalDevices) * 100).toFixed(
        1
      )}%`;
    },
  },
  { key: "totalItems", label: "Dispositivos activos" },
  {
    value: (meta) => `${meta.page} / ${meta.totalPages}`,
    label: "Página actual",
  },
];

// Component setup
const router = useRouter();
const store = useDevicesStore();
const emit = defineEmits(["pageChange", "limitChange"]);

// Component state
const expandedContents = ref(new Set());
const currentLimit = ref(store.filters.limit);

// Computed properties
const tableFields = computed(() => Object.values(TableFieldConfig));

const statsData = computed(() => {
  if (!store.metadata) return [];
  return STATS_CONFIG.map(({ key, label, value }) => ({
    label,
    value: value ? value(store.metadata) : store.metadata[key],
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

const handleLimitChange = (value) => {
  currentLimit.value = value;
  store.updateFilters({ limit: value, page: 1 });
  emit("limitChange");
};

const formatFieldValue = (field, value) => {
  if (!value) return field.defaultValue;
  return field.formatter ? field.formatter(value) : value;
};

const navigateToMessages = (device) => {
  router.push({
    path: "/search/messages",
    query: {
      serial: device.serial,
      startDate: store.filters.startDate,
      endDate: store.filters.endDate,
      dateRange: store.filters.dateRange,
      serverIds: store.filters.selectedServers.join(","),
      autoSearch: "true",
    },
  });
};
</script>

<template>
  <div class="space-y-6">
    <template v-if="store.hasResults">
      <!-- Results per page selector -->
      <div>
        <NumberField
          v-model="currentLimit"
          :min="5"
          :max="100"
          :step="5"
          @update:model-value="handleLimitChange"
          class="w-[150px]"
        >
          <Label for="results-per-page">Resultados por página</Label>
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput id="results-per-page" />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card v-for="stat in statsData" :key="stat.label" class="flex-1">
          <CardHeader>
            <CardTitle class="text-sm">{{ stat.label }}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-2xl font-bold">{{ stat.value }}</p>
          </CardContent>
        </Card>
      </div>

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
      <nav class="mt-8 pb-8" aria-label="Paginación">
        <Pagination
          :total="store.metadata.totalItems"
          :per-page="store.filters.limit"
          :default-page="store.currentPage"
          :sibling-count="2"
          show-edges
          @update:page="handlePageChange"
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
    </template>
  </div>
</template>
