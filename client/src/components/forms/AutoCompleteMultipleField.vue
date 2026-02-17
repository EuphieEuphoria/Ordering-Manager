<script setup>
/**
 * @file Custom Autocomplete Multiple Field Component
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { computed, ref } from 'vue'
import { InputIcon, IconField, FloatLabel, AutoComplete, Message } from 'primevue'

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
  //Values to choose from
  values: Array,
  // Value Label
  valueLabel: {
    type: String,
    default: 'name',
  },
  errors: Array,
})

// Find Error for Field
const error = computed(() => {
  return props.errors.find((e) => e.attribute === props.field)
})

// V-model of the field to be edited
const model = defineModel()

// State variable for search results
const items = ref([])

// Search method
const search = function (event) {
  console.log(event)
  items.value = props.values.filter((v) => v[props.valueLabel].includes(event.query))
  console.log(items.value)
}
</script>

<template>
  <div>
    <FloatLabel variant="on">
      <IconField>
        <InputIcon :class="props.icon" />
        <AutoComplete
          :optionLabel="props.valueLabel"
          :id="props.field"
          :disabled="props.disabled"
          :invalid="error"
          v-model="model"
          forceSelection
          multiple
          fluid
          :suggestions="items"
          @complete="search"
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

<style scoped>
:deep(.p-autocomplete > ul) {
  padding-inline-start: calc((var(--p-form-field-padding-x) * 2) + var(--p-icon-size));
}
</style>
