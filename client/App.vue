<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount, ref } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn, currentUsername } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());
const router = useRouter();

const isModalOpen = ref(false);

function toggleModal() {
  isModalOpen.value = !isModalOpen.value;
}
// Make sure to update the session before mounting the app in case the user is already logged in

onBeforeMount(async () => {
  try {
    await userStore.updateSession();
    if (isLoggedIn.value) {
      await router.push(`/`);
    } else {
      await router.push("/login");
    }
  } catch {
    await router.push("/login");
  }
});
</script>

<template>
  <header>
    <nav>
      <div class="title">
        <RouterLink :to="{ name: 'Home' }">
          <h1>🍞 RePlate </h1>
        </RouterLink>
      </div>
      <ul>
        <li class="link">
          <RouterLink :to="{ name: 'Home' }" :class="{ underline: currentRouteName == 'Home' }"> Home </RouterLink>
        </li>
        <li class="link" v-if="isLoggedIn && isModalOpen">
          <RouterLink :to="{ name: 'Create Listing' }" class="modal-link">Create Listing</RouterLink>
        </li>
        <li class="link">
          <RouterLink v-if="isLoggedIn && isModalOpen" :to="{ name: 'Create Request' }" class="modal-link">Create Request</RouterLink>
        </li>
        <li class="link" v-if="isLoggedIn">
          <a href="#" @click.prevent="toggleModal" class="{ underline: isModalOpen }"> Add </a>
        </li>
        <li class="link" v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }" :class="{ underline: currentRouteName == 'Settings' }"> Settings </RouterLink>
        </li>
        <li class="link" v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
        <li class="link" v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Profile View', params: { id: currentUsername } }" :class="{ underline: currentRouteName === 'My Profile' }"> My Profile </RouterLink>
        </li>
        <li class="link">
          <RouterLink :to="{ name: 'FAQ' }" :class="{ underline: currentRouteName == 'FAQ' }"> FAQ </RouterLink>
        </li>
      </ul>
    </nav>
    <article v-if="toast !== null" class="toast" :class="toast.style">
      <p>{{ toast.message }}</p>
    </article>
  </header>
  <div class="routerView">
    <RouterView />
  </div>
</template>

<style scoped>
@import "./assets/toast.css";

nav {
  padding: 1em 2em;
  background-color: #ffe8cc;
  display: flex;
  align-items: center;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 2.5em;
  margin: 0;
  font-family: "Averia Serif Libre", serif;
  font-weight: 700;
  font-style: normal;
  color: #A63424;
}

.link {
  font-size: 2.5em;
  margin: 0;
  font-family: "Averia Serif Libre", serif;
  font-weight: 700;
  font-style: normal;
  color: #A63424;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: #A63424;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.underline {
  text-decoration: underline;
}

.routerView {
  padding: 30px;
}
</style>
