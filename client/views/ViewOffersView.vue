<script setup lang="ts">
import OfferListComponent from "@/components/Offer/OfferListComponent.vue";

</script>


<template>
  <main>
    <OfferListComponent :requestId="$route.params.id" />
  </main>
</template>


<style scoped>
h1 {
  text-align: center;
}
</style>
