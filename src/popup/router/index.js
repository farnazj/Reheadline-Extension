import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '@/views/About.vue')
  },
  {
    path: '*',
    component: Home,
    meta: {
      requiresAuth: true
    }
  }
]

const router = new VueRouter({
  routes,
  mode: 'abstract'
})

router.beforeEach((to, from, next) => {
  console.log('router from where to where in popup', to, from, JSON.stringify(localStorage.getItem('trustnetAuthToken')))
  if(to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('trustnetAuthToken')) {
      next();
      window.scrollTo(0, 0);
      return;
    }
    else
    //   next('/login');
    console.log('needs to notify login')
  } else {
    next();
  }
})

export default router;
