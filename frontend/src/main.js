import "./assets/index.css";
import { createApp } from "vue";
import { createPinia } from "pinia";
import { useAuthStore } from "./stores/auth";
import App from "./App.vue";
import router from "./router";

// Crear la aplicación de Vue
const app = createApp(App);

// Usar Pinia para el manejo de estado
app.use(createPinia());

// Usar el enrutador de Vue
app.use(router);

// Inicializar keycloak antes de montar la app
const initApp = async () => {
  try {
    const authStore = useAuthStore();
    await authStore.initialize();

    if (authStore.initialized) {
      app.mount("#app");
    }
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
};

initApp();
