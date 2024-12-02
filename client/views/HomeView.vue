<script setup lang="ts">
import ListingListComponent from "@/components/Listing/ListingListComponent.vue";
import RequestListComponent from "@/components/Request/RequestListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="!isLoggedIn">Please login!</h1>
    </section>
    <h2>Listings</h2>
    <ListingListComponent />
    <h2>Requests</h2>
    <RequestListComponent />
  </main>
</template>
<style>
.thumb-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* Adjusts the number of columns */
  gap: 20px; /* Space between items */
}
.thumbnail img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}
.thumb {
  border: 1px solid #ddd;
  padding: 5px;
  text-align: center;
}
</style>
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
