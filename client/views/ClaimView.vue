<script setup lang="ts">
import MakeClaimForm from "@/components/Claim/MakeClaimForm.vue";
import ClaimContactInfoComponent from "@/components/Claim/ClaimContactInfoComponent.vue";
import { fetchy } from "@/utils/fetchy";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const listingId = ref(route.params.id as string);
const claims = ref<Array<any>>([]); // Replace `any` with your Claim type if available
const maxQuantity = ref<number>(0); // Define maxQuantity
const isLoading = ref(true);
const error = ref<string | null>(null);

// Function to fetch claims for the given listingId
const fetchClaims = async () => {
  try {
    const response = await fetchy(`/api/claims/${listingId.value}`, "GET");
    claims.value = response.claims || []; // Ensure claims is an array
  } catch (err) {
    console.error("Error fetching claims:", err);
    error.value = "Failed to load claims.";
  } finally {
    isLoading.value = false;
  }
};

// Refresh claims after a new claim is made
const refreshClaims = async () => {
  isLoading.value = true;
  error.value = null;
  await fetchClaims();
};

onMounted(async () => {
  await fetchClaims();
});
</script>

<style scoped>
main {
  padding: 20px;
}

.claims-section {
  margin-top: 40px;
}

.error {
  color: red;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 15px;
}
</style>

<template>
  <main>
    <h1>Claims for This Listing</h1>

    <!-- MakeClaimForm Component for Submitting New Claims -->
    <MakeClaimForm :listingId="listingId" :maxQuantity="maxQuantity" @claimMade="refreshClaims" />

    <section class="claims-section">
      <!-- Loading State -->
      <div v-if="isLoading">
        <p>Loading claims...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error">
        <p class="error">{{ error }}</p>
      </div>

      <!-- No Claims State -->
      <div v-else-if="claims.length === 0">
        <p>No claims have been made for this listing yet.</p>
      </div>

      <!-- Claims List -->
      <div v-else>
        <ul>
          <li v-for="claim in claims" :key="claim._id">
            <ClaimContactInfoComponent :claim="claim" :listingId="listingId" :maxQuantity="maxQuantity" />
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
