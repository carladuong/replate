<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const props = defineProps<{
  item: { _id: string; name: string; quantity: number; author: string; review: string; imageUrl: string; meetup_location: string };
}>();

const { currentUsername } = storeToRefs(useUserStore());

const emit = defineEmits(["edit"]);

const startEditing = () => {
  emit("edit", props.item);
};
</script>

<template>
  <div class="listing-item">
    <div>
      <img v-if="item.imageUrl" :src="item.imageUrl" alt="Listing Image" class="listing-image" />
      <p><strong>Name:</strong> {{ props.item.name }}</p>
      <p><strong>Quantity:</strong> {{ props.item.quantity }}</p>
      <p><strong>Meetup Location:</strong> {{ props.item.meetup_location }}</p>
      <p><strong>Author:</strong> {{ props.item.author }}</p>
      <p><strong>Review:</strong> {{ props.item.review }}</p>
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

.listing-image {
  width: 100%;
  height: auto;
  max-width: 300px;
  margin-bottom: 1em;
}

button {
  margin-right: 0.5em;
}
</style>