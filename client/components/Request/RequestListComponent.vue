<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import RequestThumbComponent from "./RequestThumbComponent.vue";

const props = defineProps<{
  username?: string; // Optional
}>();

const { isLoggedIn } = storeToRefs(useUserStore());
const loaded = ref(false);
let requests = ref<Array<Record<string, string>>>([]);

async function getRequests() {
  let results;
  try {
    if (props.username) {
      results = await fetchy("/api/requests", "GET", { query: { requester: props.username } });
    } else {
      results = await fetchy("/api/requests", "GET");
    }
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
  <section class="thumb-container" v-if="loaded && requests.length !== 0">
    <article class="thumb" v-for="request in requests" :key="request._id">
      <RequestThumbComponent :requestId="request._id" />
    </article>
  </section>
  <p v-else-if="loaded">No requests found</p>
  <p v-else>Loading...</p>
</template>

<style scoped></style>
