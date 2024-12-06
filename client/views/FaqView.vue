<template>
  <div class="faq-container">
    <h1>Frequently Asked Questions</h1>
    <section v-for="(faq, index) in faqs" :key="index" class="faq-item">
      <h2>{{ faq.question }}</h2>
      <p>{{ faq.answer }}</p>
      <!-- Check if the FAQ has a list of items -->
      <div v-if="faq.list">
        <ul>
          <li v-for="(item, idx) in faq.list" :key="idx">{{ item }}</li>
        </ul>
      </div>
      <!-- If there's no list, display the answer as a paragraph -->
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

/**
 * Interface representing a single FAQ item.
 */
interface FAQ {
  question: string;
  answer?: string;
  list?: string[];
}

const faqs = ref<FAQ[]>([
  {
    question: "How do I create a listing?",
    answer: "Navigate to the 'Add' button in the navigation bar and click on 'Create Listing' to fill out a form with the required details.",
  },
  {
    question: "How can I report a user?",
    answer: "Visit the user's profile and click on the three small dots next to the user's name. A popup will appear with the 'Report' button to submit a report.",
  },
  {
    question: "What type of items can I give away?",

    answer: "You can give away any type of food items, groceries, or other essentials that are in good condition and safe to consume. Some of these food items include:",
    list: [
      "Non-perishable foods: Canned goods, pasta, rice, cereals, and other pantry staples that are unopened and not expired.",
      "Fresh produce: Fruits, vegetables, and herbs that are fresh and in good condition.",
      "Packaged goods: Snacks, beverages, or baked goods that are sealed and safe to consume.",
      "Groceries and essentials: Items like cooking oils, spices, or unopened baby food.",
      "Leftovers or prepared meals: These should be freshly made, properly packaged, and labeled with ingredients and the date of preparation for transparency.",
      "Always ensure that items you give away are safe to consume, within their expiration dates, and meet any dietary or allergen considerations the recipient may have.",
    ],
  },
  // we can add more here if needed
]);
</script>

<style scoped>
.faq-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  margin-bottom: 20px;
}

.faq-item h2 {
  font-size: 1.2em;
  margin-bottom: 10px;
}

.faq-item p {
  font-size: 1em;
  color: #555;
}

.faq-item ul {
  list-style-type: disc;
  padding-left: 20px;
}

.faq-item li {
  margin-bottom: 5px;
  color: #555;
}
</style>
Footer © 2024 GitHub, Inc. Footer navigation Terms Privacy Security
