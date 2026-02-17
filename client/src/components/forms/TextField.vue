<script setup>
/**
 * @file Custom Text Form Field Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { computed } from 'vue'
import { InputIcon, IconField, FloatLabel, InputText, Message } from 'primevue'

// Incoming Props
const props = defineProps({
  // Field Name
  field: String,
  // Field Label
  label: String,
  // Field Icon
  icon: String,
  // Disable Editing
  disabled: {
    type: Boolean,
    default: false,
  },
  errors: Array,
})

// Find Error for Field
const error = computed(() => {
  return props.errors.find((e) => e.attribute === props.field)
})

// V-model of the field to be edited
const model = defineModel()
</script>

<template>
  <div>
    <FloatLabel variant="on">
      <IconField>
        <InputIcon :class="props.icon" />
        <InputText
          :id="props.field"
          :disabled="props.disabled"
          :invalid="error"
          v-model="model"
          class="w-full"
        />
      </IconField>
      <label :for="props.field">{{ props.label }}</label>
    </FloatLabel>
    <!-- Error Text -->
    <Message v-if="error" severity="error" variant="simple" size="small">{{
      error.message
    }}</Message>
  </div>
</template>
