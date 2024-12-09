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

// Use Vue Router
const router = useRouter();

// Create a new listing
const createListing = async () => {
  if (!name.value || !meetupLocation.value || !quantity.value || !imageUrl.value || !description.value) {
    alert("All fields are required.");
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
  <form @submit.prevent="createListing" class="pure-form pure-form-stacked">
      <label for="name">Name</label>
      <input id="name" type="text" v-model="name" placeholder="Name" required />
    
      <label for="meetupLocation"> <span style="font-size: 25px">&#128205;</span>Meet Up Location</label>
      <input id="meetupLocation" type="text" v-model="meetupLocation" placeholder="Meetup Location" required />
    
      <label for="imageUrl">Image URL</label>
      <input id="imageUrl" type="text" v-model="imageUrl" placeholder="Image URL" required />
      <div v-if="imageUrl!==''" class="image-container">
        <img :src="imageUrl" class="item-image" />
      </div>

      <label for="quantity">Quantity</label>
      <input id="quantity" type="number" v-model="quantity" placeholder="Quantity" required />

      <label for="expireDate">Expire Date</label>
      <input id="expireDate" type="string" v-model="expireDate" placeholder="mm/dd/yyyy" required />
    
      <label for="description">Description</label>
      <input id="description" v-model="description" placeholder="Description" required>

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
</template>

<style scoped>

form {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
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
