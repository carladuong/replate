<script setup lang="ts">
import ReviewListCompoment from "@/components/Review/ReviewListCompoment.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <ReviewListCompoment :userId="$route.params.id" />
</template>
