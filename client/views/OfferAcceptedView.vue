<script setup lang="ts">
import OfferContactInfoComponent from "@/components/Offer/OfferContactInfoComponent.vue";
</script>

<template>
  <main>
    <OfferContactInfoComponent :offerId="$route.params.id" />
  </main>
</template>
