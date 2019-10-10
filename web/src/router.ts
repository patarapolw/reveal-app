import { RouterOptions } from 'vue-router';
import "./index.scss";

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