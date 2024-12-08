<script setup lang="ts">
import router from "@/router";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["requestId"]);

const image = ref("");
const location = ref("");
const message = ref("");

const makeOffer = async (location: string, image?: string, message?: string) => {
  try {
    const requestId = props.requestId;
    if (image && message) {
      await fetchy("/api/offers", "POST", {
        body: { requestId, location, image, message },
      });
    } else if (image) {
      await fetchy("/api/offers", "POST", {
        body: { requestId, location, image },
      });
    } else if (message) {
      await fetchy("/api/offers", "POST", {
        body: { requestId, location, message },
      });
    } else {
      await fetchy("/api/offers", "POST", {
        body: { requestId, location },
      });
    }
  } catch (_) {
    return;
  }
  emptyForm();
  void router.push(`/requests/${props.requestId}`);
};

function goBack() {
  void router.push(`/requests/${props.requestId}`);
}

const emptyForm = () => {
  location.value = "";
  image.value = "";
  message.value = "";
};
</script>

<template>
  <h1>Offer</h1>
  <form @submit.prevent="makeOffer(location, image, message)">
    <label for="image"> Image URL </label>
    <input id="image" type="text" v-model="image" />

    <label for="location"> 📍 Meetup </label>
    <input id="location" type="text" v-model="location" required />

    <label for="message"> Message </label>
    <input id="message" type="text" v-model="message" />

    <button type="submit" class="pure-button-primary pure-button">Send</button>
  </form>
  <button @click="goBack">Cancel</button>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}
</style>
