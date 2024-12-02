<script setup lang="ts">
import CreateRequestForm from "@/components/Request/CreateRequestForm.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
      <h1>Request a Food</h1>
      <CreateRequestForm />
    </section>
  </main>
</template>
