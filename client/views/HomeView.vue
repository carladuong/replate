<script setup lang="ts">
import ListingListComponent from "@/components/Listing/ListingListComponent.vue";
import RequestListComponent from "@/components/Request/RequestListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { ref } from "vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const categories = ["Ingredient", "Non-Perishable", "Produce", "Gluten-Free", "Vegan", "No Nuts", "Vegetarian"];
const selectedCategory = ref("");

const searchTerm = ref("");

const toggleTag = (tag: string) => {
  if (selectedCategory.value === tag) {
    selectedCategory.value = "";
  } else if (selectedCategory.value === "") {
    selectedCategory.value = tag;
  } else {
    return;
  }
  console.log(selectedCategory.value)
};
</script>

<template>
  <main>
    <div class="control-bar">
      <input type="text" v-model="searchTerm" placeholder="Search items" />
    </div>
    <div class="categories">
      <p>Select a tag:</p>
      <div class="category-options">
        <span v-for="category in categories" :key="category" :class="['category-option', { selected: selectedCategory===category }]" @click="toggleTag(category)">
          {{ category }}
        </span>
      </div>
    </div>
    <section>
      <h1 v-if="!isLoggedIn">Please login!</h1>
    </section>
    <h2>Listings</h2>
    <ListingListComponent :searchTerm="searchTerm" :tag="selectedCategory" />
    <h2>Requests</h2>
    <RequestListComponent :searchTerm="searchTerm" :tag="selectedCategory"/>
  </main>
</template>

<style scoped>

.thumb-container {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, 1fr); /* Two rows */
  gap: 5px;
  overflow-x: auto; /* Enable horizontal scrolling */
  overflow-y: hidden; /* Prevent vertical scrolling */
  padding: 10px;
  scroll-behavior: smooth;
  align-items: center;
  margin: 30px;
}

.thumb-container::-webkit-scrollbar {
  height: 8px;
}

.thumb-container::-webkit-scrollbar-thumb {
  background-color: #d15c2a; /* Customize scrollbar color */
  border-radius: 4px; /* Rounded scrollbar */
}

.thumb-container::-webkit-scrollbar-track {
  background-color: #fabb7d; /* Scrollbar track color */
}

.control-bar {
  padding: 1em;
  margin-bottom: 20px;
}
.control-bar input[type="text"] {
  flex: 1;
  padding: 0.5em;
  border-radius: 4px;
  border: 1px solid #fabb7d;
  width: 100%;
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



.tagging-component {
  display: flex;
  gap: 1em;
}
.categories,
.dietary-restrictions {
  display: flex;
  flex-direction: row;
  gap: 1em;
  align-items: center;
  margin-bottom: 30px;
}
.category-options,
.dietary-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}
.category-option,
.dietary-option {
  background-color: #fabb7d;
  border-radius: 1em;
  padding: 0.5em;
  cursor: pointer;
  margin: 0;
  transition: background-color 0.2s;
  text-align: center;
  align-items: center;
}
.category-option.selected,
.dietary-option.selected {
  background-color: #d15c2a;
  color: white;
}
</style>
