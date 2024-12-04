<script setup lang="ts">
import UserComponent from "@/components/Profile/UserComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, defineProps, onBeforeMount, ref } from "vue";
import TaggingComponent from "../Tagging/TaggingComponent.vue";

const props = defineProps<{
  listingId: string;
}>();

const { currentUsername } = storeToRefs(useUserStore());
const isEditing = ref(false);
const listing = ref<Record<string, string> | null>(null);

const editedName = ref("");
const editedQuantity = ref("");
const editedMeetupLocation = ref("");
const editedDescription = ref("");
const editedImage = ref("");
const editedTags = ref<string[]>([]);

const imageSrc = computed(() => (isEditing.value ? editedImage.value || "@/assets/images/no-image.jpg" : listing.value?.image || "@/assets/images/no-image.jpg"));

const startEditing = () => {
  if (listing.value) {
    editedName.value = listing.value.name;
    editedQuantity.value = listing.value.quantity;
    editedMeetupLocation.value = listing.value.meetup_location;
    editedDescription.value = listing.value.description;
    editedImage.value = listing.value.image;
    editedTags.value = Array.isArray(listing.value.tags) ? listing.value.tags : [];
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
  editedQuantity.value = listing.value.quantity;
  editedMeetupLocation.value = listing.value.meetup_location;
  editedDescription.value = listing.value.description;
  editedImage.value = listing.value.image;
  editedTags.value = Array.isArray(listing.value.tags) ? listing.value.tags : [];
};

async function getListing(listingId: string) {
  try {
    const listingResult = await fetchy(`/api/listings/${listingId}`, "GET");
    listing.value = listingResult;
    //refs for placeholders when editing
    // editedName.value = listingResult.name;
    // editedQuantity.value = listingResult.quantity;
    // editedMeetupLocation.value = listingResult.meetup_location || "";
    // editedDescription.value = listingResult.description || "";
    // editedImage.value = listingResult.image || "";
  } catch (_) {
    console.error("Failed to fetch listing details.");
  }
}
const saveChanges = async () => {
  if (!listing.value) {
    console.error("Listing is null, cannot save.");
    return;
  }
  try {
    await fetchy(`/api/listings/${listing.value._id}`, "PATCH", {
      body: {
        name: editedName.value,
        quantity: editedQuantity.value,
        meetup_location: editedMeetupLocation.value,
        image: editedImage.value,
        description: editedDescription.value,
        tags: editedTags.value,
        //pickupNumber: props.request.pickupNumber,
      },
    });
    isEditing.value = false;
    await getListing(props.listingId);
    console.log("Changes saved successfully.");
  } catch (error) {
    console.error("Failed to save changes:", error);
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

        <!-- Description -->
        <p><strong>Description:</strong></p>
        <div v-if="isEditing">
          <textarea v-model="editedDescription" placeholder="Description"></textarea>
        </div>
        <div v-else>
          {{ listing.description }}
        </div>

        <!-- Tags Editing -->
        <label for="tags"><strong>Categories:</strong></label>
        <div v-if="isEditing">
          <TaggingComponent v-model:tags="editedTags" />
        </div>
        <!-- Buttons -->
        <div>
          <button v-if="isEditing" @click="saveChanges">Save</button>
          <button v-if="isEditing" @click="cancelEditing">Cancel</button>
          <button v-else-if="listing.author === currentUsername" @click="startEditing">Edit</button>
          <!-- also need to check is lisitng is claimed (hide==true), in which case no claim option -->
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
</style>
