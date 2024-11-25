<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
// import { fetchy } from "@/utils/fetchy";

// props is a way to pass data from a parent component to a child component. in this case, the parent component is HomeView.vue and the child component is ListingViewItem.vue  
// the item prop is an object with the following properties: id, name, quantity, author, review, imageUrl, pickupNumber, and expirationDateandTime, which is used for one list in the listing array in HomeView.vue
const props = defineProps<{
  item: { id: number; name: string; quantity: number; author: string; review: string; imageUrl: string; pickupNumber: string; expirationDateandTime: string };
}>();

const { currentUsername } = storeToRefs(useUserStore());
const isEditing = ref(false);
const editedName = ref(props.item.name);
const editedQuantity = ref(props.item.quantity);

//still changing based on th backend defined properties
// const startEditing = () => {
//   isEditing.value = true;
// };

// const cancelEditing = () => {
//   isEditing.value = false;
//   editedName.value = props.item.name;
//   editedQuantity.value = props.item.quantity;
// };

// const saveChanges = async () => {
//   try {
//     await fetchy(`/api/items/${props.item.id}`, "PATCH", {
//       body: {
//         name: editedName.value,
//         quantity: editedQuantity.value,
//         author: currentUsername.value,
//         review: props.item.review,
//         imageUrl: props.item.imageUrl,
//         pickupNumber: props.item.pickupNumber,
//         expirationDateandTime: props.item.expirationDateandTime,
//       },
//     });
//     isEditing.value = false;
//   } catch (error) {
//     console.error("Failed to save changes:", error);
//   }
// };
</script>

<template>
  <div class="listing-item">
    <!-- the edit button is only visible if the author of the item is the same as the current user -->
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
      <!-- this line checks if the author is the user, and if so, displays the edit button -->
      <button v-if="props.item.author === currentUsername" @click="startEditing">Edit</button>
      <button v-else @click="claimItem">Claim</button>
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
