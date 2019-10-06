import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import VueDisqus from "vue-disqus";

Vue.config.productionTip = false

Vue.use(VueDisqus);

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
