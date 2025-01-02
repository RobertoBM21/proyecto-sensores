import { defineStore } from "pinia";
import { keycloakService } from "../services/keycloak";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    keycloak: null,
    initialized: false,
    loading: true,
  }),

  getters: {
    isAuthenticated: (state) => state.keycloak?.authenticated ?? false,
    token: (state) => state.keycloak?.token,
    userInfo: (state) => ({
      email: state.keycloak?.tokenParsed?.email,
      name: state.keycloak?.tokenParsed?.name,
      username: state.keycloak?.tokenParsed?.preferred_username,
    }),
  },

  actions: {
    async initialize() {
      try {
        this.keycloak = await keycloakService.init();
        this.initialized = true;
        this.loading = false;
      } catch (error) {
        this.loading = false;
        throw error;
      }
    },

    async login(path) {
      await keycloakService.login(path);
    },

    async logout() {
      await keycloakService.logout();
    },
  },
});
