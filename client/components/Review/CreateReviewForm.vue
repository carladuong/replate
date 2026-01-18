<script setup lang="ts">
import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { ref } from "vue";

//form fields
const props = defineProps(["userId"]);
const rating = ref(0);
const ratingError = ref("");
const message = ref("");

const createReview = async () => {
  ratingError.value = "";
  if (rating.value < 1 || rating.value > 5) {
    ratingError.value = "Rating must be between 1 and 5.";
    return;
  }

  try {
    const response = await fetchy("/api/reviews", "POST", {
      body: {
        subjectId: props.userId,
        rating: rating.value,
        message: message.value,
      },
    });
    if (response.msg) {
      // Reset form fields
      rating.value = 0;
      message.value = "";
      // Navigate to user's reviews
      await router.push(`/reviews/${props.userId}`);
    } else {
      throw new Error("Failed to create the review.");
    }
  } catch (error) {
    console.error("Error creating review:", error);
  }
};
</script>

<template>
  <form @submit.prevent="createReview" class="pure-form pure-form-stacked">
    <fieldset>
      <legend>Create a New Review</legend>
      <div class="pure-control-group">
        <label for="rating">Rating</label>
        <input id="rating" type="number" v-model.number="rating" placeholder="1-5" required min="1" max="5" step="1" />
        <small v-if="ratingError" style="color: #c72d12">{{ ratingError }}</small>
      </div>
      <div class="pure-control-group">
        <label for="message">Tell us more</label>
        <input id="message" type="text" v-model="message" placeholder="Type the review" />
      </div>
      <button type="submit" class="pure-button pure-button-primary">Submit Review</button>
    </fieldset>
  </form>
</template>

<style scoped>
.pure-control-group {
  margin-bottom: 1em;
}
</style>
