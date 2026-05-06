<script setup>
/**
 * @file Product Edit Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'
import { api } from '@/configs/api'
import { Button, Select } from 'primevue'
import TextField from '../forms/TextField.vue'
//import AutoCompleteMultipleField from '../forms/AutoCompleteMultipleField.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import { useToast } from 'primevue/usetoast'
const toast = useToast()

// Incoming Props
const props = defineProps({
  // Product ID
  id: String,
})

// Declare State
const product = ref({})
const suppliers = ref([])
const sizes = ref([])
const types = ref([])
const errors = ref([])

// Load Products
if (props.id) {
  api
    .get('/api/v1/products/' + props.id)
    .then(function (response) {
      product.value = response.data
    })
    .catch(function (error) {
      console.log(error)
    })
} else {
  // Empty Value for Product Object
  product.value = {
    productname: '',
  }
}

//Load Suppliers
api
  .get('/api/v1/suppliers')
  .then(function (response) {
    suppliers.value = response.data
  })
  .catch(function (error) {
    console.log(error)
  })

//Load Sizes
api
  .get('/api/v1/product_sizes')
  .then(function (response) {
    sizes.value = response.data
  })
  .catch(function (error) {
    console.log(error)
  })

//Load Types
api
  .get('/api/v1/product_types')
  .then(function (response) {
    types.value = response.data
  })
  .catch(function (error) {
    console.log(error)
  })


// Save Product
const save = function () {
  errors.value = []
  let method = 'post'
  let url = '/api/v1/products'
  if (props.id) {
    method = 'put'
    url = url + '/' + props.id
  }
  api({
    method: method,
    url: url,
    data: product.value,
  })
    .then(function (response) {
      if (response.status === 201) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: response.data.message,
          life: 5000,
        })
        router.push({ name: 'products' })
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
    <h1 class="text-xl text-center m-1">{{ props.id ? 'Edit Product' : 'New Product' }}</h1>
    <Select
      v-model="product.supplierId"
      :options="suppliers"
      optionLabel="name"
      optionValue="id"
      placeholder="Select Supplier"
      class="w-full"
      :class="{ 'p-invalid': errors.some(e => e.path === 'supplierId') }"
      />
    <Select
      v-model="product.typeId"
      :options="types"
      optionLabel="type"
      optionValue="id"
      placeholder="Select Type"
      class="w-full"
      :class="{ 'p-invalid': errors.some(e => e.path === 'typeId') }"
      />
    <Select
      v-model="product.sizeId"
      :options="sizes"
      optionLabel="commonName"
      optionValue="id"
      placeholder="Select Size"
      class="w-full"
      :class="{ 'p-invalid': errors.some(e => e.path === 'sizeId') }"
      />
    <TextField
      v-model="product.caseSize"
      field="caseSize"
      label="Case Size"
      icon="pi pi-box"
      :errors="errors"
    />
    <TextField
      v-model="product.description"
      field="description"
      label="Description"
      icon="pi pi-align-left"
      :errors="errors"
    />
    <Button severity="success" @click="save" label="Save" />
    <Button
      severity="secondary"
      @click="router.push({ name: 'products' })"
      label="Cancel"
    />
  </div>
</template>
