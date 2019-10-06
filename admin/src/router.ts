import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
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
    }
  ]
})

document.addEventListener("mouseover", (ev) => {
  const { target } = ev;
  if (target instanceof HTMLAnchorElement && target.matches(".v-link")) {
    if (!target.href) {
      const to = target.getAttribute("to")
      if (to) {
        target.href = router.resolve("/web/#" + to).href;
        target.target = "_blank"
      }
    }
  }
});

export default router;
