<script setup>
/**
 * @file Roles List Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'
import { api } from '@/configs/api'
import { Card } from 'primevue'

// Create Reactive State
const roles = ref([])

// Load Roles
api
  .get('/api/v1/roles')
  .then(function (response) {
    roles.value = response.data
  })
  .catch(function (error) {
    console.log(error)
  })
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 sm:grid-cols-2 gap-2">
    <Card v-for="role in roles" :key="role.id">
      <template #title>Role: {{ role.role }}</template>
    </Card>
  </div>
</template>
