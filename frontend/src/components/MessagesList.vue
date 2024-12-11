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
import { ChevronDown, Cpu, Mails, BookOpen } from "lucide-vue-next";

// Store & Utilities
import { useMessagesStore } from "../stores/messages";
import { ref, computed } from "vue";

// Types & Constants
const TableFieldConfig = {
  ID: {
    key: "id",
    label: "ID",
    width: "w-[100px]",
    className: "font-medium",
  },
  SERIAL: {
    key: "serial",
    label: "Serial",
    width: "w-[150px]",
  },
  TOPIC: {
    key: "topic",
    label: "Topic",
    width: "w-[150px]",
  },
  CONTENT: {
    key: "content",
    label: "Contenido",
    expandable: true,
    width: "min-w-[200px] max-w-[400px]",
  },
  TIMESTAMP: {
    key: "timestamp",
    label: "Fecha",
    formatter: (value) => new Date(value).toLocaleString(),
    width: "w-[200px]",
  },
};

const STATS_CONFIG = [
  {
    key: "totalDevices",
    label: "Dispositivos únicos",
    icon: Cpu,
    description: "Número total de dispositivos que han enviado mensajes",
  },
  {
    key: "totalItems",
    label: "Mensajes totales",
    icon: Mails,
    description: "Número total de mensajes recibidos",
  },
  {
    label: "Página actual",
    icon: BookOpen,
    value: (meta) => `${meta.page} / ${meta.totalPages}`,
    description: "Página actual de los resultados",
  },
];

// Component setup
const emit = defineEmits(["pageChange"]);
const store = useMessagesStore();

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
  if (!value) return "N/A";
  return field.formatter ? field.formatter(value) : value;
};
</script>

<template>
  <section class="space-y-6">
    <template v-if="store.hasResults">
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
      <section>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                v-for="field in tableFields"
                :key="field.key"
                :class="[field.width, field.headerClassName]"
                scope="col"
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
              <TableCell
                v-for="field in tableFields"
                :key="field.key"
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
                      :class="{ 'rotate-180': expandedContents.has(result.id) }"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

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
    </template>
  </section>

  <PageSelectDialog
    v-model:is-open="isDialogOpen"
    :current-page="store.filters.page"
    :total-pages="store.totalPages"
    @select="handlePageChange"
  />
</template>
