<script setup lang="ts">
import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
const props = defineProps(["userId"]);

const rating = ref(0);
const user = ref<Record<string, string> | null>(null);
const loaded = ref(false);

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
    <p class="username">{{ props.userId }}</p>
    <p>Rating {{ rating }}</p>
    <button>...</button>
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
</style>
