<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { ObjectId } from "mongodb";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref, watch } from "vue";
import ListingThumbComponent from "./ListingThumbComponent.vue";

const props = defineProps(["searchTerm", "username", "historic", "tag"]);

const { isLoggedIn } = storeToRefs(useUserStore());
const loaded = ref(false);
let listings = ref<Array<Record<string, string>>>([]);
const itemsWithTag = ref<Array<string>>();

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

async function getTagged() {
  let results: ObjectId[];
  console.log(props.tag)
  try {
    if (props.tag) {
      console.log('in fetchy')
      results = await fetchy(`/api/tagged/${props.tag}`, "GET");
      itemsWithTag.value = results.map(t => t.toString());
      console.log(itemsWithTag.value)
    } else {
      console.log(props.tag)
    }
  } catch (_) {
    console.log('did not fetchy')
    return;
  }
}

watch(
      () => props.tag,
      async (newTag, oldTag) => {
        await getTagged();
      },
      { immediate: true } // Fetch immediately when the component is mounted
    );

const filteredListings = computed(() => {
  const searchTerm = props.searchTerm?.toLowerCase() || "";
  if (props.historic) {
    return listings.value.filter((listing) => listing && listing.name.toLowerCase().includes(searchTerm) && listing.hidden);
  } else {
    if (props.tag) {
      return listings.value.filter((listing) => listing && listing.name.toLowerCase().includes(searchTerm) && !listing.hidden && itemsWithTag.value?.includes(listing._id.toString()));
    } else {
      return listings.value.filter((listing) => listing && listing.name.toLowerCase().includes(searchTerm) && !listing.hidden);
    }
  }
});

onBeforeMount(async () => {
  await getListings();
  await getTagged();
  loaded.value = true;
});
</script>

<template>
  <section class="thumb-container" v-if="loaded && filteredListings.length !== 0">
    <article class="thumb" v-for="listing in filteredListings" :key="listing._id">
      <ListingThumbComponent :listingId="listing._id" />
    </article>
  </section>
  <p class="none" v-else-if="loaded">No listings found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.none {
  font-size: small;
}
</style>
