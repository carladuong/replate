<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import UserComponent from "../Profile/UserComponent.vue";

const props = defineProps(["offerId"]);
const emit = defineEmits(["updateOffers"]);

const { currentUsername } = storeToRefs(useUserStore());
const offer = ref<Record<string, string> | null>(null);
const name = ref("");

async function getOffer() {
  let result;
  try {
    result = await fetchy(`/api/offers/${props.offerId}`, "GET");
  } catch (_) {
    return;
  }
  offer.value = result;
}

async function getName() {
  let result;
  try {
    if (offer.value) {
      const offerer = offer.value?.offerer;
      if (offerer) {
        result = (await fetchy(`/api/username/${offerer}`, "GET")).username;
      } else {
        result = offerer;
      }
    }
  } catch (_) {
    return;
  }
  name.value = result;
}

async function acceptOffer(oid: string) {
  await fetchy("/api/offers/hide", "PATCH", { body: { offerId: oid } });
  void router.push(`/offerAccepted/${oid}`);
}

async function deleteOffer(oid: string) {
  try {
    await fetchy(`/api/offers/${oid}`, "DELETE");
    emit("updateOffers");
  } catch (error) {
    console.error("Failed to delete offer:", error);
  }
}

onBeforeMount(async () => {
  await getOffer();
  await getName();
});
</script>

<template>
  <div v-if="offer" class="offer">
    <UserComponent :userId="name" />
    <p>Meeting location: {{ offer.location }}</p>
    <img v-if="offer.imageUrl" :src="offer.imageUrl" :style="{ width: '200px' }" />
    <p v-if="offer.message">Message: {{ offer.message }}</p>
    <div class="buttons">
      <button v-if="name === currentUsername" @click="deleteOffer(offer._id.toString())">Delete</button>
      <button v-else @click="acceptOffer(offer._id.toString())">Accept</button>
    </div>
  </div>
</template>

<style scoped>
.offer {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 1em;
}
</style>
