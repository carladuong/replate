<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { ObjectId } from "mongodb";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref, watch } from "vue";
import RequestThumbComponent from "./RequestThumbComponent.vue";

const props = defineProps(["searchTerm", "username", "historic", "tag"]);

const { isLoggedIn } = storeToRefs(useUserStore());
const loaded = ref(false);
let requests = ref<Array<Record<string, string>>>([]);
const itemsWithTag = ref<Array<string>>();

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
  await getTagged();
  loaded.value = true;
});

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


const filteredRequests = computed(() => {
  const searchTerm = props.searchTerm?.toLowerCase() || "";
  if (props.historic) {
    return requests.value.filter((request) => request && request.name.toLowerCase().includes(searchTerm) && request.hidden);
  } else {
    if (props.tag) {
      return requests.value.filter((request) => request && request.name.toLowerCase().includes(searchTerm) && !request.hidden && itemsWithTag.value?.includes(request._id.toString()));
    } else {
      return requests.value.filter((request) => request && request.name.toLowerCase().includes(searchTerm) && !request.hidden);
    }
  }
});
</script>

<template>
  <section class="thumb-container" v-if="loaded && filteredRequests.length !== 0">
    <article class="thumb" v-for="request in filteredRequests" :key="request._id">
      <RequestThumbComponent :requestId="request._id" />
    </article>
  </section>
  <p class="none" v-else-if="loaded">No requests found</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.none {
  font-size: small;
}
</style>
