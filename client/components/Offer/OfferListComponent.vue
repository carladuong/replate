<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import OfferComponent from "./OfferComponent.vue";

const props = defineProps(["requestId"]);

const { isLoggedIn } = storeToRefs(useUserStore());
const loaded = ref(false);
let offers = ref<Array<Record<string, string>>>([]);
let request = ref<Record<string, string> | null>(null);

async function getOffers() {
  let results;
  try {
    console.log(props.requestId);
    results = await fetchy("/api/offers", "GET", { query: { requestId: props.requestId } });
  } catch (_) {
    console.log("failed");
    return;
  }
  offers.value = results;
}

async function getRequest() {
  let result;
  try {
    result = await fetchy(`/api/requests/${props.requestId}`, "GET");
  } catch (_) {
    return;
  }
  request.value = result;
}

function goBackToRequest() {
  void router.push(`/requests/${props.requestId}`);
}

onBeforeMount(async () => {
  await getOffers();
  console.log(offers.value);
  await getRequest();
  loaded.value = true;
});
</script>

<template>
  <button @click="goBackToRequest">Back</button>
  <h1>Offers</h1>
  <p v-if="request">You're viewing offers you've received for {{ request.name }}. Once you choose to accept one offer, you will get the offerer's contact to schdule a meet-up.</p>
  <section class="offer-container" v-if="loaded && offers.length !== 0">
    <article v-for="offer in offers" :key="offer._id">
      <OfferComponent :offerId="offer._id" />
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

article {
  border-radius: 1em;
  border: 2px solid #000;
  gap: 0.5em;
  padding: 1em;
  margin-bottom: 10px;
}
</style>
