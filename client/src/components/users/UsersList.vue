<script setup>
/**
 * @file Users List Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'
import { api } from '@/configs/api'
import { formatDistance } from 'date-fns'
import { DataTable, Column, IconField, InputIcon, InputText, MultiSelect, Button } from 'primevue'
import { FilterMatchMode, FilterService } from '@primevue/core/api'
import RoleChip from '../roles/RoleChip.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import { useToast } from 'primevue/usetoast'
const toast = useToast()
import { useConfirm } from 'primevue'
const confirm = useConfirm()

// Create Reactive State
const users = ref([])
const roles = ref([])

// Load Users
api
  .get('/api/v1/users')
  .then(function (response) {
    users.value = response.data
  })
  .catch(function (error) {
    console.log(error)
  })

// Load Roles
api
  .get('/api/v1/roles')
  .then(function (response) {
    roles.value = response.data
  })
  .catch(function (error) {
    console.log(error)
  })

// Custom Filter
FilterService.register('filterArrayOfObjectsById', (targetArray, sourceArray) => {
  if (!sourceArray || sourceArray.length == 0) {
    return true
  }
  let found = true
  sourceArray.forEach((s) => {
    found = found && targetArray.some((o) => o.id === s.id)
  })
  return found
})

// Setup Filters
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  roles: { value: null, matchMode: 'filterArrayOfObjectsById' },
})

// Delete User
const deleteUser = function (id) {
  api
    .delete('/api/v1/users/' + id)
    .then(function (response) {
      if (response.status === 200) {
        toast.add({
          severity: 'success',
          summary: 'Success',
          detail: response.data.message,
          life: 5000,
        })
        // Remove that element from the reactive array
        users.value.splice(
          users.value.findIndex((u) => u.id == id),
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
    message: 'Are you sure you want to delete this user?',
    header: 'Delete User',
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
      deleteUser(id)
    },
  })
}
</script>

<template>
  <DataTable
    :value="users"
    v-model:filters="filters"
    :globalFilterFields="['username']"
    filterDisplay="menu"
    sortField="username"
    :sortOrder="1"
  >
    <template #header>
      <div class="flex justify-between">
        <Button
          label="New User"
          icon="pi pi-user-plus"
          severity="success"
          @click="router.push({ name: 'newuser' })"
        />
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
        </IconField>
      </div>
    </template>
    <Column field="username" header="Username" sortable />
    <Column filterField="roles" :showFilterMatchModes="false" header="Roles">
      <template #body="{ data }">
        <div class="flex gap-2">
          <RoleChip v-for="role in data.roles" :key="role.id" :role="role" />
        </div>
      </template>
      <template #filter="{ filterModel }">
        <MultiSelect
          v-model="filterModel.value"
          :options="roles"
          optionLabel="role"
          placeholder="Any"
        >
          <template #option="slotProps">
            <RoleChip :role="slotProps.option" />
          </template>
        </MultiSelect>
      </template>
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
    <Column header="Actions" style="min-width: 8rem">
      <template #body="slotProps">
        <div class="flex gap-2">
          <Button
            icon="pi pi-pencil"
            outlined
            rounded
            @click="router.push({ name: 'edituser', params: { id: slotProps.data.id } })"
            v-tooltip.bottom="'Edit'"
          />
          <Button
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
