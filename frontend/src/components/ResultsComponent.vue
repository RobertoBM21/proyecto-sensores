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
  props: {
    searchResults: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      currentPage: 1,
      resultsPerPage: 10,
    };
  },
  computed: {
    paginatedResults() {
      const start = (this.currentPage - 1) * this.resultsPerPage;
      const end = start + this.resultsPerPage;
      return this.searchResults.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.searchResults.length / this.resultsPerPage);
    },
    totalResults() {
      return this.searchResults.length;
    },
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    onPageChange(page) {
      this.currentPage = page;
    },
  },
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-4">
    <Card
      v-for="result in paginatedResults"
      :key="result.id"
      class="hover:bg-accent transition-colors"
    >
      <CardHeader>
        <CardTitle class="text-lg">Serial: {{ result.serial }}</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-3 text-sm text-muted-foreground">
          <div class="space-y-1">
            <span class="font-medium">Topic</span>
            <p class="truncate">{{ result.topic || "N/A" }}</p>
          </div>
          <div class="space-y-1">
            <span class="font-medium">Contenido</span>
            <p class="truncate">{{ result.content || "N/A" }}</p>
          </div>
          <div class="space-y-1">
            <span class="font-medium">Timestamp</span>
            <p class="truncate">
              {{ new Date(result.timestamp).toLocaleString() }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <nav v-if="searchResults.length > 0" class="mt-8">
      <Pagination
        :total="totalResults"
        :per-page="resultsPerPage"
        :default-page="currentPage"
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
