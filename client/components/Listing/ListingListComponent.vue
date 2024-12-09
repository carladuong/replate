<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import ListingThumbComponent from "./ListingThumbComponent.vue";

const props = defineProps<{
  searchTerm?: string;
  username?: string;
  historic?: boolean;
}>();

const { isLoggedIn } = storeToRefs(useUserStore());
const loaded = ref(false);
let listings = ref<Array<Record<string, string>>>([]);

async function getListings() {
  let results;
  try {
    if (props.username) {
      results = await fetchy("/api/listings", "GET", { query: { author: props.username } });
    } else {
      results = await fetchy("/api/listings", "GET");
    }
  } catch (_) {
    return;
  }
  listings.value = results;
}

const filteredListings = computed(() => {
  const searchTerm = props.searchTerm?.toLowerCase() || "";
  if (props.historic) {
    return listings.value.filter((listing) => listing && listing.name.toLowerCase().includes(searchTerm) && listing.hidden);
  } else {
    return listings.value.filter((listing) => listing && listing.name.toLowerCase().includes(searchTerm) && !listing.hidden);
  }
});

onBeforeMount(async () => {
  await getListings();
  loaded.value = true;
});
</script>

<template>
  <section class="thumb-container" v-if="loaded && listings.length !== 0">
    <article class="thumb" v-for="listing in filteredListings" :key="listing._id">
      <ListingThumbComponent :listingId="listing._id" />
    </article>
  </section>
  <p v-else-if="loaded">No listings found</p>
  <p v-else>Loading...</p>
</template>

<style scoped></style>
