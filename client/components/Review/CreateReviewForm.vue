<script setup lang="ts">
import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { ref } from "vue";

//form fields
const props = defineProps(["userId"]);
const rating = ref(0);
const message = ref("");

const createReview = async () => {
  try {
    const response = await fetchy("/api/reviews", "POST", {
      body: {
        subjectId: props.userId,
        rating: rating.value,
        message: message.value,
      },
    });
    if (response.msg) {
      alert("Review created successfully!");
      // Reset form fields
      rating.value = 0;
      message.value = "";
      // Navigate back to the home view
      await router.push({ name: "Home" });
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
        <input id="rating" type="number" v-model="rating" placeholder="Rating" required />
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
