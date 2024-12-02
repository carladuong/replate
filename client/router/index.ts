import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { useUserStore } from "@/stores/user";
import CreateListingView from "../views/CreateListingView.vue";
import CreateRequestView from "../views/CreateRequestView.vue";
import CreateReviewView from "../views/CreateReviewView.vue";
import HomeView from "../views/HomeView.vue";
import ListingView from "../views/ListingView.vue";
import LoginView from "../views/LoginView.vue";
import MakeOfferView from "../views/MakeOfferView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import ProfileView from "../views/ProfileView.vue";
import RequestView from "../views/RequestView.vue";
import ReviewsView from "../views/ReviewsView.vue";
import SettingView from "../views/SettingView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: HomeView,
    },

    {
      path: "/users/:id/",
      name: "Profile View",
      component: ProfileView,
    },

    {
      path: "/setting",
      name: "Settings",
      component: SettingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/listings/:id/",
      name: "Listing Item",
      component: ListingView,
      meta: { requiresAuth: true },
    },

    {
      path: "/create-listing",
      name: "Create Listing",
      component: CreateListingView,
      meta: { requiresAuth: true },
    },

    {
      path: "/requests/:id/",
      name: "Request Item",
      component: RequestView,
      meta: { requiresAuth: true },
    },
    {
      path: "/createRequest",
      name: "Create Request",
      component: CreateRequestView,
      meta: { requiresAuth: true },
    },
    {
      path: "/reviews/:id",
      name: "Reviews",
      component: ReviewsView,
      meta: { requiresAuth: true },
    },
    {
      path: "/createReview/:id",
      name: "Create Review",
      component: CreateReviewView,
      meta: { requiresAuth: true },
    },
    {
      path: "/makeOffer/:id",
      name: "Make Offer",
      component: MakeOfferView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { requiresAuth: false },
      beforeEnter: (to, from) => {
        const { isLoggedIn } = storeToRefs(useUserStore());
        if (isLoggedIn.value) {
          return { name: "Settings" };
        }
      },
    },
    {
      path: "/:catchAll(.*)",
      name: "not-found",
      component: NotFoundView,
    },
  ],
});

/**
 * Navigation guards to prevent user from accessing wrong pages.
 */
router.beforeEach((to, from) => {
  const { isLoggedIn } = storeToRefs(useUserStore());

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: "Login" };
  }
});

export default router;
