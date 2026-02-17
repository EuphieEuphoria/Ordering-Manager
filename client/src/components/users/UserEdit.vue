<script setup>
/**
 * @file User Edit Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'
import { api } from '@/configs/api'
import { Button } from 'primevue'
import TextField from '../forms/TextField.vue'
import AutoCompleteMultipleField from '../forms/AutoCompleteMultipleField.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import { useToast } from 'primevue/usetoast'
const toast = useToast()

// Incoming Props
const props = defineProps({
  // User ID
  id: String,
})

// Declare State
const user = ref({})
const roles = ref([])
const errors = ref([])

// Load Roles
api
  .get('/api/v1/roles')
  .then(function (response) {
    roles.value = response.data
  })
  .catch(function (error) {
    console.log(error)
  })

// Load Users
if (props.id) {
  api
    .get('/api/v1/users/' + props.id)
    .then(function (response) {
      user.value = response.data
    })
    .catch(function (error) {
      console.log(error)
    })
} else {
  // Empty Value for User Object
  user.value = {
    username: '',
    roles: [],
  }
}

// Save User
const save = function () {
  errors.value = []
  let method = 'post'
  let url = '/api/v1/users'
  if (props.id) {
    method = 'put'
    url = url + '/' + props.id
  }
  api({
    method: method,
    url: url,
    data: user.value,
  })
    .then(function (response) {
      if (response.status === 201) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: response.data.message,
          life: 5000,
        })
        router.push({ name: 'users' })
      }
    })
    .catch(function (error) {
      if (error.status === 422) {
        toast.add({
          severity: 'warn',
          summary: 'Warning',
          detail: error.response.data.error,
          life: 5000,
        })
        errors.value = error.response.data.errors
      } else {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
      }
    })
}
</script>

<template>
  <div class="flex flex-col gap-3 max-w-xl justify-items-center">
    <h1 class="text-xl text-center m-1">{{ props.id ? 'Edit User' : 'New User' }}</h1>
    <TextField
      v-model="user.username"
      field="username"
      label="Username"
      icon="pi pi-user"
      :errors="errors"
    />
    <AutoCompleteMultipleField
      v-model="user.roles"
      field="roles"
      label="Roles"
      icon="pi pi-id-card"
      :errors="errors"
      :values="roles"
      valueLabel="role"
    />
    <Button severity="success" @click="save" label="Save" />
    <Button severity="secondary" @click="router.push({ name: 'users' })" label="Cancel" />
  </div>
</template>
