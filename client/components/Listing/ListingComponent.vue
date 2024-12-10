<script setup lang="ts">
import UserComponent from "@/components/Profile/UserComponent.vue";
import noImage from "@/assets/images/no-image.jpg";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, defineProps, onBeforeMount, ref } from "vue";
import TaggingComponent from "../Tagging/TaggingComponent.vue";

const props = defineProps(["listingId"]);

const { currentUsername } = storeToRefs(useUserStore());
const isEditing = ref(false);
const listing = ref<Record<string, string> | null>(null);
const expire = ref<Record<string, string> | null>(null);
const quantity = ref("0");

const editedName = ref("");
const editedQuantity = ref("");
const editedExpiration = ref("");
const editedMeetupLocation = ref("");
const editedDescription = ref("");
const editedImage = ref("");
const editedTags = ref<string[]>([]);

const imageSrc = computed(() => listing.value?.image || noImage);

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
    console.log(listingResult);
    listing.value = listingResult;
    expire.value = await fetchy(`expirations/item`, "GET", { query: { itemId: listingId } });
  } catch (_) {
    console.error("Failed to fetch listing details.");
  }
}
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

async function claimListing(quantity: string) {
  if (!/^\d*$/.test(quantity)) {
    return { msg: "Please enter a positive integer." };
  }
  const new_quantity = parseInt(quantity);
  const claim = await fetchy("/api/claims", "POST", { body: { listingId: props.listingId, quantity: new_quantity } });
  if (claim.msg.startsWith("Success")) {
    void router.push(`/listingClaimed/${props.listingId}`);
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
        <div>
          <!-- Editing buttons, visible only if not claimed and the user is the author -->
          <button v-if="isEditing" @click="saveChanges">Save</button>
          <button v-if="isEditing" @click="cancelEditing">Cancel</button>
          <button v-else-if="listing.author === currentUsername && !listing.hidden" @click="startEditing">Edit</button>

          <!-- Show 'Claimed' button if the listing is hidden (claimed) -->
          <button v-if="listing.hidden" disabled>Claimed</button>

          <!-- Form for claiming the listing if it's not claimed and the user is not the author -->
          <form v-if="listing.author !== currentUsername && !listing.hidden" @submit.prevent="claimListing(quantity)">
            <label for="quantity">Enter the quantity you wish to claim:</label>
            <input id="quantity" type="text" v-model="quantity" />
            <button type="submit">Claim</button>
          </form>
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
  gap: 30px;
}

button {
  margin-right: 0.5em;
}
/* .image-column {
  flex: 1;
  max-width: 50%;
}

.item-image {
  width: 100%;
  height: auto;
  max-width: 300px;
  margin-bottom: 1em;
} */

form {
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  margin-bottom: 30px;
  gap: 10px;
}

form button {
  width: 100px;
}

form input {
  width: 100px;
}

.image-column {
  width: 400px; /* Set the square width */
  height: 400px; /* Set the square height */
  overflow: hidden; /* Ensure excess image is hidden */
  margin-bottom: 15px;
  margin-right: 100px;
  margin-left: 50px;
}

.image-column img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover; /* Ensures the image fills the square without distortion */
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
  background-color: #d6401a;
  color: white;
  border-radius: 15px;
  padding: 5px 10px;
  margin-bottom: 0.7em;
  margin-right: 0.75em;
}
</style>
