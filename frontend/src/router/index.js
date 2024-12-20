import { createRouter, createWebHistory } from "vue-router";

// Constantes para grupos de rutas
const RouteGroups = {
  SEARCH: "search",
};

const routes = [
  // Rutas principales
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomePage.vue"),
    meta: {
      label: "Inicio",
    },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginPage.vue"),
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
  //? Si en el futuro necesitamos desplegar desde un subdirectorio, podemos usar createWebHistory(import.meta.env.BASE_URL)
  history: createWebHistory(),
  routes,
});

export default router;
