import { defineStore } from "pinia";

const DEFAULT_FILTERS = {
  serial: "",
  apikey: "",
  selectedServers: [],
  startDate: "",
  endDate: "",
  dateRange: "",
  page: 1,
  limit: 10,
};

export const useMessagesStore = defineStore("messages", {
  state: () => ({
    filters: { ...DEFAULT_FILTERS },
    results: [],
    metadata: null,
  }),

  getters: {
    hasResults: (state) => state.results.length > 0,
    currentPage: (state) => state.metadata?.page || 1,
    totalPages: (state) => state.metadata?.totalPages || 0,
    hasActiveFilters: (state) => {
      return Object.entries(state.filters).some(([key, value]) => {
        if (Array.isArray(value)) return value.length > 0;
        if (key === "page") return value !== 1;
        if (key === "limit") return value !== 10;
        return value !== "";
      });
    },
  },

  actions: {
    updateFilters(newFilters) {
      this.filters = {
        ...this.filters,
        ...newFilters,
      };
    },

    updatePage(page) {
      this.filters.page = page;
    },

    updateServerSelection(servers) {
      this.filters.selectedServers = servers;
    },

    updateSearchResults(data) {
      this.results = data.messages || [];
      this.metadata = {
        totalItems: data.totalItems,
        totalDevices: data.totalDevices,
        page: data.page,
        totalPages: data.totalPages,
        itemsPerPage: data.itemsPerPage,
        hasNextPage: data.hasNextPage,
        hasPreviousPage: data.hasPreviousPage,
      };
    },

    resetFilters() {
      this.filters = { ...DEFAULT_FILTERS };
      this.clearResults();
    },

    clearResults() {
      this.results = [];
      this.metadata = null;
    },
  },
});
