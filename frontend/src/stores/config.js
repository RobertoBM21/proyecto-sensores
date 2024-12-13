import { defineStore } from "pinia";

export const useConfigStore = defineStore("config", {
  state: () => ({
    apiBaseUrl: "http://localhost:3000",
    repoBaseUrl: "https://gitlab.odins.es/roberto.burruezom/proyecto-sensores",
  }),
  getters: {
    // API URLs
    getApiUrl: (state) => state.apiBaseUrl,
    getApiDocsUrl: (state) => `${state.apiBaseUrl}/api-docs`,
    getMessagesUrl: (state) => `${state.apiBaseUrl}/messages`,
    getDevicesUrl: (state) => `${state.apiBaseUrl}/devices`,
    getServersUrl: (state) => `${state.apiBaseUrl}/servers`,

    // Repository URLs
    getRepoUrl: (state) => state.repoBaseUrl,
    getRepoReadmeUrl: (state) => `${state.repoBaseUrl}/blob/main/README.md`,
    getRepoIssuesUrl: (state) => `${state.repoBaseUrl}/issues/new`,

    // API Endpoints (for common operations)
    getMessagesSearchUrl: (state) => `${state.apiBaseUrl}/messages/search`,
    getMessagesStatsUrl: (state) => `${state.apiBaseUrl}/messages/stats`,
    getDevicesActivityUrl: (state) => `${state.apiBaseUrl}/devices/activity`,
  },
});
