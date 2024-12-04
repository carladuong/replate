<script setup lang="ts">
import MakeOfferForm from "@/components/Offer/MakeOfferForm.vue";
</script>

<template>
  <main>
    <MakeOfferForm :requestId="$route.params.id" />
  </main>
</template>

