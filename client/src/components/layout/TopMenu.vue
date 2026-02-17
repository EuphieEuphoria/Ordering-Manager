<script setup>
/**
 * @file Top menu bar of the entire application
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

// Import Components
import Menubar from 'primevue/menubar'
import ThemeToggle from './ThemeToggle.vue'
import UserProfile from './UserProfile.vue'

// Stores
import { useTokenStore } from '@/stores/Token'
const tokenStore = useTokenStore()

// Declare State
const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    command: () => {
      router.push({ name: 'home' })
    },
  },
  {
    label: 'About',
    icon: 'pi pi-info-circle',
    command: () => {
      router.push({ name: 'about' })
    },
  },
  {
    label: 'Roles',
    icon: 'pi pi-id-card',
    command: () => {
      router.push({ name: 'roles' })
    },
    roles: ['manage_users'],
  },
  {
    label: 'Users',
    icon: 'pi pi-users',
    command: () => {
      router.push({ name: 'users' })
    },
    roles: ['manage_users'],
  },
])

const visible_items = computed(() => {
  return items.value.filter((item) => {
    // If the item lists any roles
    if (item.roles) {
      // Assume the user must be logged in to view it
      if (tokenStore.token.length > 0) {
        // If the roles is a string containing an asterisk
        if (item.roles == '*') {
          // Allow all roles to view
          return true
        } else {
          // Otherwise, check if any role matches a role the user has
          return item.roles.some((r) => tokenStore.has_role(r))
        }
      } else {
        // If not logged in, hide item
        return false
      }
    } else {
      // If no roles listed, show item even if not logged in
      return true
    }
  })
})
</script>

<template>
  <div>
    <Menubar :model="visible_items">
      <template #start>
        <img src="https://placehold.co/40x40" alt="Placeholder Logo" />
      </template>
      <template #end>
        <div class="flex items-center gap-1">
          <ThemeToggle />
          <UserProfile />
        </div>
      </template>
    </Menubar>
  </div>
</template>
