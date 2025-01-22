import { storeToRefs } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import UserClaimListComponent from "@/components/Claiming/UserClaimListComponent.vue";
import { useUserStore } from "@/stores/user";
import FaqView from "@/views/FaqView.vue";
import CreateListingView from "../views/CreateListingView.vue";
import CreateRequestView from "../views/CreateRequestView.vue";
import CreateReviewView from "../views/CreateReviewView.vue";
import HomeView from "../views/HomeView.vue";
import ListingClaimedView from "../views/ListingClaimedView.vue";
import ListingView from "../views/ListingView.vue";
import LoginView from "../views/LoginView.vue";
import MakeOfferView from "../views/MakeOfferView.vue";
import NotFoundView from "../views/NotFoundView.vue";
import OfferAcceptedView from "../views/OfferAcceptedView.vue";
import ProfileView from "../views/ProfileView.vue";
import ReportView from "../views/ReportView.vue";
import RequestView from "../views/RequestView.vue";
import ReviewsView from "../views/ReviewsView.vue";
import SettingView from "../views/SettingView.vue";
import ViewOffersView from "../views/ViewOffersView.vue";

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
      path: "/listingClaimed/:id",
      name: "Listing Claimed",
      component: ListingClaimedView,
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
      path: "/viewOffers/:id",
      name: "View Offers",
      component: ViewOffersView,
      meta: { requiresAuth: true },
    },
    {
      path: "/offerAccepted/:id",
      name: "Offer Accepted",
      component: OfferAcceptedView,
      meta: { requiresAuth: true },
    },
    {
      path: "/viewClaims/:listingId",
      name: "ViewClaims",
      component: UserClaimListComponent,
      props: true,
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
      path: "/faq",
      name: "FAQ",
      component: FaqView,
    },
    {
      path: "/report/:reportedId",
      name: "Report",
      component: ReportView,
      props: true, // Allows route params to be passed as props to the component
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
