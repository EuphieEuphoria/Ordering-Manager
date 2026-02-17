<script setup>
/**
 * @file Test User Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'
import { api } from '@/configs/api'
import { Card, Chip } from 'primevue'

// Create Reactive State
const users = ref([])

// Load Users
api
  .get('/api/v1/users')
  .then(function (response) {
    users.value = response.data
  })
  .catch(function (error) {
    console.log(error)
  })
</script>

<template>
  <div>
    <Card v-for="user in users" :key="user.id">
      <template #title>Username: {{ user.username }}</template>
      <template #content>
        <Chip v-for="role in user.roles" :label="role.role" :key="role.id" />
      </template>
    </Card>
  </div>
</template>
