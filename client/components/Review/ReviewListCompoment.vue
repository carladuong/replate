<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import ReviewComponent from "./ReviewComponent.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const props = defineProps(["userId"]);
const reviews = ref<Array<Record<string, string>>>([]);

const loaded = ref(false);

async function getReviews() {
  let reviewResults;
  try {
    reviewResults = await fetchy("/api/reviews", "GET", { query: { subjectId: props.userId } });
  } catch (e) {
    return e;
  }
  reviews.value = reviewResults;
}

function openReviewForm() {
  void router.push(`/createReview/${props.userId}`);
}

onBeforeMount(async () => {
  await getReviews();
  loaded.value = true;
});
</script>

<template>
  <h1>Reviews</h1>
  <section class="reviews-container" v-if="loaded && reviews.length !== 0">
    <article v-for="review in reviews" :key="review._id">
      <ReviewComponent :review="review" />
    </article>
  </section>
  <p v-else-if="loaded">No reviews found</p>
  <p v-else>Loading...</p>
  <div class="button-container" v-if="currentUsername !== props.userId">
    <button class="reviewButton" @click="openReviewForm">Review</button>
  </div>
</template>
<style scoped>
.reviews-container article {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 1em;
  margin-bottom: 1em;
}

.reviews-container article:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
}
.reviewButton {
  display: block; /* Ensures it's treated as a block element for centering */
  margin: 0 auto; /* Horizontally center the button */
  padding: 10px 20px; /* Adjust padding for a larger button */
  font-size: 16px; /* Increase font size */
}
.button-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
