<script setup>
/**
 * @file Supplier List Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'
import { api } from '@/configs/api'
import { formatDistance } from 'date-fns'
import { DataTable, Column, } from 'primevue'

// Create Reactive State
const suppliers = ref([])

// Load Products
api
  .get('/api/v1/suppliers')
  .then((response) => {
    suppliers.value = response.data
  })
  .catch((error) => {
    console.log(error)
  })

</script>

<template>
  <DataTable
    :value="suppliers"
    sortField="name"
    :sortOrder="1"
  >


    <Column field="name" header="Name" sortable>
    </Column>


    <Column field="address" header="Address" sortable >
    </Column>


    <Column field="description" header="Description" sortable>
    </Column>

    <Column field="createdAt" header="Created" sortable>
      <template #body="{ data }">
        <span v-tooltip.bottom="new Date(data.createdAt).toLocaleString()">
          {{ formatDistance(new Date(data.createdAt), new Date(), { addSuffix: true }) }}
        </span>
      </template>
    </Column>

    <Column field="updatedAt" header="Updated" sortable>
      <template #body="{ data }">
        <span v-tooltip.bottom="new Date(data.updatedAt).toLocaleString()">
          {{ formatDistance(new Date(data.updatedAt), new Date(), { addSuffix: true }) }}
        </span>
      </template>
    </Column>

  </DataTable>
</template>
