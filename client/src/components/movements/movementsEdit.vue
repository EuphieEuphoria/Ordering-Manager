<script setup>
/**
 * @file Movement Edit Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */
import { ref } from 'vue'
import { api } from '@/configs/api'
import { Button, Select } from 'primevue'
import TextField from '../forms/TextField.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import { useToast } from 'primevue/usetoast'
const toast = useToast()

// Declare State
const movements = ref([])
const movementTypes = ref([])
const errors = ref([])

// Load Movement Types
api
  .get('/api/v1/movement_types')
  .then(function (response) {
    movementTypes.value = response.data
  })
  .catch(function (error) {
    console.log(error)
  })

// Add new movement row
const addRow = () => {
  movements.value.push({
    productId: null,
    movementType: null,
    amountChanged: null,
  })
}

// Remove movement row
const removeRow = (index) => {
  movements.value.splice(index, 1)
}

// Save Movement
const save = function () {
  errors.value = []
  let method = 'post'
  let url = '/api/v1/movements'
  api({
    method: method,
    url: url,
    data: {
      movements: movements.value,
    },
  })
    .then(function (response) {
      if (response.status === 201) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: response.data.message,
          life: 5000,
        })
        router.push({ name: 'movements' })
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
    <h1>New Movement</h1>
    <div
      v-for="(movement, index) in movements"
      :key="index"
      class="flex flex-row gap-3 items-end border p-3 rounded"
    >
      <div>
        <label>Product</label>
        <TextField
          v-model="movement.productId"
          field="productId"
          label="Product ID"
          icon="pi pi-box"
          :errors="errors"
        />
      </div>
      <div >
        <label>Type</label>
        <Select
          v-model="movement.movementType"
          :options="movementTypes"
          optionLabel="type"
          optionValue="id"
          placeholder="Select Type"
          class="w-full"
        />
      </div>
      <div>
        <label>Amount</label>
        <TextField
          v-model="movement.amountChanged"
          field="amountChanged"
          label="Amount"
          icon="pi pi-sort"
          :errors="errors"
        />
      </div>
      <Button
        icon="pi pi-trash"
        severity="danger"
        @click="removeRow(index)"
      />
    </div>
    <Button
      label="Add Movement"
      icon="pi pi-plus"
      severity="secondary"
      @click="addRow"
    />
    <div>
      <Button severity="success" @click="save" label="Save" />
      <Button
        severity="secondary"
        @click="router.push({ name: 'movements' })"
        label="Cancel"
      />
    </div>
  </div>
</template>