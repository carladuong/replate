<script setup lang="ts">
import noImage from "@/assets/images/no-image.jpg";
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const props = defineProps(["requestId"]);

const { currentUsername } = storeToRefs(useUserStore());
const request = ref<Record<string, string> | null>(null);

const imageSrc = computed(() => request.value?.image || noImage);

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
      <div v-if="request.hidden" class="overlay">
        <span class="overlay-text">Fulfilled</span>
      </div>
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
  position: relative;
}

.image-container img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover; /* Ensures the image fills the square without distortion */
}

/* Overlay styling */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6); /* Semi-transparent black */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px; /* Match the image's border radius */
}

.overlay-text {
  color: white;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
}
</style>
