/**
 * @file Axios Configuration and Interceptors
 * @author Lukas Courtney <lccourtney@ksu.edu>
 */

// Import Libraries
import axios from 'axios'

// Import Stores
import { useTokenStore } from '@/stores/Token'

// Axios Instance Setup
const api = axios.create({
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Add Interceptors
const setupAxios = function () {
  // Configure Requests
  api.interceptors.request.use(
    (config) => {
      // If we are not trying to get a token or API versions, send the token
      if (config.url !== '/auth/token' && config.url !== '/api') {
        const tokenStore = useTokenStore()
        if (tokenStore.token.length > 0) {
          config.headers['Authorization'] = 'Bearer ' + tokenStore.token
        }
      }
      return config
    },

    // If we receive any errors, reject with the error
    (error) => {
      return Promise.reject(error)
    },
  )

  // Configure Response
  api.interceptors.response.use(
    // Do not modify the response
    (res) => {
      return res
    },

    // Gracefully handle errors
    async (err) => {
      // Store original request config
      const config = err.config

      // If we are not trying to request a token but we get an error message
      if (config.url !== '/auth/token' && err.response) {
        // If the error is a 401 unauthorized, we might have a bad token
        if (err.response.status === 401) {
          // Prevent infinite loops by tracking retries
          if (!config._retry) {
            config._retry = true

            // Try to request a new token
            try {
              const tokenStore = useTokenStore()
              await tokenStore.getToken()

              // Retry the original request
              return api(config)
            } catch (error) {
              return Promise.reject(error)
            }
          } else {
            // This is a retry, so force an authentication
            const tokenStore = useTokenStore()
            await tokenStore.getToken(true)
          }
        }
      }

      // If we can't handle it, return the error
      return Promise.reject(err)
    },
  )
}

export { api, setupAxios }
