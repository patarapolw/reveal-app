import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: "history",
  routes: [
    {path: "/", redirect: "/post/edit"},
    {
      path: "/post/edit",
      component: () => import(/* webpackChunkName: "PostEdit" */ './views/PostEdit.vue')
    },
    {
      path: "/post/view",
      component: () => import(/* webpackChunkName: "PostView" */ './views/PostView.vue')
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
