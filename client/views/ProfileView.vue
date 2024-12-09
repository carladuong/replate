<script setup lang="ts">
import ListingListComponent from "@/components/Listing/ListingListComponent.vue";
import UserOfferListComponent from "@/components/Offer/UserOfferListComponent.vue";
import UserProfileComponent from "@/components/Profile/UserProfileComponent.vue";
import RequestListComponent from "@/components/Request/RequestListComponent.vue";
import { ref } from "vue";

const activeSection = ref("listings"); // Default to "listings"
</script>
<template>
  <main>
    <UserProfileComponent :userId="$route.params.id" />

    <!-- Clickable Headers for Sections -->
    <div class="tabs">
      <h1 :class="{ active: activeSection === 'listings' }" @click="activeSection = 'listings'">Listings</h1>
      <h1 :class="{ active: activeSection === 'requests' }" @click="activeSection = 'requests'">Requests</h1>
      <h1 :class="{ active: activeSection === 'offers' }" @click="activeSection = 'offers'">Offers</h1>
    </div>

    <!-- Conditional Rendering Based on Active Section -->
    <section v-if="activeSection === 'listings'">
      <ListingListComponent :username="Array.isArray($route.params.id) ? $route.params.id[0] : $route.params.id" />
      <p>Historic listings</p>
      <ListingListComponent :username="Array.isArray($route.params.id) ? $route.params.id[0] : $route.params.id" :historic="true" />
    </section>
    <section v-else-if="activeSection === 'requests'">
      <RequestListComponent :username="Array.isArray($route.params.id) ? $route.params.id[0] : $route.params.id" />
    </section>
    <section v-else-if="activeSection === 'offers'">
      <UserOfferListComponent :username="Array.isArray($route.params.id) ? $route.params.id[0] : $route.params.id" />
    </section>
  </main>
</template>
<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  text-align: center;
}

.tabs {
  display: flex;
  gap: 2rem; /* Spacing between the headers */
  margin-bottom: 0px;
}

h1.active {
  border-bottom: 2px solid;
}

p {
  padding-top: 2em;
  font-size: 1.2em;
}

.thumb-container {
  width: 1000px;
  display: grid;
  gap: 5px;
  padding: 10px;
  align-items: center;
  margin: 0px;
  grid-template-columns: repeat(5, 1fr); /* Five equal columns */
}
</style>
