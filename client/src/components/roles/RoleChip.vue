<script setup>
/**
 * @file Roles Chip
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import Chip from 'primevue/chip'

// Incoming Props
const props = defineProps({
  // Role Object
  role: Object,
})

// Lookup Table
const roles = {
  1: {
    name: 'Manage Users',
    icon: 'pi pi-user-edit',
  },
  2: {
    name: 'Manage Products',
    icon: 'pi pi-pen-to-square',
  },
  3: {
    name: 'Manage Orders',
    icon: 'pi pi-file-plus',
  },
  4: {
    name: 'Manage Movements',
    icon: 'pi pi-pencil',
  },
  5: {
    name: 'Manage Suppliers',
    icon: 'pi pi-plus-circle',
  },
  6: {
    name: 'View Products',
    icon: 'pi pi-file',
  },
  7: {
    name: 'View Communities',
    icon: 'pi pi-building-columns',
  },
  8: {
    name: 'View Movements',
    icon: 'pi pi-file',
  },
  9: {
    name: 'View Orders',
    icon: 'pi pi-file',
  },
}
</script>

<template>
  <Chip :label="roles[props.role.id].name" :icon="roles[props.role.id].icon" />
</template>
