<script setup lang="ts">
import CreateReviewForm from "@/components/Review/CreateReviewForm.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
      <h1>Request a Food</h1>
      <CreateReviewForm :userId="$route.params.id" />
    </section>
  </main>
</template>
