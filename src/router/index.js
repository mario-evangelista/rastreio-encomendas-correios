// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import TrackPage from "../views/TrackPage.vue";

const routes = [
  {
    path: "/track",
    name: "Track",
    component: TrackPage,
    props: (route) => ({ code: route.query.code }),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
