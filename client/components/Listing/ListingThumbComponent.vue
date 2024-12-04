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
    <img :src="imageSrc" class="produce-image" />
    <span>{{ listing.name }}</span>
  </div>
</template>
