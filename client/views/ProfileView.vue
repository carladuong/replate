<script setup lang="ts">
import ListingListComponent from "@/components/Listing/ListingListComponent.vue";
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
    </div>

    <!-- Conditional Rendering Based on Active Section -->
    <section v-if="activeSection === 'listings'">
      <ListingListComponent :username="Array.isArray($route.params.id) ? $route.params.id[0] : $route.params.id" />
    </section>
    <section v-else>
      <RequestListComponent :username="Array.isArray($route.params.id) ? $route.params.id[0] : $route.params.id" />
    </section>
  </main>
</template>
<style scoped>
h1 {
  text-align: center;
}

.tabs {
  display: flex;
  gap: 2rem; /* Spacing between the headers */
  margin-bottom: 1rem;
}

h1.active {
  border-bottom: 2px solid;
}
</style>
