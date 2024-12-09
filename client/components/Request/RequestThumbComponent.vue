<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const props = defineProps(["requestId"]);

const { currentUsername } = storeToRefs(useUserStore());
const request = ref<Record<string, string> | null>(null);

const imageSrc = computed(() => request.value?.image || "@/assets/images/no-image.jpg");

async function getRequest() {
  try {
    const requestResult = await fetchy(`/api/requests/${props.requestId}`, "GET");
    request.value = requestResult;
  } catch (_) {
    console.error("Failed to fetch request details.");
  }
}

function openRequest() {
  void router.push(`/requests/${props.requestId}`);
}

onBeforeMount(async () => {
  await getRequest();
});
</script>

<template>
  <div v-if="request" class="thumbnail" @click="openRequest">
    <div class="image-container">
      <img :src="imageSrc" class="produce-image" />
    </div>
    <span>{{ request.name }}</span>
  </div>
</template>

<style scoped>
.thumbnail {
  /* background-color: #fabb7d; */
  /* border: 2px solid #d15c2a;  */
  border-radius: 15px;
  padding: 10px;
  width: 150px;
  height: 200px;
}

.image-container {
  width: 150px; /* Set the square width */
  height: 150px; /* Set the square height */
  overflow: hidden; /* Ensure excess image is hidden */
  margin-bottom: 15px;
}

.image-container img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover; /* Ensures the image fills the square without distortion */
}
</style>
