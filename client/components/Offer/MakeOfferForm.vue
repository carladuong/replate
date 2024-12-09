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
    <div v-if="image!==''" class="image-container">
        <img :src="image" class="item-image" />
    </div>

    <label for="location"> 📍 Meetup Location</label>
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
  gap: 1em;
  padding: 1em;
}

input {
  padding: .5em .6em;
    display: inline-block;
    border: 1px solid #ccc;
    box-shadow: inset 0 1px 3px #ddd;
    border-radius: 4px;
    vertical-align: middle;
    box-sizing: border-box;
}

textarea {
  padding: .5em .6em;
    display: inline-block;
    border: 1px solid #ccc;
    box-shadow: inset 0 1px 3px #ddd;
    border-radius: 4px;
    vertical-align: middle;
    box-sizing: border-box;
}

button {
  background-color: #69825a;
  border-radius: 10px;
}

.image-container {
  width: 400px; /* Set the square width */
  height: 400px; /* Set the square height */
  overflow: hidden; /* Ensure excess image is hidden */
  margin-bottom: 15px;
  margin-right: 100px;
  margin-left: 50px;
}

.image-container img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover; /* Ensures the image fills the square without distortion */
}
</style>
