<script setup lang="ts">
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
        console.log(props.requestId)
        results = await fetchy("/api/offers", "GET", { body: {requestId: props.requestId}})
    } catch (_) {
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
  request.value = result
}

onBeforeMount(async () => {
  await getOffers();
  console.log(offers.value)
  await getRequest();
  loaded.value = true;
});

</script>

<template>
  <h1>Offers</h1>
  <p v-if="request">You're viewing offers you've received for {{ request.name }}</p>
  <section class="thumb-container" v-if="loaded && offers.length !== 0">
    <article v-for="offer in offers" :key="offer._id">
      <OfferComponent :offerId="offer._id" />
    </article>
  </section>
  <p v-else-if="loaded">No offers yet.</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
article {
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}
</style>
