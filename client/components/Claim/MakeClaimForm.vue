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

  <!-- Author's Info Dialog -->
  <div class="author-info-overlay" v-if="showAuthorInfo">
    <div class="author-info">
      <h3>Contact the Author</h3>
      <p><strong>Phone:</strong> {{ authorPhone }}</p>
      <p>
        Please contact <strong>{{ authorUsername }} </strong> for more information about pickup instructions at <strong> {{ meetupLocation }} </strong>
      </p>
      <button @click="closeAuthorInfo" class="close-button">Close</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { defineEmits, defineProps, onMounted, ref } from "vue";

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

const showAuthorInfo = ref(false);
console.log("show author info?is being udpated:", showAuthorInfo.value);
const authorPhone = ref<string>("");
console.log("authors phone updated:", authorPhone.value);
const authorUsername = ref<string>(""); // Add a ref for author's username
const meetupLocation = ref<string>(""); // Reactive variable for meetup location

// Function to fetch listing details
const fetchListingDetails = async () => {
  try {
    const listing = await fetchy(`/api/listings/${props.listingId}`, "GET");
    meetupLocation.value = listing.meetup_location;
    console.log("Listing Meetup Location:", meetupLocation.value);
  } catch (error) {
    console.error("Error fetching listing details:", error);
  }
};

// Fetch listing details when component is mounted
onMounted(async () => {
  await fetchListingDetails();
});

const submitClaim = async () => {
  try {
    const response = await fetchy("/api/claims", "POST", {
      body: {
        listingId: props.listingId,
        quantity: quantity.value,
      },
    });

    console.log("response:", response);
    if (response.msg) {
      // Extract author's phone from the response
      if (response.authorPhone) {
        authorPhone.value = response.authorPhone;
        authorUsername.value = response.authorUsername;
        showAuthorInfo.value = true; // Show the author's info dialog
        console.log("authors info:", showAuthorInfo.value);
        console.log("Author's phone:", authorPhone.value);
      }
      console.log("authors phone:", authorPhone.value);
      emit("claimMade");
      //closeForm();
    } else {
      throw new Error("Failed to submit claim.");
    }
  } catch (error) {
    console.error("Error submitting claim:", error);
    alert("There was an error submitting your claim.");
  }
};

console.log("show author info after the function:", showAuthorInfo.value);

const closeForm = () => {
  isOpen.value = false;
  emit("close");
};

// Function to close the author's info dialog
const closeAuthorInfo = () => {
  showAuthorInfo.value = false;
  closeForm();
};
</script>

<style scoped>
.claim-form-overlay,
.author-info-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.claim-form-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.author-info-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.claim-form,
.author-info {
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

.cancel-button,
.close-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
}

.cancel-button:hover,
.close-button:hover {
  background-color: #da190b;
}

.author-info h3 {
  margin-top: 0;
}

.author-info p {
  margin: 10px 0;
}

.author-info button {
  display: block;
  margin: 0 auto;
}
</style>
