import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import LoginPage from "../views/LoginPage.vue";

// Constantes para grupos de rutas
const RouteGroups = {
  SEARCH: "search",
};

const routes = [
  // Rutas principales
  {
    path: "/",
    name: "home",
    component: HomePage,
    meta: {
      label: "Inicio",
    },
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: {
      label: "Iniciar Sesión",
      hideInNav: true,
    },
  },

  // Rutas de búsqueda
  {
    path: "/search/messages",
    name: "searchMessages",
    component: () => import("../views/SearchMessagesPage.vue"),
    meta: {
      group: RouteGroups.SEARCH,
      label: "Mensajes",
      groupLabel: "Búsqueda",
      description: "Busca mensajes por fecha, dispositivo, o servidores.",
    },
  },
  {
    path: "/search/devices",
    name: "searchDevices",
    component: () => import("../views/SearchDevicesPage.vue"),
    meta: {
      group: RouteGroups.SEARCH,
      label: "Dispositivos",
      groupLabel: "Búsqueda",
      description: "Busca los dispositivos que han dejado de enviar mensajes.",
    },
  },

  // Ruta fallback (cualquier ruta no encontrada redirige a la página de inicio)
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  // Usamos createWebHistory sin parametro ya que no estamos desplegando en un subdirectorio
  //? Si en el futuro necesitamos desplegar en un subdirectorio, podemos usar (import.meta.env.BASE_URL)
  history: createWebHistory(),
  routes,
});

export default router;
