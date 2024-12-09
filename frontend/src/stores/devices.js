import { defineStore } from "pinia";

const DEFAULT_FILTERS = {
  selectedServers: [],
  startDate: "",
  endDate: "",
  dateRange: "",
  page: 1,
  limit: 50,
};

export const useDevicesStore = defineStore("devices", {
  state: () => ({
    filters: { ...DEFAULT_FILTERS },
    results: [],
    metadata: null,
  }),

  getters: {
    hasResults: (state) => state.results.length > 0 && state.metadata !== null,
    currentPage: (state) => state.metadata?.page || 1,
    totalPages: (state) => state.metadata?.totalPages || 0,
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
      this.results = data.devices || [];
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
