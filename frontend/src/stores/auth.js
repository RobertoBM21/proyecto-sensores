import { defineStore } from "pinia";
import Keycloak from "keycloak-js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    keycloak: null,
    initialized: false,
    loading: true,
    email: "random",
    name: null,
    username: null,
    authenticated: false,
  }),

  getters: {
    // isAuthenticated: (state) => state.keycloak?.authenticated ?? false,
    isAuthenticated: (state) => state.authenticated ?? false,
    token: (state) => state.keycloak?.token,
    userInfo: (state) => ({
      email: state.keycloak?.tokenParsed?.email,
      name: state.keycloak?.tokenParsed?.name,
      username: state.keycloak?.tokenParsed?.preferred_username,
    }),
  },

  actions: {
    async initialize() {
      const keycloak = new Keycloak({
        url: import.meta.env.VITE_KEYCLOAK_URL,
        realm: import.meta.env.VITE_KEYCLOAK_REALM,
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
      });

      try {
        await keycloak.init({
          onLoad: "login-required",
          pkceMethod: "S256",
        });

        this.keycloak = keycloak;
        this.initialized = true;
        this.loading = false;
      } catch (error) {
        console.error("Keycloak init error:", error);
        this.loading = false;
        throw error;
      }
    },

    async login(username) {
      //   await this.keycloak?.login();
      this.username = username;
      this.authenticated = true;
    },

    async logout() {
      //   await this.keycloak?.logout();
      this.authenticated = false;
      this.username = null;
    },
  },
});
