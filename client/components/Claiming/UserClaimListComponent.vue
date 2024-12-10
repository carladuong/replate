<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import ListingThumbComponent from "../Listing/ListingThumbComponent.vue";

const props = defineProps(["username"]);

const { isLoggedIn } = storeToRefs(useUserStore());
const loaded = ref(false);
let claims = ref<Array<Record<string, string>>>([]);
let listings = ref<Array<Record<string, string>>>([]);

async function getClaims() {
  let results;
  try {
    results = await fetchy("/api/claims", "GET", { query: { claimer: props.username } });
  } catch (_) {
    console.log("failed");
    return;
  }
  claims.value = results;
}

async function getListings() {
  let result;
  try {
    claims.value?.forEach(async (claim) => {
      result = await fetchy(`/api/listings/${claim.item}`, "GET");
      listings.value.push(result);
    });
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  await getClaims();
  await getListings();
  loaded.value = true;
});
</script>

<template>
  <p v-if="claims">You're viewing claims you've made.</p>
  <p>{{ claims }}</p>
  <section class="claim-container" v-if="loaded && listings.length !== 0">
    <article v-for="listing in listings" :key="listing._id">
      <ListingThumbComponent :listingId="listing._id" />
    </article>
  </section>
  <p v-else-if="loaded">No claims yet.</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.offer-container {
  display: flex;
  flex-direction: column;
  padding: 1em;
}

article {
  border-radius: 1em;
  border: 2px solid #000;
  gap: 0.5em;
  padding: 1em;
  margin-bottom: 10px;
}
</style>
