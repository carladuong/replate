<script setup lang="ts">
import UserComponent from "@/components/Profile/UserComponent.vue";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, defineProps, onBeforeMount, ref } from "vue";
import MakeClaimForm from "../Claim/MakeClaimForm.vue";
import TaggingComponent from "../Tagging/TaggingComponent.vue";

const props = defineProps(["listingId", "claimgId"]);

const { currentUsername } = storeToRefs(useUserStore());
const isEditing = ref(false);
const listing = ref<Record<string, string> | null>(null);
const isClaimed = ref(false);
const showClaimForm = ref(false);
const expire = ref<Record<string, string> | null>(null);

const editedName = ref("");
const editedQuantity = ref("");
const editedExpiration = ref("");
const editedMeetupLocation = ref("");
const editedDescription = ref("");
const editedImage = ref("");
const editedTags = ref<string[]>([]);

// Open Claim Form
const openClaimForm = () => {
  showClaimForm.value = true;
};

// Close Claim Form
const closeClaimForm = () => {
  showClaimForm.value = false;
};
// Unclaim Item Function (Ensure Implementation Exists)
const unclaimItem = async (event: MouseEvent) => {
  const button = event.target as HTMLButtonElement;
  const claimingId = button.dataset.claimingId;
  try {
    await fetchy(`/api/claims/${claimingId}`, "DELETE");
    alert("Successfully unclaimed the item.");
    await getListing(props.listingId);
  } catch (error) {
    console.error("Error unclaiming item:", error);
    alert("There was an error unclaiming the item.");
  }
};

const imageSrc = computed(() => (isEditing.value ? editedImage.value || "@/assets/images/no-image.jpg" : listing.value?.image || "@/assets/images/no-image.jpg"));

const startEditing = () => {
  if (listing.value) {
    editedName.value = listing.value.name;
    editedMeetupLocation.value = listing.value.meetup_location;
    editedQuantity.value = listing.value.quantity;
    editedDescription.value = listing.value.description;
    editedImage.value = listing.value.image;
    editedTags.value = Array.isArray(listing.value.tags) ? listing.value.tags : [];
  }
  if (expire.value) {
    editedExpiration.value = expire.value.expireAt.toString() || "";
  }
  isEditing.value = true;
};

const cancelEditing = () => {
  if (!listing.value) {
    console.warn("Listing is null, cannot cancel editing.");
    return;
  }
  isEditing.value = false;
  editedName.value = listing.value.name;
  editedMeetupLocation.value = listing.value.meetup_location;
  editedQuantity.value = listing.value.quantity;
  editedDescription.value = listing.value.description;
  editedImage.value = listing.value.image;
  editedTags.value = Array.isArray(listing.value.tags) ? listing.value.tags : [];

  if (!expire.value) {
    console.warn("Expire is null");
    return;
  }
  editedExpiration.value = expire.value.expireAt.toString() || "";
};

async function getListing(listingId: string) {
  try {
    const listingResult = await fetchy(`/api/listings/${listingId}`, "GET");
    listing.value = listingResult;
    // expire.value = await fetchy(`expirations/item`, "GET", { query: { itemId: listingId } });
  } catch (_) {
    console.error("Failed to fetch listing details.");
  }
}
const refreshListing = async () => {
  await getListing(props.listingId);
};

const saveChanges = async () => {
  console.log("saving tags", editedTags.value);
  if (!listing.value) {
    console.error("Listing is null, cannot save.");
    return;
  }
  try {
    await fetchy(`/api/listings/${listing.value._id}`, "PATCH", {
      body: {
        name: editedName.value,
        meetup_location: editedMeetupLocation.value,
        quantity: editedQuantity.value,
        image: editedImage.value,
        description: editedDescription.value,
        tags: editedTags.value,
      },
    });
    //await fetchy(`expirations/${expire.value._id}`, "PATCH", { body: { expireDate: editedExpiration.value } });
    isEditing.value = false;
    console.log("Changes saved successfully.");
    await getListing(props.listingId);
  } catch (error) {
    console.error("Failed to save changes:", error);
  }
};

// Navigate to View Claims (Ensure `ClaimView.vue` Route Exists)
const goToViewClaims = async () => {
  if (listing.value && listing.value._id) {
    await router.push({ name: "ClaimView", params: { id: listing.value._id } });
  } else {
    console.error("Listing ID is not available.");
  }
};

onBeforeMount(async () => {
  await getListing(props.listingId);
});
</script>

<template>
  <h1>Listing</h1>
  <div v-if="listing" class="listing-item">
    <div class="image-column">
      <img :src="imageSrc" class="item-image" />
    </div>
    <div class="info-column">
      <!-- Content -->
      <div>
        <!-- listing author -->
        <UserComponent :userId="listing.author" />
        <!-- Item Name -->
        <p><strong>Item:</strong></p>
        <div v-if="isEditing">
          <input v-model="editedName" placeholder="Item Name" />
        </div>
        <div v-else>
          {{ listing.name }}
        </div>

        <!-- Quantity -->
        <p><strong>Quantity:</strong></p>
        <div v-if="isEditing">
          <input v-model="editedQuantity" type="number" placeholder="Quantity" />
        </div>
        <div v-else>
          {{ listing.quantity }}
        </div>

        <!-- Expiration -->
        <p><strong>Expires:</strong></p>
        <div v-if="isEditing">
          <input v-model="editedExpiration" placeholder="mm/dd/yyyy" />
        </div>
        <div v-else-if="expire">
          {{ expire.expireAt }}
        </div>

        <!-- Meetup Location -->
        <p>
          <strong> <span style="font-size: 25px">&#128205;</span> Meetup Location:</strong>
        </p>
        <div v-if="isEditing">
          <input v-model="editedMeetupLocation" placeholder="Meetup Location" />
        </div>
        <div v-else>
          {{ listing.meetup_location }}
        </div>
        <!-- Description -->
        <p><strong>Description:</strong></p>
        <div v-if="isEditing">
          <textarea v-model="editedDescription" placeholder="Description"></textarea>
        </div>
        <div v-else>
          {{ listing.description }}
        </div>

        <!-- Tags -->
        <!-- <p><strong>Tags:</strong></p> -->
        <div v-if="isEditing">
          <TaggingComponent v-model:tags="editedTags" />
        </div>
        <div v-else>
          <span v-for="tag in listing.tags" :key="tag" class="tag tag-bubble tags-container">
            {{ tag }}
          </span>
        </div>
        <!-- Buttons -->
        <div class="action-buttons">
          <!-- Save and Cancel Buttons (Editing Mode) -->
          <button v-if="isEditing" @click="saveChanges">Save</button>
          <button v-if="isEditing" @click="cancelEditing">Cancel</button>

          <!-- Edit Button (Author Only) -->
          <button v-else-if="listing.author === currentUsername" @click="startEditing">Edit</button>

          <!-- Claim Button (Not Claimed) -->
          <button v-else-if="!isClaimed" @click="openClaimForm">Claim</button>

          <!-- Unclaim Button (Already Claimed) -->
          <button v-else @click="unclaimItem">Unclaim</button>

          <!-- View Claims Button (Author Only) -->
          <button v-if="listing.author === currentUsername" @click="goToViewClaims">View Claims</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <p>Loading...</p>
  </div>
  <!-- Make Claim Form Modal -->
  <MakeClaimForm v-if="showClaimForm" :listingId="listing._id" :maxQuantity="listing.quantity" @close="closeClaimForm" @claimMade="refreshListing" />
</template>

<style scoped>
h1 {
  text-align: center;
}
.listing-item {
  display: flex;
  gap: 30px;
}

button {
  margin-right: 0.5em;
}
.image-column {
  flex: 1;
  max-width: 50%;
}

.item-image {
  width: 100%;
  height: auto;
  max-width: 300px;
  margin-bottom: 1em;
}

.info-column {
  flex: 1;
  max-width: 50%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-bubble {
  margin-top: 2em;
  display: inline-block;
  gap: 0.4em;
  background-color: #d0d0d0;
  border-radius: 15px;
  padding: 5px 10px;
  margin-bottom: 0.7em;
}
</style>
