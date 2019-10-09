import Vue from 'vue'
import Index from './pages/Index.vue'
import {routerOptions, activateVLink} from './router'
import Router from "vue-router";
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import VueDisqus from "vue-disqus";
import { g, setTitle } from "./util";

Vue.config.productionTip = false

Vue.use(VueDisqus);
Vue.use(Router);

routerOptions.routes = routerOptions.routes || [];
routerOptions.routes.push(
  {
    path: '/resource',
    name: 'resource',
    component: () => import(/* webpackChunkName: "resource" */ './views/Resource.vue')
  },
  {
    path: '/present',
    name: 'present',
    component: () => import(/* webpackChunkName: "present" */ './views/Present.vue')
  },
  {
    path: "/blog",
    alias: "/",
    component: () => import(/* webpackChunkName: "blog" */ './views/Blog.vue'),
    children: [
      {
        path: "",
        name: "blog_home",
      },
      {
        path: "tag/:tag",
        name: "blog_tag",
      },
    ]
  },
  {
    path: "/post",
    component: () => import(/* webpackChunkName: "single" */ './views/Single.vue'),
    children: [
      {
        path: "",
        name: "blog_p_query"
      },
      {
        path: ":y/:mo/:name",
        name: "blog_p_date"
      }
    ]
  }
)

const router = new Router(routerOptions);
activateVLink(router);

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

  if (!g.user._id) {
    alert("Please create a new user first.")
  }

  setTitle();

  new Vue({
    router,
    vuetify,
    render: h => h(Index)
  }).$mount('#app');
})().catch(console.error);;
