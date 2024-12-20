import "./assets/index.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

// Crear la aplicación de Vue
const app = createApp(App);

// Usar Pinia para el manejo de estado
app.use(createPinia());

// Usar el enrutador de Vue
app.use(router);

app.mount("#app");
