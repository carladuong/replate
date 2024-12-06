<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["offerId"]);

const { currentUsername } = storeToRefs(useUserStore());
const offer = ref<Record<string, string> | null>(null);

async function getOffer() {
    let result;
    try {
        result = await fetchy(`/api/offers/${props.offerId}`, "GET");
    } catch (_) {
        return;
    }
    offer.value = result
}

async function acceptOffer(oid: string) {
    await fetchy("/api/offers/hide", "PATCH", {query: {offerId: oid}});
}

onBeforeMount(async () => {
  await getOffer();
});
</script>

<template>
  <div v-if="offer" class="offer">
    <p class="offerer">{{ offer.offerer }} at {{ offer.location }}</p>
    <p class="description" v-if="offer.description">{{ offer.description }}</p>
    <img v-if="offer.imageUrl" :src="offer.imageUrl" />
    <button @click="acceptOffer(offer._id)">Accept</button>
  </div>
</template>

<style scoped>

.offer {
    border-radius: 1em;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    padding: 1em;
  }

</style>