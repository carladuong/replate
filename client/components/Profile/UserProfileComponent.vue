<script setup lang="ts">
import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["userId"]);

const rating = ref(0);
const reviewNumber = ref(0);
const requestsNumber = ref(0);
const listingsNumber = ref(0);
const user = ref<Record<string, string> | null>(null);
const loaded = ref(false);
const menuVisible = ref(false);

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

function toggleMenu() {
  menuVisible.value = !menuVisible.value;
}

function handleMenuOption(option: string) {
  menuVisible.value = false; // Close menu
  if (user.value && option === "review") {
    void router.push(`/createReview/${user.value._id.toString()}`);
  } else if (option === "report") {
    console.log("Report selected");
  } else if (option === "cancel") {
    console.log("Cancel selected");
  }
}

function openReviews() {
  if (user.value) {
    void router.push(`/reviews/${user.value._id.toString()}`);
  }
}

onBeforeMount(async () => {
  await getUserInfo();
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded && user" class="user-container">
    <div class="user-avatar">
      <img v-if="user.avatar" :src="user.avatar" alt="Circle Avatar" />
      <div v-else class="empty-avatar"></div>
    </div>
    <!-- User Details -->
    <div class="user-details">
      <div class="user-info">
        <text class="username">{{ user.username }}</text>

        <!-- Star Rating -->
        <div class="rating" @click="openReviews">
          <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= rating }"> ★ </span>
          <span class="rating-text">({{ reviewNumber }}) Read reviews</span>
        </div>
      </div>

      <!-- Requests and Listings -->
      <div class="user-stats">
        <text>
          <strong>{{ listingsNumber }}</strong> listings
        </text>
        <text>
          <strong>{{ requestsNumber }}</strong> requests
        </text>
      </div>
    </div>
    <button class="more" @click="toggleMenu">...</button>

    <!-- Menu Overlay -->
    <div v-if="menuVisible" class="menu-overlay" @click="toggleMenu">
      <div class="menu" @click.stop>
        <button @click="handleMenuOption('review')">Review</button>
        <button @click="handleMenuOption('report')">Report</button>
        <button @click="handleMenuOption('cancel')">Cancel</button>
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
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.user-details {
  flex: 1;
  margin-left: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 3em;
}

.username {
  font-size: 16px;
  font-weight: 500;
}
.rating {
  display: flex;
  align-items: center;
  gap: 5px;
}

.star {
  font-size: 16px;
  color: #e0e0e0;
}

.star.filled {
  color: #ffc107;
}
.rating-text {
  font-size: 14px;
  color: #757575;
}
.user-stats {
  font-size: 14px;
  margin-top: 1em;
  gap: 3em;
  display: flex;
}

.user-avatar {
  width: 70px;
  height: 70px;
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

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.menu {
  background: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 300px;
  max-width: 90%;
}

.menu button {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 10px;
}

.menu button:hover {
  background: #f0f0f0;
}
</style>
