<!-- client/views/ClaimView.vue -->
<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const listingId = ref(route.params.id as string);

const maxQuantity = ref<number>(10); // Replace with logic to determine max quantity

onBeforeMount(() => {
  // Add any initialization logic if needed
});
</script>

<template>
  <main>
    <MakeClaimForm :listingId="listingId" :maxQuantity="maxQuantity" />
  </main>
</template>

<style scoped>
/* Add any necessary styles here */
main {
  padding: 20px;
}
</style>
