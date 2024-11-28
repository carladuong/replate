<script setup lang="ts">
import RequestComponent from "@/components/Request/RequestComponent.vue";
</script>

<template>
  <main>
    <RequestComponent :requestId="$route.params.id" />
  </main>
</template>
