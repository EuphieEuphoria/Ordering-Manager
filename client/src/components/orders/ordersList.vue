<script setup>
/**
 * @file Order List Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'
import { api } from '@/configs/api'
import { DataTable, Column, Button } from 'primevue'
import { useRouter } from 'vue-router'
const router = useRouter()

// Create Reactive State
const orders = ref([])
const expandedRows = ref([])

// Load Orders
api
  .get('/api/v1/orders')
  .then((response) => {
    orders.value = response.data
  })
  .catch((error) => {
    console.log(error)
  })

</script>

<template>
  <DataTable
  :value="orders"
  dataKey="id"
  v-model:expandedRows="expandedRows"
>
  <template #header>
    <div class="flex justify-between">
      <Button
        label="New Order"
        icon="pi pi-user-plus"
        severity="success"
        @click="router.push({ name: 'neworder' })"
      />
    </div>
  </template>
  <Column expander style="width: 5rem" />
  <Column field="id" header="Order ID" />
    <template #expansion="slotProps">
      <DataTable :value="slotProps.data.product_orders || []">
        <Column field="productID" header="ProductID" />
        <Column field="product.description" header="Description" />
        <Column field="quantityOrdered" header="Quantity Ordered" />
      </DataTable>
    </template>
  </DataTable>
</template>
