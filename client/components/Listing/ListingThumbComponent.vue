<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const props = defineProps(["listingId"]);

const { currentUsername } = storeToRefs(useUserStore());
const listing = ref<Record<string, string> | null>(null);

const imageSrc = computed(() => listing.value?.image || "https://i.imgur.com/Jyns2YP.png");

async function getListing() {
  try {
    const listingResult = await fetchy(`/api/listings/${props.listingId}`, "GET");
    listing.value = listingResult;
  } catch (_) {
    console.error("Failed to fetch listing details.");
  }
}

function openListing() {
  void router.push(`/listings/${props.listingId}`);
}

onBeforeMount(async () => {
  await getListing();
});
</script>

<template>
  <div v-if="listing" class="thumbnail" @click="openListing">
    <div class="image-container">
      <img :src="imageSrc" />
      <div v-if="listing.hidden" class="claimed-overlay">Claimed</div>
    </div>
    <span>{{ listing.name }}</span>
  </div>
</template>

<style scoped>
.thumbnail {
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
  position: relative; /* Make the container a positioned parent for the overlay */
}

.image-container img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover; /* Ensures the image fills the square without distortion */
}

.claimed-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5); /* Semi-transparent black overlay */
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  font-weight: bold;
  border-radius: 10px; /* Match the border-radius of the image */
}
</style>
