<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import UserComponent from "../Profile/UserComponent.vue";

const props = defineProps(["review"]);

const { currentUsername } = storeToRefs(useUserStore());
// State to track whether the review is being edited
const isEditing = ref(false);
const editedMessage = ref(props.review.message);

function startEditing() {
  isEditing.value = true;
  editedMessage.value = props.review.message; // Set the initial value
}

function cancelEditing() {
  isEditing.value = false;
  editedMessage.value = props.review.message; // Revert changes
}

async function saveChanges() {
  if (!props.review || !props.review._id) {
    console.error("Review or Review ID is missing.");
    return;
  }
  try {
    await fetchy(`/api/reviews/${props.review._id.toString()}`, "PATCH", {
      body: {
        message: editedMessage.value,
      },
    });
    isEditing.value = false;
  } catch (error) {
    console.error("Failed to save changed", error);
    editedMessage.value = props.review.message;
  }
}

function generateStarArray(rating: number): number[] {
  return Array.from({ length: 5 }, (_, i) => Math.max(0, Math.min(1, rating - i)));
}

// Calculate how many weeks ago the review was created
const weeksAgo = computed(() => {
  const now = new Date();
  const reviewDate = new Date(props.review.dateCreated);
  const diffInMs = now.getTime() - reviewDate.getTime();
  const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));
  return diffInWeeks > 0 ? `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago` : "Less than a week ago";
});
</script>

<template>
  <UserComponent :userId="props.review.reviewer" class="hide-rating" />
  <p class="review-rating">
    <span>Rating:</span>
    <span class="star-rating">
      <span v-for="(fill, index) in generateStarArray(props.review.rating)" :key="index" class="star">
        <span class="star-filled" :style="{ width: fill * 100 + '%' }"></span>
      </span>
    </span>
  </p>
  <div>
    <span class="timestamp">Written {{ weeksAgo }}</span>
    <!-- Show editable text area or static message based on editing state -->
    <div v-if="isEditing">
      <textarea v-model="editedMessage" class="edit-area"></textarea>
      <button @click="saveChanges">Save</button>
      <button @click="cancelEditing">Cancel</button>
    </div>
    <p v-else class="review-message">{{ editedMessage }}</p>
  </div>

  <!-- Edit button visible only if the current user is the reviewer -->
  <button v-if="props.review.reviewer === currentUsername && !isEditing" @click="startEditing">Edit</button>
</template>

<style>
.hide-rating .star-rating {
  display: none;
}
</style>

<style scoped>
.review-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8em;
  font-weight: 400;
}

.star-rating {
  display: flex;
  gap: 5px;
  color: #ccc;
}

.star {
  position: relative;
  width: 15px;
  height: 15px;
  background-color: #ccc;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.star-filled {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #ffc107;
  clip-path: inherit;
}

.timestamp {
  font-size: 0.8em;
  color: #777;
}

.edit-area {
  width: 100%;
  height: 80px;
  margin: 5px 0;
}
</style>
