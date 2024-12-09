<script setup lang="ts">

import router from "@/router";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["listingId"]);

let listing = ref<Record<string, string> | null>(null);
let contact = ref<Record<string, string>>();
let itemName = ref("");
let contactUsername = ref("");
let contactNumber = ref("");
let location = ref("");

async function getListing() {
    let results;
    try {
        results = await fetchy(`/api/listings/${props.listingId}`, "GET");
    } catch (_) {
        return;
    }
    listing.value = results;
    location.value = results.meetup_location;
    itemName.value = results.name;
    contactUsername.value = results.author;
}

async function getUser() {
    let result;
  try {
    result = await fetchy(`/api/users/${contactUsername.value}`, "GET");
  } catch (_) {
    return;
  }
  contact.value = result;
  contactNumber.value = result.phone;
}

function goHome() {
    void router.push('/');
}

onBeforeMount(async () => {
  await getListing();
  await getUser();
});

</script>


<template>
  <main>
    <h1>You've claimed a listing for {{itemName}} from {{contactUsername}}! </h1>
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
