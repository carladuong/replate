<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const props = defineProps(["requestId"]);

const { currentUsername } = storeToRefs(useUserStore());
const request = ref<Record<string, string> | null>(null);

const imageSrc = computed(() => request.value?.image || "@/assets/images/no-image.jpg");

async function getRequest() {
  try {
    const requestResult = await fetchy(`/api/requests/${props.requestId}`, "GET");
    request.value = requestResult;
  } catch (_) {
    console.error("Failed to fetch request details.");
  }
}

function openRequest() {
  void router.push(`/requests/${props.requestId}`);
}

onBeforeMount(async () => {
  await getRequest();
});
</script>

<template>
  <div v-if="request" class="thumbnail" @click="openRequest">
    <img :src="imageSrc" class="produce-image" />
    <span>{{ request.name }}</span>
  </div>
</template>
