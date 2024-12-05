<script setup lang="ts">
import CreateReportForm from "@/components/Report/CreateReportForm.vue"; // Adjust the path based on your aliases
import { defineProps } from "vue";

const props = defineProps<{
  reportedId?: string;
}>();
</script>

<template>
  <main>
    <h1>Report a User</h1>
    <CreateReportForm :reportedId="props.reportedId" />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 2em;
}
</style>
