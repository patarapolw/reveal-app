import Router, { RouterOptions } from 'vue-router'

export const routerOptions: RouterOptions = {
  mode: "history",
  routes: [],
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
}

export function activateVLink(router: Router) {
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
}
