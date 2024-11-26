<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import RequestThumbComponent from "./RequestThumbComponent.vue";

const { isLoggedIn } = storeToRefs(useUserStore());
const loaded = ref(false);
let requests = ref<Array<Record<string, string>>>([]);

async function getRequests() {
  let results;
  try {
    results = await fetchy("/api/requests", "GET");
  } catch (_) {
    return;
  }
  requests.value = results;
}

onBeforeMount(async () => {
  await getRequests();
  loaded.value = true;
});
</script>

<template>
  <h1>Requests</h1>
  <section class="requests" v-if="loaded && requests.length !== 0">
    <article class="thumb" v-for="request in requests" :key="request._id">
      <RequestThumbComponent :requestId="request._id" />
    </article>
  </section>
  <p v-else-if="loaded">No requests found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.requests {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); /* Adjusts the number of columns */
  gap: 20px; /* Space between items */
  padding: 20px; /* Add some padding to the grid container */
}

.thumb {
  border: 1px solid #ddd;
  padding: 2em;
  overflow: hidden;
}
</style>
