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
    return { search };
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
  <div class="max-w-4xl mx-auto space-y-4">
    <div
      v-if="search.metadata && search.results.length > 0"
      class="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground"
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

    <Card
      v-for="result in search.results"
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

    <nav v-if="search.metadata" class="mt-8">
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
