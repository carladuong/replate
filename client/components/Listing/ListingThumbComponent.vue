<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const props = defineProps(["listingId"]);

const { currentUsername } = storeToRefs(useUserStore());
const listing = ref<Record<string, string> | null>(null);

const imageSrc = computed(() => listing.value?.image || "@/assets/images/no-image.jpg");

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
      <img :src="imageSrc" class="produce-image" />
    </div>
    <span>{{ listing.name }}</span>
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
