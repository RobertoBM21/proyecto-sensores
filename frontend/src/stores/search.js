import { defineStore } from "pinia";

export const useSearchStore = defineStore("search", {
  state: () => ({
    // Search parameters
    filters: {
      serial: "",
      dateRange: "",
      selectedServers: [],
      page: 1,
      limit: 10,
    },
    // Search results
    results: [],
    metadata: null,
  }),

  actions: {
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters };
    },

    setPage(page) {
      this.filters.page = page;
    },

    setResults(data) {
      this.results = data.messages || [];
      this.metadata = {
        totalItems: data.totalItems,
        totalDevices: data.totalDevices,
        page: data.page,
        totalPages: data.totalPages,
        limit: data.limit,
        hasNextPage: data.hasNextPage,
        hasPreviousPage: data.hasPreviousPage,
      };
    },

    clearResults() {
      this.results = [];
      this.metadata = null;
    },
  },
});
