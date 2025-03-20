import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/puzzles",
      name: "puzzles",
      component: () => import("../views/PuzzleFeedView.vue"),
    },
    {
      path: "/onboarding",
      name: "onboarding",
      component: () => import("../views/PuzzleOnboarding.vue"),
    },
    {
      path: "/level-up",
      name: "levelUp",
      component: () => import("../views/LevelUp.vue"),
    },
    {
      path: "/premium",
      name: "premium",
      component: () => import("../views/Paywall.vue"),
    },
    {
      path: "/welcome",
      name: "welcome",
      component: () => import("../views/WelcomeScreen.vue"),
    },
    {
      path: "/challenge-completed",
      name: "challengeCompleted",
      component: () => import("../views/DailyChallengeCompletedView.vue"),
    },
    {
      path: "/stats",
      name: "stats",
      component: () => import("../views/StatsView.vue"),
    },
  ],
});

export default router;
