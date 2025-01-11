import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

// Constantes para grupos de rutas
const RouteGroups = {
  SEARCH: "search",
};

const routes = [
  // Ruta principal
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomePage.vue"),
    meta: {
      label: "Inicio",
      requiresAuth: false,
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
      requiresAuth: true,
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
      description: "Busca los dispositivos en base a su última comunicación.",
      requiresAuth: true,
    },
  },

  // Ruta fallback (cualquier ruta no encontrada redirige a la página de inicio)
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guardia de navegación
router.beforeResolve(async (to) => {
  const auth = useAuthStore();

  // Si la ruta requiere autenticación y el usuario no está autenticado, redirigir a la página de inicio de sesión
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    await auth.login(to.path);
  }
});

export default router;
