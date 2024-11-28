<script setup lang="ts">
import ListingViewItem from "@/components/ListingViewItem.vue";
import PostListComponent from "@/components/Post/PostListComponent.vue";
import RequestListComponent from "@/components/Request/RequestListComponent.vue";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onMounted, ref, watch } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const items = ref([]);
const isEditing = ref(false);
const currentListing = ref(null);

const fetchListings = async () => {
  try {
    const response = await fetchy("/api/listings", "GET");
    items.value = response;
  } catch (error) {
    console.error("Failed to fetch listings:", error);
  }
};

const startEditing = (listing) => {
  currentListing.value = { ...listing };
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  currentListing.value = null;
};

const saveChanges = async () => {
  // let imageBase64 = currentListing.value.imageUrl;
  // if (currentListing.value.image) {
  //   const reader = new FileReader();
  //   reader.readAsDataURL(currentListing.value.image);
  //   imageBase64 = await new Promise<string>((resolve) => {
  //     reader.onload = () => resolve(reader.result as string);
  //   });
  // }

  try {
    await fetchy(`/api/listings/${currentListing.value._id}`, "PATCH", {
      body: {
        name: currentListing.value.name,
        meetup_location: currentListing.value.meetup_location,
        image: imageBase64,
        quantity: currentListing.value.quantity,
      },
    });
    await fetchListings();
    cancelEditing();
  } catch (error) {
    console.error("Failed to save changes:", error);
  }
};

const deleteListing = async () => {
  try {
    await fetchy(`/api/listings/${currentListing.value._id}`, "DELETE");
    await fetchListings();
    cancelEditing();
  } catch (error) {
    console.error("Failed to delete listing:", error);
  }
};


onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchListings();
  }
});

watch(isLoggedIn, async (newVal) => {
  if (newVal) {
    await fetchListings();
  }
});
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <PostListComponent />
    <section v-if="isLoggedIn">
      <h2>Items:</h2>
      <ListingViewItem v-for="item in items" :key="item._id" :item="item" @edit="startEditing" />
    </section>

    <div v-if="isEditing" class="modal">
      <div class="modal-content">
        <h2>Edit Listing</h2>
        <form @submit.prevent="saveChanges" class="pure-form pure-form-stacked">
          <fieldset>
            <legend>Edit Listing</legend>
            <div class="pure-control-group">
              <label for="name">Name</label>
              <input id="name" type="text" v-model="currentListing.name" placeholder="Name" required />
            </div>
            <div class="pure-control-group">
              <label for="meetupLocation">Meetup Location</label>
              <input id="meetupLocation" type="text" v-model="currentListing.meetup_location" placeholder="Meetup Location" required />
            </div>
            <div class="pure-control-group">
              <label for="image">Image</label>
              <!-- <input id="image" type="file" @change="handleImageUpload" /> -->
              <input id="image" type="text" v-model="currentListing.imageUrl" />
              <img v-if="currentListing.imageUrl" :src="currentListing.imageUrl" alt="Current Image" class="current-image" />
            </div>
            <div class="pure-control-group">
              <label for="quantity">Quantity</label>
              <input id="quantity" type="number" v-model="currentListing.quantity" placeholder="Quantity" required />
            </div>
            <button type="submit" class="pure-button pure-button-primary">Save Changes</button>
            <button type="button" class="pure-button" @click="cancelEditing">Cancel</button>
            <button type="button" class="pure-button button-error" @click="deleteListing">Delete Listing</button>
          </fieldset>
        </form>
      </div>
    </div>
    <h2>Listings</h2>
    <h2>Requests</h2>
    <RequestListComponent />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 2em;
  border-radius: 8px;
  width: 400px;
}

.pure-control-group {
  margin-bottom: 1em;
}

.current-image {
  max-width: 100px;
  margin-top: 10px;
}
</style>