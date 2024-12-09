<script setup lang="ts">
import router from "@/router";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const name = ref("");
const quantity = ref(0);
const needBy = ref("");
const image = ref("");
const description = ref("");
const emit = defineEmits(["refreshPosts"]);

const createRequest = async (name: string, quantity: number, needBy: string, image?: string, description?: string) => {
  try {
    if (image && description) {
      await fetchy("/api/requests", "POST", {
        body: { name, quantity, needBy, image, description },
      });
    } else if (image) {
      await fetchy("/api/requests", "POST", {
        body: { name, quantity, needBy, image },
      });
    } else if (description) {
      await fetchy("/api/requests", "POST", {
        body: { name, quantity, needBy, description },
      });
    } else {
      await fetchy("/api/requests", "POST", {
        body: { name, quantity, needBy },
      });
    }
  } catch (_) {
    return;
  }
  void router.push("/");
  emit("refreshPosts");
  emptyForm();
};

const emptyForm = () => {
  name.value = "";
  quantity.value = 0;
  needBy.value = "";
  image.value = "";
  description.value = "";
};
</script>

<template>
  <form @submit.prevent="createRequest(name, quantity, needBy, image, description)">
    <label for="name"> What are you looking for? </label>
    <input id="name" type="text" v-model="name" placeholder="Apples" required />

    <label for="quantity"> Quantity </label>
    <input id="quantity" type="number" v-model="quantity" placeholder="0" min="0" step="1" required />

    <label for="needBy"> Need by </label>
    <input id="needBy" type="text" v-model="needBy" placeholder="MM/DD/YYYY" required />

    <label for="image"> Image URL (optional) </label>
    <input id="image" type="text" v-model="image" />
    <div v-if="image!==''" class="image-container">
        <img :src="image" class="item-image" />
    </div>

    <label for="description"> Description (optional) </label>
    <textarea id="description" v-model="description"></textarea>

    <button type="submit" class="pure-button-primary pure-button">Create Request</button>
  </form>
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
