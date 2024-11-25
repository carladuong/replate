<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { fetchy } from "@/utils/fetchy";

const props = defineProps<{
  item: { id: number; name: string; quantity: number; author: string; review: string; imageUrl: string; pickupNumber: string; expirationDateandTime: string };
}>();

const { currentUsername } = storeToRefs(useUserStore());
const isEditing = ref(false);
const editedName = ref(props.item.name);
const editedQuantity = ref(props.item.quantity);

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  editedName.value = props.item.name;
  editedQuantity.value = props.item.quantity;
};

const saveChanges = async () => {
  try {
    await fetchy(`/api/items/${props.item.id}`, "PATCH", {
      body: {
        name: editedName.value,
        quantity: editedQuantity.value,
        author: currentUsername.value,
        review: props.item.review,
        imageUrl: props.item.imageUrl,
        pickupNumber: props.item.pickupNumber,
        expirationDateandTime: props.item.expirationDateandTime,
      },
    });
    isEditing.value = false;
  } catch (error) {
    console.error("Failed to save changes:", error);
  }
};
</script>

<template>
  <div class="listing-item">
    <div v-if="isEditing">
      <input v-model="editedName" placeholder="Item Name" />
      <input v-model="editedQuantity" type="number" placeholder="Quantity" />
      <button @click="saveChanges">Save</button>
      <button @click="cancelEditing">Cancel</button>
    </div>
    <div v-else>
      <img :src="props.item.imageUrl" alt="Produce Image" class="produce-image" />
      <p><strong>Name:</strong> {{ props.item.name }}</p>
      <p><strong>Quantity:</strong> {{ props.item.quantity }}</p>
      <p><strong>Author:</strong> {{ props.item.author }}</p>
      <p><strong>Review:</strong> {{ props.item.review }}</p>
      <p><strong>Expiration Date and Time:</strong> {{ props.item.expirationDateandTime }}</p>
      <p><strong>Coordinate Pickup Number:</strong> {{ props.item.pickupNumber }}</p>
      <button v-if="props.item.author === currentUsername" @click="startEditing">Edit</button>
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
