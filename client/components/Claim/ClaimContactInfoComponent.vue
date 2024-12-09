<!-- client/components/Claim/ClaimContactInfoComponent.vue -->
<template>
  <div class="claim-info">
    <h3>Claim Details</h3>
    <p><strong>Username:</strong> {{ claim.claimerUsername }}</p>
    <p><strong>Phone:</strong> {{ claim.claimerPhone }}</p>
    <p><strong>Quantity:</strong> {{ claim.quantity }}</p>
    <p><strong>Pickup Location:</strong> {{ claim.location }}</p>
    <!-- Add more fields as necessary -->
    <button @click="handleUnclaim" class="unclaim-button">Unclaim Item</button>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineProps } from "vue";

const props = defineProps<{
  claim: {
    _id: string;
    claimerUsername: string;
    claimerPhone: string;
    quantity: number;
    location: string;
    // Add other relevant fields
  };
  listingId: string;
  maxQuantity: number;
}>();

const handleUnclaim = async () => {
  const confirmUnclaim = confirm("Are you sure you want to unclaim this item?");
  if (!confirmUnclaim) return;

  try {
    await fetchy(`/api/claims/${props.claim._id}`, "DELETE");
    alert("Successfully unclaimed the item.");
    // Optionally, emit an event to refresh the claims list
    // emit('claimUnclaimed');
  } catch (error) {
    console.error("Error unclaiming item:", error);
    alert("There was an error unclaiming the item.");
  }
};
</script>

<style scoped>
.claim-info {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.unclaim-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.unclaim-button:hover {
  background-color: #da190b;
}
</style>
