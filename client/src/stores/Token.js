/**
 * @file JWT Token Store
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import axios from 'axios'

// Define Store
export const useTokenStore = defineStore('token', () => {
  // State properties
  const token = ref('')

  // Getters
  const username = computed(() =>
    token.value.length > 0 ? jwtDecode(token.value)['username'] : '',
  )
  const has_role = computed(
    () => (role) =>
      token.value.length > 0 ? jwtDecode(token.value)['roles'].some((r) => r.role == role) : false,
  )

  // Actions
  /**
   * Get a token for the user.
   *
   * If this fails, redirect to authentication page if parameter is true
   *
   * @param redirect if true, redirect user to login page on failure
   */
  async function getToken(redirect = false) {
    console.log('token:get')
    try {
      const response = await axios.get('/auth/token', { withCredentials: true })
      token.value = response.data.token
    } catch (error) {
      token.value = ''
      // If the response is a 401, the user is not logged in
      if (error.response && error.response.status === 401) {
        console.log('token:get user not logged in')
        if (redirect) {
          console.log('token:get redirecting to login page')
          window.location.href = '/auth/cas'
        }
      } else {
        console.log('token:get error' + error)
      }
    }
  }

  /**
   * Log the user out and clear the token
   */
  function logout() {
    token.value = ''
    window.location.href = '/auth/logout'
  }

  // Return all state, getters, and actions
  return { token, username, has_role, getToken, logout }
})
