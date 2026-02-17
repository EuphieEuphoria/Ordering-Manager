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
    name: 'Manage Documents',
    icon: 'pi pi-pen-to-square',
  },
  3: {
    name: 'Add Documents',
    icon: 'pi pi-file-plus',
  },
  4: {
    name: 'Manage Communities',
    icon: 'pi pi-pencil',
  },
  5: {
    name: 'Add Communities',
    icon: 'pi pi-plus-circle',
  },
  6: {
    name: 'View Documents',
    icon: 'pi pi-file',
  },
  7: {
    name: 'View Communities',
    icon: 'pi pi-building-columns',
  },
}
</script>

<template>
  <Chip :label="roles[props.role.id].name" :icon="roles[props.role.id].icon" />
</template>
