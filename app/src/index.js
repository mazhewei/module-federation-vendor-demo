'use strict';
const Vue = await import('vendor/vue')
import App from './App.vue'

new Vue.default({
  render: h => h(App)
}).$mount('#app')