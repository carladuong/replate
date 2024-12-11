<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import OfferComponent from "./OfferComponent.vue";

const props = defineProps(["username"]);

const { isLoggedIn } = storeToRefs(useUserStore());
const loaded = ref(false);
let offers = ref<Array<Record<string, string>>>([]);

async function getOffers() {
  let results;
  try {
    results = await fetchy("/api/offers", "GET", { query: { offerer: props.username } });
  } catch (_) {
    console.log("failed");
    return;
  }
  offers.value = results;
}

onBeforeMount(async () => {
  await getOffers();
  console.log(offers.value);
  loaded.value = true;
});
</script>

<template>
  <p>Here you can view the offers you have made.</p>
  <section class="offer-container" v-if="loaded && offers.length !== 0">
    <article v-for="offer in offers" :key="offer._id">
      <OfferComponent :offerId="offer._id" @updateOffers="getOffers" />
    </article>
  </section>
  <p v-else-if="loaded">No offers yet.</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.offer-container {
  display: flex;
  flex-direction: column;
  padding: 1em;
}

</style>
