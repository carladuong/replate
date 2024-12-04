<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import UserComponent from "../Profile/UserComponent.vue";

const props = defineProps(["review"]);

const { currentUsername } = storeToRefs(useUserStore());

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
  <div v-if="props.review.message">
    <span class="timestamp">Written {{ weeksAgo }}</span>
    <p class="review-message">{{ props.review.message }}</p>
  </div>
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
</style>
