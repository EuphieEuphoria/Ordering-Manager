/**
 * @file Vue Router for the application
 * @author Lukas Courtney <lccourtney@ksu.edu>
 * @exports router a Vue Router
 */

// Import Libraries
import { createRouter, createWebHistory } from 'vue-router'

// Import Stores
import { useTokenStore } from '@/stores/Token'

// Import Views
import HomeView from '../views/HomeView.vue'

/**
 * Router Guard Function to check for role before entering route
 *
 * @param roles a list of roles permitted to enter the route
 * @return boolean true if the navigation is permitted, else returns to the home page
 */
const requireRoles = (...roles) => {
  return () => {
    const tokenStore = useTokenStore()
    const allow = roles.some((r) => tokenStore.has_role(r))
    if (allow) {
      // allow navigation
      return true
    } else {
      // redirect to home
      return { name: 'home' }
    }
  }
}

const router = createRouter({
  // Configure History Mode
  history: createWebHistory(import.meta.env.BASE_URL),

  // Configure routes
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/RolesView.vue'),
      beforeEnter: requireRoles('manage_users'),
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersListView.vue'),
      beforeEnter: requireRoles('manage_users'),
    },
    {
      path: '/users/:id/edit',
      name: 'edituser',
      component: () => import('../views/UsersEditView.vue'),
      beforeEnter: requireRoles('manage_users'),
      props: true,
    },
    {
      path: '/users/new',
      name: 'newuser',
      component: () => import('../views/UsersEditView.vue'),
      beforeEnter: requireRoles('manage_users'),
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductListView.vue'),
      beforeEnter: requireRoles('view_products', 'manage_products'),
    },
    {
      path: '/products/new',
      name: 'newproduct',
      component: () => import('../views/ProductEditView.vue'),
      beforeEnter: requireRoles('manage_products'),
    },
    {
      path: '/products/:id/edit',
      name: 'editproduct',
      component: () => import('../views/ProductEditView.vue'),
      beforeEnter: requireRoles('manage_products'),
      props: true,
    },
    {
      path: '/suppliers',
      name: 'suppliers',
      component: () => import('../views/SupplierListView.vue'),
      beforeEnter: requireRoles('manage_suppliers', 'view_suppliers'),
    },
    {
      path: '/movements',
      name: 'movements',
      component: () => import('../views/MovementListView.vue'),
      beforeEnter: requireRoles('view_movements', 'manage_movements'),
    },
    {
      path: '/movements/new',
      name: 'newmovement',
      component: () => import('../views/MovementEditView.vue'),
      beforeEnter: requireRoles('manage_movements'),
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrderListView.vue'),
      beforeEnter: requireRoles('view_orders', 'manage_orders'),
    },
    {
      path: '/orders/new',
      name: 'neworder',
      component: () => import('../views/OrderEditView.vue'),
      beforeEnter: requireRoles('manage_orders'),
    }
  ],
})

//Global Route Guard
router.beforeEach(async (to) => {
  // Load Token Store
  const tokenStore = useTokenStore()

  // Allow access to 'home' and 'about' routes automatically
  const noLoginRequired = ['home', 'about']

  if (noLoginRequired.includes(to.name)) {
    // If there is no token already
    if (!tokenStore.token.length > 0) {
      // Request a token in the background
      tokenStore.getToken()
    }

    // For all other routes
  } else {
    // If there is no token already
    if (!tokenStore.token.length > 0) {
      // Request a token and redirect if not logged in
      await tokenStore.getToken(true)
    }
  }
})

export default router
