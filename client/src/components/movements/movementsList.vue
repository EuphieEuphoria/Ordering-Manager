<script setup>
/**
 * @file Movement List Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'
import { api } from '@/configs/api'
import { DataTable, Column, Button } from 'primevue'
import { useRouter } from 'vue-router'
const router = useRouter()

// Create Reactive State
const movements = ref([])
const expandedRows = ref([])

// Load Movements
api
  .get('/api/v1/movements')
  .then((response) => {
    movements.value = response.data
  })
  .catch((error) => {
    console.log(error)
  })

</script>

<template>
  <DataTable
  :value="movements"
  dataKey="id"
  v-model:expandedRows="expandedRows"
>
  <template #header>
    <div class="flex justify-between">
      <Button
        label="New Movement"
        icon="pi pi-user-plus"
        severity="success"
        @click="router.push({ name: 'newmovement' })"
      />
    </div>
  </template>
  <Column expander style="width: 5rem" />
  <Column field="id" header="Movement ID" />
    <template #expansion="slotProps">
      <DataTable :value="slotProps.data.product_movements || []">
        <Column field="movement_types.type" header="Movement Type" />
        <Column field="productID" header="ProductID" />
        <Column field="product.description" header="Description" />
        <Column field="amountChanged" header="Amount Changed" />
      </DataTable>
    </template>
  </DataTable>
</template>
