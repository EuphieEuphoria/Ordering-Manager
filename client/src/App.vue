<script setup>
/**
 * @file Main Vue Application
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Components
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import TopMenu from './components/layout/TopMenu.vue'
</script>

<template>
  <header></header>

  <nav>
    <!-- Navigation Menu -->
    <TopMenu />
  </nav>

  <main>
    <div class="m-2">
      <!-- Main Application View -->
      <RouterView />
    </div>
  </main>

  <footer></footer>

  <Toast position="bottom-right" />
  <ConfirmDialog />
</template>
