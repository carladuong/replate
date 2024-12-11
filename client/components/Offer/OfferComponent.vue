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
const number = ref("");
const requester =ref("");
const requestFulfilled = ref(false);

async function getOffer() {
  let result;
  try {
    result = await fetchy(`/api/offers/${props.offerId}`, "GET");
  } catch (_) {
    return;
  }
  offer.value = result;
}

async function getRequestStatus() {
  let result;
  try {
    const reqString = offer.value?.item.toString();
    result = await fetchy(`/api/requests/${reqString}`, "GET");
  } catch (_) {
    return;
  }
  requestFulfilled.value = result.hidden;
  requester.value = result.requester;
}

async function getName() {
  let result;
  try {
    if (offer.value) {
      const offerer = offer.value?.offerer;
      if (offerer) {
        result = await fetchy(`/api/username/${offerer}`, "GET");
      } else {
        result = offerer;
      }
    }
  } catch (_) {
    return;
  }
  name.value = result.username;
  number.value = result.phone;
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
  await getRequestStatus();
});
</script>

<template>
  <div v-if="offer" class="offer">
    <UserComponent :userId="name" />
    <p>Offer sent to: {{ requester }}</p>
    <p>Meeting location: {{ offer.location }}</p>
    <img v-if="offer.imageUrl" :src="offer.imageUrl" :style="{ width: '200px' }" />
    <p v-if="offer.message">Message: {{ offer.message }}</p>
    <div class="buttons" v-if="!requestFulfilled">
      <button v-if="name === currentUsername" @click="deleteOffer(offer._id.toString())">Delete</button>
      <button v-else-if="name !== currentUsername" @click="acceptOffer(offer._id.toString())">Accept</button>
    </div>
    <div class="request-fulfilled" v-else>
      <p v-if="name === currentUsername && offer.accepted">Your offer was accepted! {{ requester }} will contact you soon to schedule a pickup if they haven't already.</p>
      <p v-else-if="name === currentUsername">This request has been fulfilled by another user.</p>
      <p v-else-if="name !== currentUsername && offer.accepted">You've accepted this offer! Contact the user who sent it at {{ number }} to schedule a pickup if you haven't already.</p>
    </div>
  </div>
</template>

<style scoped>
.offer {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 15px;     
}

.request-fulfilled p{
  font-weight: bold;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 1em;
}
</style>
