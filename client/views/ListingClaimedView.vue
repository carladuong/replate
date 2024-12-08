<script setup lang="ts">
import ListingContactInfoComponent from "@/components/Listing/ListingContactInfoComponent.vue";
</script>

<template>
  <main>
    <ListingContactInfoComponent :listingId="$route.params.id" />
  </main>
</template>
