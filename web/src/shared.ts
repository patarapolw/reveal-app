import { RouterOptions } from 'vue-router';
import "./vue.scss";
import "./global.scss";
import "./global";
import Vue from 'vue';
import Router from "vue-router";
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import Eagle from "eagle.js";
import "animate.css";

Vue.config.productionTip = false

Vue.use(Router);
Vue.use(Eagle);

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