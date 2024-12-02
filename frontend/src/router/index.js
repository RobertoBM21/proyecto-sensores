import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import LoginPage from "../views/LoginPage.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../views/SearchPage.vue"),
  },
  {
    //* Cualquier otra ruta que no exista, redirigir a la página principal
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
