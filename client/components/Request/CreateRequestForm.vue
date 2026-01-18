<script setup lang="ts">
import { fetchy } from "@/utils/fetchy"; // Ensure this is set up to handle your API requests
import { ref } from "vue";
import { useRouter } from "vue-router";

// Form fields
const name = ref("");
const imageUrl = ref("");
const quantity = ref(0);
const needBy = ref("");
const description = ref("");

// Validation helpers
const imageError = ref("");
const dateError = ref("");
const quantityError = ref("");

const isValidUrl = (url: string) => {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};
const isValidDate = (value: string) => {
  if (!value) return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
};

// Use Vue Router
const router = useRouter();

// Create a new Request
const createRequest = async () => {
  imageError.value = "";
  dateError.value = "";
  quantityError.value = "";

  if (!name.value || !quantity.value || !needBy.value || !description.value) {
    alert("All fields are required.");
    return;
  }

  if (imageUrl.value && !isValidUrl(imageUrl.value)) {
    imageError.value = "Please enter a valid image URL.";
    return;
  }
  if (!isValidDate(needBy.value)) {
    dateError.value = "Please select a valid date.";
    return;
  }
  if (quantity.value < 1 || quantity.value > 100) {
    quantityError.value = "Quantity must be between 1 and 100.";
    return;
  }

  try {
    // Make API call to create a Request
    const response = await fetchy("/api/requests", "POST", {
      body: {
        name: name.value,
        quantity: quantity.value,
        needBy: needBy.value,
        ...(imageUrl.value ? { image: imageUrl.value } : {}),
        description: description.value,
      },
    });
    if (response.msg) {
      alert("Request created successfully!");
      // Reset form fields
      name.value = "";
      quantity.value = 0;
      needBy.value = "";
      description.value = "";
      // Navigate back to the home view
      await router.push({ name: "Home" });
    } else {
      throw new Error("Failed to create the Request.");
    }
  } catch (error) {
    console.error("Error creating Request:", error);
    alert("There was an error creating the Request.");
  }
};
</script>

<template>
  <div class="form-container">
    <form @submit.prevent="createRequest" class="pure-form pure-form-stacked create-request-form">
      <label for="name">Item Name</label>
      <input id="name" type="text" v-model="name" placeholder="Name" required />

      <label for="imageUrl">Image URL (optional)</label>
      <input id="imageUrl" type="url" v-model="imageUrl" placeholder="https://example.com/image.jpg" />
      <small v-if="imageError" style="color: #c72d12">{{ imageError }}</small>

      <label for="quantity">Quantity</label>
      <input id="quantity" type="number" v-model.number="quantity" placeholder="Quantity" required min="1" max="100" />
      <small v-if="quantityError" style="color: #c72d12">{{ quantityError }}</small>

      <label for="needBy">Need By</label>
      <input id="needBy" type="date" v-model="needBy" required />
      <small v-if="dateError" style="color: #c72d12">{{ dateError }}</small>

      <label for="description">Description</label>
      <input id="description" v-model="description" placeholder="Description" required />

      <div class="faq-link">
        <p>
          Have questions?
          <RouterLink to="/faq" class="faq-anchor">Visit our FAQ</RouterLink>
        </p>
      </div>
      <button type="submit" class="pure-button pure-button-primary">Create Request</button>
    </form>

    <div class="image-container">
      <img :src="imageUrl && isValidUrl(imageUrl) ? imageUrl : 'assets/images/no-image.jpg'" class="item-image" />
    </div>
  </div>
</template>

<style scoped>
.form-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2em;
  padding: 1em;
}

.create-request-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

input {
  padding: 0.5em 0.6em;
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
  width: 400px;
  height: 400px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  background-color: #f3f3f3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid #ccc;
}
</style>

<!-- <script setup lang="ts">
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
</style> -->
