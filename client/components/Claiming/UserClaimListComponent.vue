<!-- client/components/Claiming/UserClaimListComponent.vue -->
<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps<{ listingId: string }>();

const loaded = ref(false);
const claims = ref<Array<{ _id: string; claimer: string; quantity: number }>>([]);
const isError = ref(false);

/**
 * Fetches claims associated with the given listingId.
 */
async function getClaims() {
  try {
    const results = await fetchy("/api/claims", "GET", {
      query: { listingId: props.listingId },
    });
    claims.value = results;
  } catch (error) {
    console.error("Failed to fetch claims:", error);
    isError.value = true;
  }
}

onBeforeMount(async () => {
  await getClaims();
  loaded.value = true;
});
</script>

<template>
  <div>
    <h2>Claims for Listing ID: {{ props.listingId }}</h2>

    <section class="claims-container" v-if="loaded && claims.length !== 0">
      <article v-for="claim in claims" :key="claim._id" class="claim-item">
        <p><strong>Claimer ID:</strong> {{ claim.claimer }}</p>
        <p><strong>Quantity:</strong> {{ claim.quantity }}</p>
        <!-- Add more claim details as needed -->
      </article>
    </section>

    <p v-else-if="loaded && !isError">No claims found for this listing.</p>
    <p v-else-if="isError">Failed to load claims. Please try again later.</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
.claims-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 1em;
}

.claim-item {
  border: 1px solid #ccc;
  padding: 1em;
  border-radius: 5px;
}
</style>
