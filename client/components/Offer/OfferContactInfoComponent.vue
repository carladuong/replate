<script setup lang="ts">

import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["offerId"]);

// let offer = ref<Record<string, string>>();
let offer = ref<Record<string, string> | null>(null);
let request = ref<Record<string, string> | null>(null);
let contact = ref<Record<string, string>>();
let itemName = ref("");
let contactUsername = ref("");
let contactNumber = ref("");
let location = ref("");


async function getOffer() {
    let results;
    try {
        console.log(props.offerId)
        console.log(`/api/offers/${props.offerId}`)
        results = await fetchy(`/api/offers/${props.offerId}`, "GET");
        console.log(results)
    } catch (_) {
        console.log('failed')
        return;
    }
    offer.value = results;
    location.value = results.location;
}

async function getRequest() {
  let result;
  try {
    const request = offer.value?.item;
    result = await fetchy(`/api/requests/${request}`, "GET");
  } catch (_) {
    return;
  }
  console.log(result)
  request.value = result;
  itemName.value = result.name;
}

async function getUser() {
    let result;
  try {
    const userId = offer.value?.offerer;
    result = await fetchy(`/api/username/${userId}`, "GET");
  } catch (_) {
    return;
  }
  contact.value = result;
  console.log(result)
  contactNumber.value = result.phone;
  contactUsername.value = result.username;
}

function goHome() {
    void router.push('/');
}

onBeforeMount(async () => {
  await getOffer();
  await getRequest();
  await getUser();
  console.log(contactUsername.value, contactNumber.value, location.value, itemName.value)
});

</script>


<template>
  <main>
    <h1>You've accepted an offer for {{itemName}} from {{contactUsername}}! </h1>
    <h2>Contact them at {{ contactNumber }} to arrange a pickup at {{ location }}.</h2>
    <button @click="goHome">Back</button>
  </main>
</template>


<style scoped>
h1 {
  text-align: center;
}

h2 {
  text-align: center;
}
</style>
