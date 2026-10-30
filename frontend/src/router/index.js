import { createRouter, createWebHistory } from 'vue-router'
import { useLoggedInUserStore } from '../store/loggedInUser'

// make all paths and names lowercase for consistency
const routes = [
  {
    path: '/',
    component: () => import('../views/home.vue')
  },
  {
    path: "/login",
    name: "login",
    component: () => import('../views/login.vue')
  },
  {
    path: '/clientform',
    name: 'clientform',
    // only editors can create clients
    meta: { requiresAuth: true, requiresEditor: true },
    component: () => import('../views/clientform.vue')
  },
  {
    path: '/findclient',
    name: 'findclient',
    meta: { requiresAuth: true },
    component: () => import('../views/findclient.vue')
  },
  {
    path: '/clientdetails/:id',
    name: 'clientdetails',
    meta: { requiresAuth: true },
    component: () => import('../views/clientdetails.vue')
  },
  {
    path: '/eventform',
    name: 'eventform',
    meta: { requiresAuth: true, requiresEditor: true },
    component: () => import('../views/eventform.vue')
  },
  {
    path: '/findevents',
    name: 'findevents',
    meta: { requiresAuth: true },
    component: () => import('../views/findevents.vue')
  },
  {
    path: '/eventdetails/:id',
    name: 'eventdetails',
    meta: { requiresAuth: true },
    // file name is eventDetails.vue: the case has to match for builds on case-sensitive systems (Linux)
    component: () => import('../views/eventDetails.vue')
  },
  {
    path: '/serviceform',
    name: 'serviceform',
    meta: { requiresAuth: true, requiresEditor: true },
    component: () => import('../views/serviceform.vue')
  },
  {
    path: '/findservice',
    name: 'findservice',
    meta: { requiresAuth: true },
    component: () => import('../views/findservice.vue')
  },
  {
    path: '/servicedetails/:id',
    name: 'servicedetails',
    meta: { requiresAuth: true },
    component: () => import('../views/servicedetails.vue')
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

// protecting the routes
router.beforeEach((to) => {
  const store = useLoggedInUserStore()

  // an editor-only route always needs a logged-in user, even if requiresAuth was forgotten on it
  const needsLogin = to.meta.requiresAuth || to.meta.requiresEditor

  // re-check the saved token on every navigation: if it expired or was removed while the app
  // was open, end the session now instead of waiting for an API call to fail with a 401
  if (store.isLoggedIn && !store.hasValidSession()) {
    store.expireSession()
  }

  if (needsLogin && !store.isLoggedIn) {
    return {
      path: '/login',
      // save the location we were at to come back later
      query: { redirect: to.fullPath },
    }
  }

  // someone who is already logged in has no reason to see the login page
  if (to.path === '/login' && store.isLoggedIn) {
    return { path: '/' }
  }

  // logged-in users who are not editors (viewers) are sent home instead of seeing editor-only pages
  if (to.meta.requiresEditor && store.role !== 'editor') {
    store.denyAccess()
    return { path: '/' }
  }
})

export default router
