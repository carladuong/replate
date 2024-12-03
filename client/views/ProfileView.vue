<script setup lang="ts">
import ListingListComponent from "@/components/Listing/ListingListComponent.vue";
import UserProfileComponent from "@/components/Profile/UserProfileComponent.vue";
import RequestListComponent from "@/components/Request/RequestListComponent.vue";
</script>
<template>
  <main>
    <h1>Profile</h1>
    <UserProfileComponent :userId="$route.params.id" />
    <h2>Listings</h2>
    <ListingListComponent :username="Array.isArray($route.params.id) ? $route.params.id[0] : $route.params.id" />
    <h2>Requests</h2>
    <RequestListComponent :username="Array.isArray($route.params.id) ? $route.params.id[0] : $route.params.id" />
  </main>
</template>
<style scoped>
h1 {
  text-align: center;
}
</style>
