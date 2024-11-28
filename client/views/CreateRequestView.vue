<script setup lang="ts">
import CreateListingForm from "@/components/Request/CreateListingForm.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <section>
        <h1>Request a Food</h1>
        <CreateListingForm />
    </section>
  </main>
</template>
