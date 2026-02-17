<script setup>
/**
 * @file Button to toggle light/dark theme
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref } from 'vue'

// Declare State
const theme = ref('light-theme')

// Get Theme from Local Storage
const getTheme = function () {
  return localStorage.getItem('user-theme')
}

// Get Theme from User Preference
const getMediaPreference = function () {
  const hasDarkPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
  if (hasDarkPreference) {
    return 'dark-theme'
  } else {
    return 'light-theme'
  }
}

// Set theme and store
const setTheme = function () {
  console.log('Setting theme to ' + theme.value)
  if (theme.value == 'light-theme') {
    document.documentElement.classList.remove('app-dark-mode')
  } else {
    document.documentElement.classList.add('app-dark-mode')
  }
  localStorage.setItem('user-theme', theme.value)
}

// Toggle theme value
const toggleDarkMode = function () {
  if (theme.value == 'light-theme') {
    theme.value = 'dark-theme'
  } else {
    theme.value = 'light-theme'
  }
  setTheme()
}

theme.value = getTheme() || getMediaPreference()
setTheme()
</script>

<template>
  <div class="p-menubar-item">
    <div class="p-menubar-item-content">
      <a @click="toggleDarkMode" class="p-menubar-item-link">
        <span
          v-if="theme == 'light-theme'"
          v-tooltip.bottom="'Toggle Dark Mode'"
          class="p-menubar-item-label pi pi-moon"
        ></span>
        <span
          v-else
          v-tooltip.bottom="'Toggle Light Mode'"
          class="p-menubar-item-label pi pi-sun"
        ></span>
      </a>
    </div>
  </div>
</template>
