import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "../views/LoginPage.vue";

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginPage,
  },
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomePage.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../views/SearchPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  // history: createWebHistory(import.meta.env.BASE_URL), //? Que diferencia hay con la linea anterior?
  routes,
});

export default router;
