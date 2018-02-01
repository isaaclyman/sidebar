import Vue from 'vue'
import Router from 'vue-router'
import authApi from './authApi'

Vue.use(Router)

import Account from './account.page.vue'
import Limited from './limited.page.vue'
import Login from './login.page.vue'
import Premium from './premium.page.vue'
import Signup from './signup.page.vue'
import Verification from './verification.page.vue'
import Verify from './verify.page.vue'

let currentUser = null
const getCurrentUser = () => currentUser

const assertSignedIn = (to, from, next) => {
  authApi.getUser().then(user => {
    if (user.verified === false) {
      return next({ path: '/verification' })
    }

    currentUser = user
    next()
  }, err => {
    console.error(err)
    next({ path: '/login' })
  })
}

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/limited',
      name: 'Limited Account',
      component: Limited,
      beforeEnter: assertSignedIn,
      meta: { getCurrentUser }
    },
    {
      path: '/login',
      name: 'Log In',
      component: Login
    },
    {
      path: '/account',
      name: 'Account',
      component: Account,
      beforeEnter: assertSignedIn,
      meta: { getCurrentUser }
    },
    {
      path: '/gopremium',
      name: 'Premium Account',
      component: Premium,
      beforeEnter: assertSignedIn,
      meta: { getCurrentUser }
    },
    {
      path: '/signup',
      name: 'Sign Up',
      component: Signup
    },
    {
      path: '/verification',
      name: 'Verify Account',
      component: Verification
    },
    {
      path: '/verify/:email/:key',
      name: 'Verify Link',
      component: Verify
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
