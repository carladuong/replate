<script setup lang="ts">
import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["userId"]);

const rating = ref(0);
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
    rating.value = ratings.reduce((a, b) => a + b) / ratings.length;
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
    <p class="username">{{ props.userId }}</p>
    <p>Rating {{ rating }}</p>
    <button @click="toggleMenu">...</button>

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
  padding: 10px;
  display: flex;
  justify-content: space-between;
}

.username {
  font-size: 16px;
  font-weight: 500;
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
