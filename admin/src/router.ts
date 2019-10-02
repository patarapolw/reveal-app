import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: "history",
  routes: [
    {
      path: "/blog/edit",
      alias: [
        "/"
      ],
      component: () => import(/* webpackChunkName: "BlogEdit" */ './views/BlogEdit.vue')
    },
    {
      path: "/blog/view",
      component: () => import(/* webpackChunkName: "BlogView" */ './views/BlogView.vue')
    },
    {
      path: "/reveal/edit",
      component: () => import(/* webpackChunkName: "RevealEdit" */ './views/RevealEdit.vue')
    },
    {
      path: "/reveal/view",
      component: () => import(/* webpackChunkName: "RevealView" */ './views/RevealView.vue')
    },
  ]
})
