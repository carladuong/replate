<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["requestId"]);

const { currentUsername } = storeToRefs(useUserStore());
const isEditing = ref(false);
const request = ref<Record<string, string> | null>(null);

const editedName = ref("");
const editedQuantity = ref("");
const editedDescription = ref("");
const editedImage = ref("");

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
  } catch (error) {
    console.error("Failed to save changes:", error);
  }
};

async function getRequest(requestId: string) {
  try {
    const requestResult = await fetchy(`/api/circles/${requestId}`, "GET");
    request.value = requestResult;
    editedName.value = requestResult.name;
    editedQuantity.value = requestResult.quantity;
    editedDescription.value = requestResult.description || "";
    editedImage.value = requestResult.image || "";
  } catch (_) {
    console.error("Failed to fetch circle details.");
  }
}

onBeforeMount(async () => {
  await getRequest(props.requestId);
});
</script>

<template>
  <div class="request-item">
    <div v-if="request">
      <!-- the edit button is only visible if the author of the item is the same as the current user -->
      <div v-if="isEditing && request">
        <input v-model="editedName" placeholder="Item Name" />
        <input v-model="editedQuantity" type="number" placeholder="Quantity" />
        <button @click="saveChanges">Save</button>
        <button @click="cancelEditing">Cancel</button>
      </div>
      <div v-else>
        <img :src="request.image" alt="Produce Image" class="produce-image" />
        <p><strong>Requester:</strong> {{ request.requester }}</p>
        <p><strong>Item:</strong> {{ request.name }}</p>
        <p><strong>Description</strong> {{ request.description }}</p>
        <p><strong>Quantity:</strong> {{ request.quantity }}</p>
        <p><strong>Expiration Date and Time:</strong> needs expiring concept</p>
        <!-- this line checks if the author is the user, and if so, displays the edit button -->
        <button v-if="request.requester === currentUsername" @click="startEditing">Edit</button>
        <button v-else>Offer</button>
      </div>
    </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </div>
</template>

<style scoped>
.listing-item {
  border: 1px solid #ccc;
  padding: 1em;
  border-radius: 4px;
  margin-bottom: 1em;
}

button {
  margin-right: 0.5em;
}
</style>
