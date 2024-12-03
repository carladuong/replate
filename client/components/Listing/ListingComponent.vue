<script setup lang="ts">
import UserComponent from "@/components/Profile/UserComponent.vue";
import TaggingComponent from "@/components/Tagging/TaggingComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const props = defineProps(["listingId"]);

const { currentUsername } = storeToRefs(useUserStore());
const isEditing = ref(false);
const listing = ref<Record<string, any> | null>(null);

const editedName = ref("");
const editedQuantity = ref<number | null>(null);
const editedMeetupLocation = ref("");
const editedDescription = ref("");
const editedImage = ref("");
const editedTags = ref<string[]>([]);

const imageSrc = computed(() => (isEditing.value ? editedImage.value || "@/assets/images/no-image.jpg" : listing.value?.image || "@/assets/images/no-image.jpg"));

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  if (!listing.value) {
    console.warn("Listing is null, cannot cancel editing.");
    return;
  }
  isEditing.value = false;
  editedName.value = listing.value.name;
  editedQuantity.value = listing.value.quantity;
  editedMeetupLocation.value = listing.value.meetup_location;
  editedDescription.value = listing.value.description;
  editedImage.value = listing.value.image;
  editedTags.value = listing.value.tags;
};

const saveChanges = async () => {
  if (!listing.value) {
    console.error("Listing is null, cannot save.");
    return;
  }
  try {
    const response = await fetch(`/api/listings/${listing.value._id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: editedName.value,
        quantity: editedQuantity.value,
        meetup_location: editedMeetupLocation.value,
        image: editedImage.value,
        description: editedDescription.value,
        tags: editedTags.value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save changes: ${errorData.message}`);
    }
    const updatedListing = await response.json();
    listing.value = updatedListing; // Update the local state with the new data
    isEditing.value = false;
  } catch (error) {
    console.error("Failed to save changes:", error);
    isEditing.value = false; // Ensure editing mode is exited even if there is an error
  }
};

async function getListing(listingId: string) {
  try {
    const listingResult = await fetchy(`/api/listings/${listingId}`, "GET");
    listing.value = listingResult;
    // Refs for placeholders when editing
    editedName.value = listingResult.name;
    editedQuantity.value = listingResult.quantity;
    editedMeetupLocation.value = listingResult.meetup_location || "";
    editedDescription.value = listingResult.description || "";
    editedImage.value = listingResult.image || "";
    editedTags.value = listingResult.tags || [];
  } catch (_) {
    console.error("Failed to fetch listing details.");
  }
}

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
        <!-- Listing author -->
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

        <!-- Meetup Location -->
        <p><strong>Meetup Location:</strong></p>
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
        <p><strong>Tags:</strong></p>
        <div v-if="isEditing">
          <TaggingComponent v-model:tags="editedTags" />
        </div>
        <div v-else>
          <span v-for="tag in listing.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>

        <!-- Buttons -->
        <div class="buttons">
          <button v-if="isEditing" @click="saveChanges">Save</button>
          <button v-if="isEditing" @click="cancelEditing">Cancel</button>
          <button v-else-if="listing.author === currentUsername" @click="startEditing">Edit</button>
          <!-- also need to check if listing is claimed (hide==true), in which case no claim option -->
          <button v-else>Claim</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Loading...</p>
  </div>
</template>

<style scoped>
h1 {
  text-align: center;
}
.listing-item {
  display: flex;
  gap: 20px;
}

button {
  margin-right: 0.5em;
  margin-bottom: 0.5em;
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

.tag {
  background-color: #e0e0e0;
  border-radius: 1em;
  padding: 0.5em;
  margin-right: 0.5em;
}

.buttons {
  margin-top: 20px; /* Add margin to create space between tags and buttons */
}
</style>