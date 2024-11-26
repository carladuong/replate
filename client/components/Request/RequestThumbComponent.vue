<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";

const props = defineProps(["requestId"]);

const { currentUsername } = storeToRefs(useUserStore());
const request = ref<Record<string, string> | null>(null);

const imageSrc = computed(() => request.value?.image || "@/assets/images/no-image.jpg");

async function getRequest(requestId: string) {
  try {
    const requestResult = await fetchy(`/api/requests/${props.requestId}`, "GET");
    request.value = requestResult;
  } catch (_) {
    console.error("Failed to fetch request details.");
  }
}

onBeforeMount(async () => {
  await getRequest(props.requestId.value);
});
</script>

<template>
  <div v-if="request" class="request-thumbnail">
    <img :src="imageSrc" class="produce-image" />
    <p>{{ request.name }}</p>
  </div>
</template>
