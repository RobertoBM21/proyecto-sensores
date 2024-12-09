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
} from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field";
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
import { useMessagesStore } from "../stores/messages";
import { ref, computed } from "vue";

// Constants
const RESULT_FIELDS = [
  {
    key: "id",
    label: "ID",
    defaultValue: "N/A",
    width: "w-[100px]",
    className: "font-medium",
  },
  { key: "serial", label: "Serial", defaultValue: "N/A", width: "w-[150px]" },
  { key: "topic", label: "Topic", defaultValue: "N/A", width: "w-[150px]" },
  {
    key: "content",
    label: "Contenido",
    defaultValue: "N/A",
    expandable: true,
    width: "min-w-[200px] max-w-[400px]",
  },
  {
    key: "timestamp",
    label: "Fecha",
    formatter: (value) => new Date(value).toLocaleString(),
    defaultValue: "N/A",
    width: "w-[200px]",
  },
];

// Store initialization
const search = useMessagesStore();
const emit = defineEmits(["pageChange", "limitChange"]);

// Component state
const expandedContents = ref(new Set());
const currentLimit = ref(search.filters.limit);

// Computed properties
const hasResults = computed(() => search.hasResults);

// Methods
const toggleContent = (id) => {
  expandedContents.value.has(id)
    ? expandedContents.value.delete(id)
    : expandedContents.value.add(id);
};

const handlePageChange = (page) => {
  search.updatePage(page);
  emit("pageChange");
};

const handleLimitChange = (value) => {
  currentLimit.value = value;
  search.updateFilters({ limit: value, page: 1 });
  emit("limitChange");
};

const formatFieldValue = (field, value) => {
  if (!value) return field.defaultValue;
  return field.formatter ? field.formatter(value) : value;
};
</script>

<template>
  <div class="space-y-6">
    <!-- Limit Selector -->
    <div v-if="hasResults" class="flex items-center gap-4">
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
    <div v-if="hasResults" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card class="flex-1">
        <CardHeader>
          <CardTitle class="text-sm">Dispositivos únicos</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{{ search.metadata.totalDevices }}</p>
        </CardContent>
      </Card>

      <Card class="flex-1">
        <CardHeader>
          <CardTitle class="text-sm">Total mensajes</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{{ search.metadata.totalItems }}</p>
        </CardContent>
      </Card>

      <Card class="flex-1">
        <CardHeader>
          <CardTitle class="text-sm">Página actual</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">
            {{ search.metadata.page }} / {{ search.metadata.totalPages }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Results Table -->
    <Table v-if="hasResults">
      <TableHeader>
        <TableRow>
          <TableHead
            v-for="field in RESULT_FIELDS"
            :key="field.key"
            :class="field.width"
          >
            {{ field.label }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="result in search.results"
          :key="result.id"
          class="cursor-pointer hover:bg-muted/50"
          @click="toggleContent(result.id)"
        >
          <TableCell
            v-for="field in RESULT_FIELDS"
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
                  :class="expandedContents.has(result.id) ? 'rotate-180' : ''"
                />
              </div>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <!-- Pagination -->
    <nav v-if="search.metadata" class="mt-8 pb-8">
      <Pagination
        :total="search.metadata.totalItems"
        :per-page="search.filters.limit"
        :default-page="search.currentPage"
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
  </div>
</template>
