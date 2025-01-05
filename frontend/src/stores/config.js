import { defineStore } from "pinia";

export const useConfigStore = defineStore("config", {
  state: () => ({
    apiBaseUrl: import.meta.env.VITE_API_URL,
    repoBaseUrl: "https://gitlab.odins.es/roberto.burruezom/proyecto-sensores",
  }),
  getters: {
    // URLs de la API
    getApiUrl: (state) => state.apiBaseUrl,
    getApiDocsUrl: (state) => `${state.apiBaseUrl}/api-docs`,
    getMessagesUrl: (state) => `${state.apiBaseUrl}/messages`,
    getDevicesUrl: (state) => `${state.apiBaseUrl}/devices`,
    getServersUrl: (state) => `${state.apiBaseUrl}/servers`,

    // URLs del repositorio
    getRepoUrl: (state) => state.repoBaseUrl,
    getRepoReadmeUrl: (state) => `${state.repoBaseUrl}/blob/main/README.md`,
    getRepoIssuesUrl: (state) => `${state.repoBaseUrl}/issues/new`,

    // Endpoints de la API
    getHomeStatsUrl: (state) => `${state.apiBaseUrl}/servers/stats`,
    getMessagesSearchUrl: (state) => `${state.apiBaseUrl}/messages/search`,
    getMessagesStatsUrl: (state) => `${state.apiBaseUrl}/messages/stats`,
    getDevicesActivityUrl: (state) => `${state.apiBaseUrl}/devices/activity`,
  },
});
