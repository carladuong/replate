<!-- [client/components/Claim/ClaimContactInfoComponent.vue](client/components/Claim/ClaimContactInfoComponent.vue) -->
<!-- 
<template>
  <main>
    <h1>You've accepted a claim for {{ itemName }} from {{ contactUsername }}!</h1>
    <h2>Contact them at {{ contactNumber }} to arrange a pickup at {{ location }}.</h2>
    <button @click="goHome">Back</button>
  </main>
</template>

<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const claimId = route.params.claimId as string;
const contactNumber = ref("");
const contactUsername = ref("");
const location = ref("");
const itemName = ref("");

const getClaimDetails = async () => {
  try {
    const response = await fetchy(`/api/claims/${claimId}`, "GET");
    const claim = response.claim;
    contactNumber.value = claim.claimerPhone; // Ensure your backend includes claimer's phone
    contactUsername.value = claim.claimerUsername; // Ensure your backend includes claimer's username
    location.value = claim.location; // Assuming location is part of the claim or listing
    itemName.value = claim.itemName; // Assuming itemName is part of the claim or listing
  } catch (error) {
    console.error("Error fetching claim details:", error);
  }
};

const goHome = () => {
  void router.push("/");
};

onBeforeMount(async () => {
  await getClaimDetails();
});
</script>

<style scoped>
h1,
h2 {
  text-align: center;
}
button {
  display: block;
  margin: 20px auto;
}
</style> -->
