import Vue from 'vue'
import popupApp from './App.vue'
import store from '@/store'
import vuetify from '@/plugins/vuetify';
import router from './router'

/* eslint-disable no-new */
new Vue({
  router,
  store,
  vuetify,
  render: h => h(popupApp)
}).$mount('#reheadlineApp')

router.replace('/');