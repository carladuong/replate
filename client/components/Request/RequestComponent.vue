<script setup lang="ts">
import UserComponent from "@/components/Profile/UserComponent.vue";
//import noImage from "@/assets/images/no-image.jpg";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const props = defineProps(["requestId"]);

const { currentUsername } = storeToRefs(useUserStore());
const isEditing = ref(false);
const request = ref<Record<string, string> | null>(null);

const editedName = ref("");
const editedQuantity = ref("");
const editedDescription = ref("");
const editedImage = ref("");

const imageSrc = computed(() => request.value?.image || "@/assets/images/no-image.jpg");

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  if (!request.value) {
    console.warn("Request is null, cannot cancel editing.");
    return;
  }
  isEditing.value = false;
  editedName.value = request.value.name;
  editedQuantity.value = request.value.quantity;
  editedDescription.value = request.value.description;
  editedImage.value = request.value.image;
};

const saveChanges = async () => {
  if (!request.value) {
    console.error("Request is null, cannot save.");
    return;
  }
  try {
    await fetchy(`/api/requests/${request.value._id}`, "PATCH", {
      body: {
        name: editedName.value,
        quantity: editedQuantity.value,
        image: editedImage.value,
        description: editedDescription.value,
        //pickupNumber: props.request.pickupNumber,
      },
    });
    isEditing.value = false;
    await getRequest(props.requestId.value);
  } catch (error) {
    console.error("Failed to save changes:", error);
  }
};

async function getRequest(requestId: string) {
  try {
    const requestResult = await fetchy(`/api/requests/${requestId}`, "GET");
    request.value = requestResult;
    //refs for placeholders when editing
    editedName.value = requestResult.name;
    editedQuantity.value = requestResult.quantity;
    editedDescription.value = requestResult.description || "";
    editedImage.value = requestResult.image || "";
  } catch (_) {
    console.error("Failed to fetch request details.");
  }
}

function goToOfferPage() {
  void router.push(`/makeOffer/${props.requestId}`);
}

function goToViewOffersPage() {
  void router.push(`/viewOffers/${props.requestId}`);
}

onBeforeMount(async () => {
  await getRequest(props.requestId);
});
</script>

<template>
  <h1>Request</h1>
  <div v-if="request" class="request-item">
    <div class="image-column" v-if="imageSrc != '@/assets/images/no-image.jpg'">
      <img :src="imageSrc" class="item-image" />
    </div>
    <div class="info-column">
      <!-- Content -->
      <div>
        <!-- Requester -->
        <UserComponent :userId="request.requester" />
        <!-- Item Name -->
        <p><strong>Item:</strong></p>
        <div v-if="isEditing">
          <input v-model="editedName" placeholder="Item Name" />
        </div>
        <div v-else>
          {{ request.name }}
        </div>

        <!-- Quantity -->
        <p><strong>Quantity:</strong></p>
        <div v-if="isEditing">
          <input v-model="editedQuantity" type="number" placeholder="Quantity" />
        </div>
        <div v-else>
          {{ request.quantity }}
        </div>

        <!-- Description -->
        <p><strong>Description:</strong></p>
        <div v-if="isEditing">
          <textarea v-model="editedDescription" placeholder="Description"></textarea>
        </div>
        <div v-else>
          {{ request.description }}
        </div>

        <!-- Buttons -->
        <div>
          <button v-if="isEditing" @click="saveChanges">Save</button>
          <button v-if="isEditing" @click="cancelEditing">Cancel</button>
          <button v-else-if="request.requester === currentUsername" @click="startEditing">Edit</button>
          <!-- also need to check is reqeust is satisfied (hide==true), in which case no offer option -->
          <button v-else @click="goToOfferPage">Offer</button>
          <button v-if="request.requester === currentUsername" @click="goToViewOffersPage">View Offers</button>
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
.request-item {
  display: flex;
  gap: 20px;
}

button {
  margin-right: 0.5em;
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

button {
  margin-top: 30px;
  width: 100px;
  height: 30px;
}
</style>
