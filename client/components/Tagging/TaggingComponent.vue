<script setup lang="ts">
import { ref } from "vue";

// Predefined categories and dietary restrictions
const categories = ["Ingredient", "Non-Perishable", "Produce"];
const dietaryRestrictions = ["Gluten-Free", "Vegan", "No Nuts", "Vegetarian"];

const props = defineProps<{ initialTags?: string[] }>();
const emit = defineEmits(["update:tags"]);

const tags = ref<string[]>(props.initialTags || []);

const toggleTag = (tag: string) => {
  if (tags.value.includes(tag)) {
    tags.value = tags.value.filter((t) => t !== tag);
  } else {
    tags.value.push(tag);
  }
  emit("update:tags", tags.value);
};
</script>

<template>
  <div class="tagging-component">
    <div class="categories">
      <div class="category-options">
        <span v-for="category in categories" :key="category" :class="['category-option', { selected: tags.includes(category) }]" @click="toggleTag(category)">
          {{ category }}
        </span>
      </div>
    </div>
    <div class="dietary-restrictions">
      <div class="dietary-options">
        <span v-for="restriction in dietaryRestrictions" :key="restriction" :class="['dietary-option', { selected: tags.includes(restriction) }]" @click="toggleTag(restriction)">
          {{ restriction }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tagging-component {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.categories,
.dietary-restrictions {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.category-options,
.dietary-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.category-option,
.dietary-option {
  background-color: #d0d0d0;
  border-radius: 1em;
  padding: 0.5em;
  cursor: pointer;
  transition: background-color 0.2s;
}

.category-option.selected,
.dietary-option.selected {
  background-color: #007bff;
  color: white;
}

.category-option:hover,
.dietary-option:hover {
  background-color: #c0c0c0;
}
</style>
