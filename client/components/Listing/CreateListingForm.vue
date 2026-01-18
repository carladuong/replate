<script setup lang="ts">
import TaggingComponent from "@/components/Tagging/TaggingComponent.vue";
import { fetchy } from "@/utils/fetchy"; // Ensure this is set up to handle your API requests
import { ref } from "vue";
import { useRouter } from "vue-router";

// Form fields
const name = ref("");
const meetupLocation = ref("");
const imageUrl = ref("");
const quantity = ref<number | null>(null);
const expireDate = ref("");
const description = ref("");
const tags = ref<string[]>([]); // Add tags field

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

// Create a new listing
const createListing = async () => {
  imageError.value = "";
  dateError.value = "";
  quantityError.value = "";

  if (!name.value || !meetupLocation.value || !quantity.value || !imageUrl.value || !description.value) {
    alert("All fields are required.");
    return;
  }

  if (!isValidUrl(imageUrl.value)) {
    imageError.value = "Please enter a valid image URL.";
    return;
  }

  if (!isValidDate(expireDate.value)) {
    dateError.value = "Please select a valid expiration date.";
    return;
  }

  if (quantity.value! < 1 || quantity.value! > 100) {
    quantityError.value = "Quantity must be between 1 and 100.";
    return;
  }

  try {
    // Make API call to create a listing
    const response = await fetchy("/api/listings", "POST", {
      body: {
        name: name.value,
        meetup_location: meetupLocation.value,
        image: imageUrl.value,
        quantity: quantity.value,
        expireDate: expireDate.value,
        description: description.value,
        tags: tags.value, // Include tags in the request
      },
    });
    if (response.msg) {
      alert("Listing created successfully!");
      // Reset form fields
      name.value = "";
      meetupLocation.value = "";
      imageUrl.value = "";
      quantity.value = null;
      expireDate.value = "";
      description.value = "";
      tags.value = []; // Reset tags
      // Navigate back to the home view
      await router.push({ name: "Home" });
    } else {
      throw new Error("Failed to create the listing.");
    }
  } catch (error) {
    console.error("Error creating listing:", error);
    alert("There was an error creating the listing.");
  }
};
</script>

<template>
  <div class="form-container">
    <form @submit.prevent="createListing" class="pure-form pure-form-stacked create-listing-form">
      <label for="name">Item Name</label>
      <input id="name" type="text" v-model="name" placeholder="Name" required />

      <label for="meetupLocation"> <span style="font-size: 25px">&#128205;</span>Meet Up Location </label>
      <input id="meetupLocation" type="text" v-model="meetupLocation" placeholder="Meetup Location" required />

      <label for="imageUrl">Image URL</label>
      <input id="imageUrl" type="url" v-model="imageUrl" placeholder="https://example.com/image.jpg" required />
      <small v-if="imageError" style="color: #c72d12">{{ imageError }}</small>

      <label for="quantity">Quantity</label>
      <input id="quantity" type="number" v-model.number="quantity" placeholder="Quantity" required min="1" max="100" />
      <small v-if="quantityError" style="color: #c72d12">{{ quantityError }}</small>

      <label for="expireDate">Expire Date</label>
      <input id="expireDate" type="date" v-model="expireDate" required />
      <small v-if="dateError" style="color: #c72d12">{{ dateError }}</small>

      <label for="description">Description</label>
      <input id="description" v-model="description" placeholder="Description" required />

      <label for="tags">Categories and Dietary Restrictions</label>
      <TaggingComponent v-model:tags="tags" />

      <div class="faq-link">
        <p>
          Have questions?
          <RouterLink to="/faq" class="faq-anchor">Visit our FAQ</RouterLink>
        </p>
      </div>

      <button type="submit" class="pure-button pure-button-primary">Create Listing</button>
    </form>

    <!-- Image Preview on the Right -->
    <div class="image-container">
      <img :src="imageUrl && isValidUrl(imageUrl) ? imageUrl : 'assets/images/no-image.png'" class="item-image" />
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

.create-listing-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
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
