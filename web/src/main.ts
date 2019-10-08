import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import VueDisqus from "vue-disqus";
import { g, setTitle } from "./util";

Vue.config.productionTip = false

Vue.use(VueDisqus);

(async () => {
  const r = await (await fetch("/api/user/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      q: `-web=NULL`,
      limit: 1
    })
  })).json();

  g.user = r.data[0] || g.user;

  setTitle();

  new Vue({
    router,
    vuetify,
    render: h => h(App)
  }).$mount('#app');
})().catch(console.error);;
