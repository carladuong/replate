<script setup lang="ts">
import ListingViewItem from "@/components/ListingViewItem.vue";
import PostListComponent from "@/components/Post/PostListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const items = [
  { id: 1, name: "Item 1", quantity: 10, author: "alice", review: "4/5 stars", imageUrl: "@/assets/images/oranges.jpeg", expirationDateandTime: "...", pickupNumber: "123-456-7891" },
  { id: 2, name: "Item 2", quantity: 5, author: "bob", review: "5/5", imageUrl: "@/assets/images/oranges.jpeg", expirationDateandTime: "...", pickupNumber: "..." },
  { id: 3, name: "Item 3", quantity: 8, author: "alice", review: "3/5", imageUrl: "@/assets/images/oranges.jpeg", expirationDateandTime: "...", pickupNumber: "..." },
];
</script>

<template>
  <main>
    <h1>Home Page</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login!</h1>
    </section>
    <PostListComponent />
    <section>
      <h2>Items:</h2>
      <ListingViewItem v-for="item in items" :key="item.id" :item="item" />
    </section>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
