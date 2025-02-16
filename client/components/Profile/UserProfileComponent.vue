<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const props = defineProps(["userId"]);

const rating = ref(0);
const reviewNumber = ref(0);
const user = ref<Record<string, string> | null>(null);
const loaded = ref(false);
const menuVisible = ref(false);
const listingsCount = ref(0);
const offersCount = ref(0);
const requestsCount = ref(0);
const userId = ref(props.userId);

async function getUserCounts() {
  try {
    console.log("Fetching user counts for useId:", userId.value); // Debug log (currenly in string format)
    const counts = await fetchy(`/api/userCounts/${userId.value}`, "GET");
    listingsCount.value = counts.listings;
    console.log("Listings Count:", listingsCount);
    requestsCount.value = counts.requests;
  } catch (e) {
    console.error("Failed to fetch user counts:", e);
  }
  console.log("Users after update:", listingsCount.value, offersCount.value, requestsCount.value);
}

async function getUserInfo() {
  let reviews;
  try {
    user.value = await fetchy(`/api/users/${props.userId}`, "GET");
  } catch (e) {
    return e;
  }

  if (user.value) {
    try {
      userId.value = user.value._id.toString();
      console.log("Fetching reviews for userId:", userId.value);
      reviews = (await fetchy("/api/reviews", "GET", { query: { subjectId: userId.value } })) as { rating: number }[];
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
    void router.push({
      name: "Report",
      params: { reportedId: user.value ? user.value._id.toString() : "" },
    });
  } else if (option === "edit") {
    void router.push("/setting");
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
  await getUserCounts();
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

      <!-- Display Report message 
      <div v-if="isUserReported" class="error-message">
        <p>This user has been reported {{ numberOfReports }} times.</p>
      </div> -->
      <!-- Requests and Listings -->

      <div class="user-stats">
        <text>
          <strong>{{ listingsCount }}</strong> listings
        </text>
        <text>
          <strong>{{ requestsCount }}</strong> requests
        </text>
      </div>
    </div>
    <button class="more" @click="toggleMenu">...</button>

    <!-- Menu Overlay -->
    <div v-if="menuVisible" class="menu-overlay" @click="toggleMenu">
      <div class="menu" @click.stop>
        <button v-if="currentUsername !== props.userId" @click="handleMenuOption('review')">Review</button>
        <button v-if="currentUsername !== props.userId" @click="handleMenuOption('report')">Report</button>
        <!-- Only if user's profile -->
        <button v-if="currentUsername === props.userId" @click="handleMenuOption('edit')">Edit Profile</button>
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
  color: black;
}

.menu button:hover {
  background: #f0f0f0;
}

.error-message {
  color: red;
  margin-top: 5px;
  font-weight: bold;
}

.more {
  margin: 20px;
}
</style>
