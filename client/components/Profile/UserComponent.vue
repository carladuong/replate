<script setup lang="ts">
import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { computed, onBeforeMount, ref } from "vue";
const props = defineProps(["userId"]);

const rating = ref(0);
const reviewNumber = ref(0);
const user = ref<Record<string, string> | null>(null);
const loaded = ref(false);

// Compute the array for rendering stars
const starArray = computed(() => {
  return Array.from({ length: 5 }, (_, index) => (rating.value - index > 1 ? 1 : Math.max(0, rating.value - index)));
});

async function getUserInfo() {
  let reviews;
  try {
    user.value = await fetchy(`/api/users/${props.userId}`, "GET");
  } catch (e) {
    return e;
  }

  if (user.value) {
    try {
      let id = user.value._id.toString();
      reviews = (await fetchy("/api/reviews", "GET", { query: { subjectId: id } })) as { rating: number }[];
    } catch (e) {
      return e;
    }
  }

  if (reviews && reviews.length > 0) {
    const ratings = reviews.map((review) => review.rating);
    reviewNumber.value = ratings.length;
    rating.value = ratings.reduce((a, b) => a + b) / reviewNumber.value;
  } else {
    rating.value = 0;
  }
}

function openProfile() {
  void router.push({ name: "Profile View", params: { id: props.userId } });
}

onBeforeMount(async () => {
  await getUserInfo();
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded && user" class="user-container" @click="openProfile">
    <div class="user-avatar">
      <img v-if="user.avatar" :src="user.avatar" alt="Circle Avatar" />
      <div v-else class="empty-avatar"></div>
    </div>
    <div class="user-info">
      <text class="username">{{ props.userId }}</text>
      <div class="star-rating">
        <div v-for="(fill, index) in starArray" :key="index" class="star">
          <div class="star-filled" :style="{ width: fill * 100 + '%' }"></div>
        </div>
        ({{ reviewNumber }})
      </div>
    </div>
  </div>
  <div v-else-if="loaded && !user">
    <p>Error loading user info.</p>
  </div>
  <div v-else>
    <p>Loading user info...</p>
  </div>
</template>

<style scoped>
.user-container {
  display: flex;
  gap: 1em;
  align-items: center;
}

.username {
  font-size: 16px;
  font-weight: 500;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-avatar {
  width: 100%;
  height: 100%;
  background-color: #ccc;
  border-radius: 50%;
}

/* Container for the stars */
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
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); /* Shape the container into a star */
}

/* Filled part of the star */
.star-filled {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #ffc107;
  clip-path: inherit;
}
</style>
