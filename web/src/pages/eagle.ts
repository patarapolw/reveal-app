import Eagle from "eagle.js";
import "animate.css";
import Vue from 'vue';
import vuetify from "../plugins/vuetify";
import EagleVue from "./Eagle.vue";
import 'eagle.js/dist/themes/agrume/agrume.css'

Vue.use(Eagle);

new Vue({
  vuetify,
  render: h => h(EagleVue)
}).$mount('#app');

declare global {
  interface Window {
    eagle: Vue;
  }
}
