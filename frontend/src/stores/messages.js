import { defineStore } from "pinia";

const DEFAULT_FILTERS = {
  serial: "",
  apikey: "",
  selectedServers: [],
  startDate: "",
  endDate: "",
  dateRange: "",
  page: 1,
  limit: 50,
  isRedirected: false,
};

export const useMessagesStore = defineStore("messages", {
  state: () => ({
    filters: { ...DEFAULT_FILTERS },
    stats: [],
    results: [],
    metadata: null,
    error: null,
  }),

  getters: {
    hasStats: (state) => state.stats.length > 0,
    hasResults: (state) => state.results.length > 0 && state.metadata !== null,
    hasError: (state) => state.error !== null,
    errorType: (state) => state.error?.name || null,
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

    updateStats(data) {
      this.stats = data;
    },

    updatePage(page) {
      this.filters.page = page;
    },

    updateServerSelection(servers) {
      this.filters.selectedServers = servers;
    },

    updateRedirectState(isRedirected) {
      this.filters.isRedirected = isRedirected;
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

    updateError(error) {
      this.error = {
        name: error.name || "Error",
        message: error.message,
      };
    },

    resetPage() {
      this.filters.page = DEFAULT_FILTERS.page;
    },

    resetRedirectState() {
      this.filters.isRedirected = DEFAULT_FILTERS.isRedirected;
    },

    resetFilters() {
      this.filters = { ...DEFAULT_FILTERS };
      this.clearStats();
      this.clearResults();
      this.resetRedirectState();
    },

    clearStats() {
      this.stats = [];
    },

    clearResults() {
      this.results = [];
      this.metadata = null;
      this.clearStats();
    },

    clearError() {
      this.error = null;
    },
  },
});
