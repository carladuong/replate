<script setup lang="ts">
import ListingComponent from "@/components/Listing/ListingComponent.vue";
</script>

<template>
  <main>
    <ListingComponent :listingId="$route.params.id" />
  </main>
</template>
