<!-- [client/components/Claim/MakeClaimForm.vue](client/components/Claim/MakeClaimForm.vue) -->
<template>
  <div class="claim-form-overlay" v-if="isOpen">
    <div class="claim-form">
      <h2>Claim Item</h2>
      <form @submit.prevent="submitClaim">
        <label for="quantity">Quantity:</label>
        <input type="number" id="quantity" v-model.number="quantity" :max="maxQuantity" min="1" required />

        <button type="submit" class="submit-button">Submit Claim</button>
        <button type="button" @click="closeForm" class="cancel-button">Cancel</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineEmits, defineProps, ref } from "vue";

const props = defineProps({
  listingId: {
    type: String,
    required: true,
  },
  maxQuantity: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["close", "claimMade"]);

const isOpen = ref(true);
const quantity = ref(1);

const submitClaim = async () => {
  try {
    const response = await fetchy("/api/claims", "POST", {
      body: {
        listingId: props.listingId,
        quantity: quantity.value,
      },
    });
    if (response.msg) {
      emit("claimMade");
      closeForm();
    } else {
      throw new Error("Failed to submit claim.");
    }
  } catch (error) {
    console.error("Error submitting claim:", error);
    alert("There was an error submitting your claim.");
  }
};

const closeForm = () => {
  isOpen.value = false;
  emit("close");
};
</script>

<style scoped>
.claim-form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.claim-form {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 300px;
}

.submit-button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px;
  margin-right: 10px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #45a049;
}

.cancel-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.cancel-button:hover {
  background-color: #da190b;
}
</style>
