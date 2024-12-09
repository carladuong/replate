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
        <div :class="{bubble: isModalOpen}">
          <div v-if="isModalOpen" class="extra-items">
            <li class="link" v-if="isLoggedIn && isModalOpen">
              <RouterLink :to="{ name: 'Create Listing' }" class="modal-link" style="vertical-align: 4px;">Create Listing</RouterLink>
            </li>
            <div class="separator"></div>
            <li class="link">
              <RouterLink v-if="isLoggedIn && isModalOpen" :to="{ name: 'Create Request' }" class="modal-link" style="vertical-align: 4px;">Create Request</RouterLink>
            </li>
          </div>
            <li class="link" v-if="isLoggedIn">
              <a href="#" @click.prevent="toggleModal" class="nav-icon plus-button">
                <i class="fa-solid fa-plus"></i>
              </a>
            </li>
        </div>


        <li class="link">
          <RouterLink :to="{ name: 'Home' }" class="nav-icon" :class="{ underline: currentRouteName == 'Home' }">
            <i class="fa-solid fa-house"></i>
          </RouterLink>
        </li>
        <li class="link" v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Settings' }" class="nav-icon" :class="{ underline: currentRouteName == 'Settings' }">
            <i class="fa-solid fa-gear"></i>
          </RouterLink>
        </li>
        <li class="link" v-else>
          <RouterLink :to="{ name: 'Login' }" :class="{ underline: currentRouteName == 'Login' }"> Login </RouterLink>
        </li>
        <li class="link" v-if="isLoggedIn">
          <RouterLink :to="{ name: 'Profile View', params: { id: currentUsername } }" class="nav-icon" :class="{ underline: currentRouteName === 'Profile View' }">
            <i class="fa-solid fa-circle-user"></i>
          </RouterLink>
        </li>
        <li class="link">
          <RouterLink :to="{ name: 'FAQ' }" style="font-size: 20px;" class="nav-icon" :class="{ underline: currentRouteName == 'FAQ' }"> FAQ </RouterLink>
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
  gap: 2em;
}

.nav-icon {
  font-size: 30px;
  position: relative;
}

.routerView {
  padding: 30px;
}

.nav-icon.underline::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: -3px;
  height: 3px;
  background-color: #A63424;
  width: 0;
  transition: width 0.3s ease-in-out;
}

.nav-icon.underline:hover::after,
.nav-icon.underline::after {
  width: 120%;
}



/* Bubble Container with Plus Button and Extra Items */
.bubble {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  background-color: #fabb7d;
  padding-left: 20px;
  padding-right: 20px;

  border-radius: 20px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  margin: 0px;
  gap: 20px;
  position: relative;
}

.extra-items {
  display: inline-flex;
  flex-direction: row;
  gap: 20px;
}

/* Extra Items and Separators inside the bubble */
.extra-items .nav-icon {
  font-size: 16px;
  padding: 8px;
  text-decoration: none;
  color: #333;
}

</style>
