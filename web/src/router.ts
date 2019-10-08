import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/resource',
      name: 'resource',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
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
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return {
        selector: to.hash
      };
    } else {
      return { x: 0, y: 0 }
    }
  }
})

document.addEventListener("mouseover", (ev) => {
  const { target } = ev;
  if (target instanceof HTMLAnchorElement && target.matches(".v-link")) {
    if (!target.href) {
      const to = target.getAttribute("to")
      if (to) {
        target.href = router.resolve(to).href;
      }
    }
  }
});

export default router;
