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

// Icons
import { ChevronDown } from "lucide-vue-next";

// Store & Utilities
import { useMessagesStore } from "../stores/messages";
import { ref, computed } from "vue";

// Constants
const RESULT_FIELDS = [
  { key: "topic", label: "Topic", defaultValue: "N/A" },
  { key: "content", label: "Contenido", defaultValue: "N/A", expandable: true },
  {
    key: "timestamp",
    label: "Timestamp",
    formatter: (value) => new Date(value).toLocaleString(),
    defaultValue: "N/A",
  },
];

// Store initialization
const search = useMessagesStore();
const emit = defineEmits(["pageChange"]);

// Component state
const expandedContents = ref(new Set());

// Computed properties
const results = computed(() => search.results);
const hasResults = computed(() => search.metadata && results.value.length > 0);

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

const formatFieldValue = (field, value) => {
  if (!value) return field.defaultValue;
  return field.formatter ? field.formatter(value) : value;
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
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

    <!-- Results Cards -->
    <Card
      v-for="result in results"
      :key="result.id"
      class="transition-colors duration-200 hover:bg-muted/50 group"
    >
      <CardHeader
        class="group-hover:bg-muted/25 transition-colors duration-200"
      >
        <CardTitle class="text-lg text-foreground"
          >Serial: {{ result.serial }}</CardTitle
        >
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
          <div
            v-for="field in RESULT_FIELDS"
            :key="field.key"
            class="space-y-1"
          >
            <span class="font-medium text-foreground">{{ field.label }}</span>
            <div class="flex items-start gap-2">
              <p
                :class="[
                  'text-muted-foreground transition-all duration-200',
                  field.expandable && {
                    truncate: !expandedContents.has(result.id),
                  },
                ]"
              >
                {{ formatFieldValue(field, result[field.key]) }}
              </p>
              <button
                v-if="field.expandable"
                @click="toggleContent(result.id)"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 w-6"
                :title="
                  expandedContents.has(result.id)
                    ? 'Mostrar menos'
                    : 'Mostrar más'
                "
              >
                <ChevronDown
                  class="h-4 w-4 transition-transform duration-200"
                  :class="expandedContents.has(result.id) ? 'rotate-180' : ''"
                />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Pagination -->
    <nav v-if="search.metadata" class="mt-8 pb-8">
      <Pagination
        :total="search.metadata.totalItems"
        :per-page="search.metadata.limit"
        :default-page="search.metadata.page"
        :sibling-count="1"
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
