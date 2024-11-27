<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { fetchy } from "@/utils/fetchy"; // Ensure this is set up to handle your API requests

// Form fields
const name = ref("");
const meetupLocation = ref("");
// const image = ref<File | null>(null);
const quantity = ref<number | null>(null);

// Use Vue Router
const router = useRouter();

// Handle image upload
// const handleImageUpload = (event: Event) => {
//   const target = event.target as HTMLInputElement;
//   if (target.files && target.files.length > 0) {
//     image.value = target.files[0];
//   }
// };

// Create a new listing
const createListing = async () => {
  if (!name.value || !meetupLocation.value || !quantity.value) {
    alert("All fields are required.");
    return;
  }

  // Convert image to base64 string
  //   const reader = new FileReader();
  //   reader.readAsDataURL(image.value);
  //   reader.onload = async () => {
  //     const imageBase64 = reader.result as string;

  try {
    // Make API call to create a listing
    const response = await fetchy("/api/listings", "POST", {
      body: {
        name: name.value,
        meetup_location: meetupLocation.value,
        //image: imageBase64,
        quantity: quantity.value,
      },
    });
    if (response.msg) {
      alert("Listing created successfully!");
      // Reset form fields
      name.value = "";
      meetupLocation.value = "";
      //image.value = null;
      quantity.value = null;
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
      <!-- <div class="pure-control-group">
        <label for="image">Image</label>
        <input id="image" type="file" @change="handleImageUpload" required />
      </div> -->
      <div class="pure-control-group">
        <label for="quantity">Quantity</label>
        <input id="quantity" type="number" v-model="quantity" placeholder="Quantity" required />
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