<script setup>
/**
 * @file Order Edit Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */
import { ref } from 'vue'
import { api } from '@/configs/api'
import { Button, } from 'primevue'
import TextField from '../forms/TextField.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import { useToast } from 'primevue/usetoast'
const toast = useToast()

// Declare State
const orders = ref([])
const errors = ref([])


// Add new order row
const addRow = () => {
  orders.value.push({
    productId: null,
    orderType: null,
    amountChanged: null,
  })
}

// Remove row
const removeRow = (index) => {
  orders.value.splice(index, 1)
}

// Save Order
const save = function () {
  errors.value = []
  let method = 'post'
  let url = '/api/v1/orders'
  api({
    method: method,
    url: url,
    data: {
      orders: orders.value,
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
        router.push({ name: 'orders' })
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
    <h1>New Order</h1>
    <div
      v-for="(order, index) in orders"
      :key="index"
      class="flex flex-row gap-3 items-end border p-3 rounded"
    >
      <div>
        <label>Product</label>
        <TextField
          v-model="order.productId"
          field="productId"
          label="Product ID"
          icon="pi pi-box"
          :errors="errors"
        />
      </div>
      <div>
        <label>Amount</label>
        <TextField
          v-model="order.quantityOrdered"
          field="quantityOrdered"
          label="Order Amount"
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
      label="Add Order"
      icon="pi pi-plus"
      severity="secondary"
      @click="addRow"
    />
    <div>
      <Button severity="success" @click="save" label="Save" />
      <Button
        severity="secondary"
        @click="router.push({ name: 'orders' })"
        label="Cancel"
      />
    </div>
  </div>
</template>