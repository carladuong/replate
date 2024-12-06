<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["offerId"]);

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
    offer.value = result
}

async function getName() {
    let result;
    try {
        if (offer) {
            const offerer = offer.value?.offerer
            console.log('offerer', offerer)
            if (offerer) {
                result = (await fetchy(`/api/username/${offerer}`, "GET")).username;
            } else {
                console.log('no offer')
                result = offerer;
            }
        }
    } catch (_) {
        return;
    }
    name.value = result
}

async function acceptOffer(oid: string) {
    await fetchy("/api/offers/hide", "PATCH", {body: {offerId: oid}});
    void router.push(`/offerAccepted/${oid}`);
}

async function deleteOffer(oid: string) {
    await fetchy(`/api/offers/${oid}`, "DELETE");
}

onBeforeMount(async () => {
  await getOffer();
  await getName();
});
</script>

<template>
  <div v-if="offer" class="offer">
    <p class="offerer">{{ name }} at {{ offer.location }}</p>
    <p class="description" v-if="offer.description">{{ offer.description }}</p>
    <img v-if="offer.imageUrl" :src="offer.imageUrl" :style="{ width: '200px' }"/>
    <div class="buttons">
        <button @click="acceptOffer(offer._id.toString())">Accept</button>
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