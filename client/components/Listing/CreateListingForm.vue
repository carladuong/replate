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
    <fieldset>
      <legend>Create a New Listing</legend>
      <div class="pure-control-group">
        <label for="name">Name</label>
        <input id="name" type="text" v-model="name" placeholder="Name" required />
      </div>
      <div class="pure-control-group">
        <label for="meetupLocation">Meetup Location</label>
        <input id="meetupLocation" type="text" v-model="meetupLocation" placeholder="Meetup Location" required />
      </div>
      <div class="pure-control-group">
        <label for="imageUrl">Image URL</label>
        <input id="imageUrl" type="text" v-model="imageUrl" placeholder="Image URL" required />
      </div>
      <div class="pure-control-group">
        <label for="quantity">Quantity</label>
        <input id="quantity" type="number" v-model="quantity" placeholder="Quantity" required />
      </div>
      <div class="pure-control-group">
        <label for="description">Description</label>
        <textarea id="description" v-model="description" placeholder="Description" required></textarea>
      </div>
      <div class="pure-control-group">
        <label for="tags">Categories and Dietary Restrictions</label>
        <TaggingComponent v-model:tags="tags" />
      </div>
      <button type="submit" class="pure-button pure-button-primary">Create Listing</button>
    </fieldset>
  </form>
</template>

<style scoped>
.pure-control-group {
  margin-bottom: 1em;
}
</style>
