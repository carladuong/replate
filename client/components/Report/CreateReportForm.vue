<script setup lang="ts">
import { fetchy } from "@/utils/fetchy"; // Adjust the path based on your aliases
import { defineProps, ref, watch } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  reportedId?: string;
}>();

const reportedId = ref(props.reportedId || "");
const message = ref("");
const error = ref<string | null>(null);
const success = ref(false);
const router = useRouter();

const isReportedIdPreFilled = ref(!!props.reportedId);

// Watch for changes in props.reportedId to update reportedId ref if needed
watch(
  () => props.reportedId,
  (newVal) => {
    if (newVal) {
      reportedId.value = newVal;
      isReportedIdPreFilled.value = true;
    }
  },
);

const createReport = async () => {
  try {
    const response = await fetchy("/api/reports", "POST", {
      body: {
        reportedId: reportedId.value,
        message: message.value,
      },
    });

    if (response.msg) {
      success.value = true;
      // Optionally, navigate to another page
      // await router.push({ name: "Home" });
      // Reset form fields if reportedId is not pre-filled
      if (!isReportedIdPreFilled.value) {
        reportedId.value = "";
      }
      message.value = "";
    } else {
      throw new Error("Failed to create the report.");
    }
  } catch (err: any) {
    console.error("Error creating report:", err);
    error.value = err.message || "There was an error creating the report.";
  }
};
</script>

<template>
  <form @submit.prevent="createReport" class="pure-form pure-form-stacked">
    <fieldset>
      <legend>Report User/Entity</legend>

      <div class="pure-control-group">
        <label for="reportedId">Reported User/Entity ID</label>
        <input id="reportedId" type="text" v-model="reportedId" placeholder="Enter User/Entity ID" required :readonly="isReportedIdPreFilled" />
      </div>

      <div class="pure-control-group">
        <label for="message">Reason for Reporting</label>
        <textarea id="message" v-model="message" placeholder="Describe the issue..." required></textarea>
      </div>

      <button type="submit" class="pure-button pure-button-primary">Submit Report</button>

      <!-- Success Message -->
      <div v-if="success" class="success-message">Report submitted successfully!</div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </fieldset>
  </form>
</template>

<style scoped>
.pure-form-stacked {
  max-width: 500px;
  margin: 0 auto;
}

.pure-control-group {
  margin-bottom: 1em;
}

.success-message {
  color: green;
  margin-top: 1em;
}

.error-message {
  color: red;
  margin-top: 1em;
}

button {
  align-self: flex-start;
}
</style>
