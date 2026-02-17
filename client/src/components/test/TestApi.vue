<script setup>
/**
 * @file Test API Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'
import axios from 'axios'
import Card from 'primevue/card'

// Create Reactive State
const api_versions = ref([])

// Load API versions
axios
  .get('/api')
  .then(function (response) {
    api_versions.value = response.data
  })
  .catch(function (error) {
    console.log(error)
  })
</script>

<template>
  <div>
    <Card v-for="api_version in api_versions" :key="api_version.version">
      <template #title>Version {{ api_version.version }}</template>
      <template #content>
        <p>URL: {{ api_version.url }}</p>
      </template>
    </Card>
  </div>
</template>
