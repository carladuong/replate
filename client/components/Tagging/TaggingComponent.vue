<script setup lang="ts"></script>

<template>
  <div class="tagging">
    <div class="tagging__input">
      <input type="text" v-model="tag" @keydown.enter="addTag" placeholder="Add a tag" />
    </div>
    <div class="tagging__tags">
      <div v-for="(tag, index) in tags" :key="index" class="tagging__tag">
        {{ tag }}
        <button @click="removeTag(index)">x</button>
      </div>
    </div>
  </div>
</template>
