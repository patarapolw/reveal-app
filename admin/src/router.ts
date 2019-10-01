import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: "/blog/edit",
      alias: [
        "/",
        "/blog"
      ],
      component: () => import(/* webpackChunkName: "BlogEdit" */ './views/BlogEdit.vue')
    },
    {
      path: "/blog/view",
      component: () => import(/* webpackChunkName: "BlogView" */ './views/BlogView.vue')
    },
  ]
})
