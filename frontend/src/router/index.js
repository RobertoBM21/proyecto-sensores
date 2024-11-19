import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../views/SearchPage.vue"),
  },
  {
    path: "/results",
    name: "results",
    component: () => import("../views/ResultsPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  // history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
