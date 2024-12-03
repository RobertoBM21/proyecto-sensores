<script>
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
import { useMessagesStore } from "../stores/messages";
import { ref } from "vue";

export default {
  name: "ResultsComponent",
  components: {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Pagination,
    PaginationEllipsis,
    PaginationFirst,
    PaginationLast,
    PaginationList,
    PaginationListItem,
    PaginationNext,
    PaginationPrev,
  },
  setup() {
    const search = useMessagesStore();
    const expandedContents = ref(new Set());

    const toggleContent = (id) => {
      if (expandedContents.value.has(id)) {
        expandedContents.value.delete(id);
      } else {
        expandedContents.value.add(id);
      }
    };

    return {
      search,
      expandedContents,
      toggleContent,
    };
  },
  computed: {
    results() {
      return this.search.results;
    },
  },
  methods: {
    onPageChange(page) {
      this.search.updatePage(page);
      this.$emit("page-change");
    },
  },
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Stats Cards -->
    <div
      v-if="search.metadata && search.results.length > 0"
      class="grid grid-cols-1 sm:grid-cols-3 gap-4"
    >
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
      v-for="result in search.results"
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
          <div class="space-y-1">
            <span class="font-medium text-foreground">Topic</span>
            <p class="truncate text-muted-foreground">
              {{ result.topic || "N/A" }}
            </p>
          </div>
          <div class="space-y-1">
            <span class="font-medium text-foreground">Contenido</span>
            <div class="flex items-start gap-2">
              <p
                :class="[
                  'text-muted-foreground transition-all duration-200',
                  expandedContents.has(result.id) ? '' : 'truncate',
                ]"
              >
                {{ result.content || "N/A" }}
              </p>
              <button
                @click="toggleContent(result.id)"
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-6 w-6"
                :title="
                  expandedContents.has(result.id)
                    ? 'Mostrar menos'
                    : 'Mostrar más'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  :class="expandedContents.has(result.id) ? 'rotate-180' : ''"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>
          <div class="space-y-1">
            <span class="font-medium text-foreground">Timestamp</span>
            <p class="truncate text-muted-foreground">
              {{ new Date(result.timestamp).toLocaleString() }}
            </p>
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
        @update:page="onPageChange"
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
