<script setup>
/**
 * @file Products List Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'
import { api } from '@/configs/api'
import { formatDistance } from 'date-fns'
import { DataTable, Column, Button } from 'primevue'
import { useRouter } from 'vue-router'
const router = useRouter()
import { useToast } from 'primevue/usetoast'
const toast = useToast()
import { useConfirm } from 'primevue'
const confirm = useConfirm()

// Stores
import { useTokenStore } from '@/stores/Token'
const tokenStore = useTokenStore()

// Create Reactive State
const products = ref([])

// Load Products
api
  .get('/api/v1/products')
  .then((response) => {
    products.value = response.data
  })
  .catch((error) => {
    console.log(error)
  })

// Delete Product
const deleteProduct = function (id) {
  api
    .delete('/api/v1/products/' + id)
    .then(function (response) {
      if (response.status === 200) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: response.data.message,
          life: 5000,
        })
        // Remove that element from the reactive array
        products.value.splice(
          products.value.findIndex((p) => p.id == id),
          1,
        )
      }
    })
    .catch(function (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 })
    })
}

// Confirmation Dialog
const confirmDelete = function (id) {
  confirm.require({
    message: 'Are you sure you want to delete this product?',
    header: 'Delete Product',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
    },
    accept: () => {
      deleteProduct(id)
    },
  })
}
</script>

<template>
  <DataTable
    :value="products"
    sortField="id"
    :sortOrder="1"
  >
    <template #header>
      <div class="flex justify-between">
        <Button
          v-if="tokenStore.has_role('manage_products')"
          label="New Product"
          icon="pi pi-user-plus"
          severity="success"
          @click="router.push({ name: 'newproduct' })"
        />
      </div>
    </template>

    <Column field="id" header="ID" sortable>
    </Column>

    <Column field="description" header="Description" sortable>
    </Column>


    <Column field="suppliers.name" header="Supplier" sortable >
    </Column>


    <Column field="product_types.type" header="Type" sortable>
    </Column>


    <Column field="product_sizes.commonName" header="Size" sortable>
    </Column>


    <Column field="caseSize" header="Case Size" sortable>
    </Column>


    <Column field="product_counts.quantity" header="Quantity" sortable>
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
    <Column v-if="tokenStore.has_role('manage_products')" header="Actions" style="min-width: 8rem">
      <template #body="slotProps">
        <div class="flex gap-2">
          <Button
            v-if="tokenStore.has_role('manage_products')"
            icon="pi pi-pencil"
            outlined
            rounded
            @click="router.push({ name: 'editproduct', params: { id: slotProps.data.id } })"
            v-tooltip.bottom="'Edit'"
          />
          <Button
            v-if="tokenStore.has_role('manage_products')"
            icon="pi pi-trash"
            outlined
            rounded
            severity="danger"
            @click="confirmDelete(slotProps.data.id)"
            v-tooltip.bottom="'Delete'"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>
