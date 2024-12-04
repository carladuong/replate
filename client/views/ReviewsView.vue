<script setup lang="ts">
import ReviewListCompoment from "@/components/Review/ReviewListCompoment.vue";
</script>

<template>
  <ReviewListCompoment :userId="$route.params.id" />
</template>
