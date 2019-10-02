import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'
import VueCodemirror from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import "codemirror/mode/markdown/markdown.js";
import "codemirror/mode/yaml/yaml.js";
import "codemirror/mode/yaml-frontmatter/yaml-frontmatter.js";
import "codemirror/mode/pug/pug.js";
import "codemirror/mode/css/css.js";
import "codemirror/addon/edit/closebrackets.js";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";

const { adminConfig } = require("./util");
require(`codemirror/theme/${adminConfig.codemirror.theme}.css`);

Vue.config.productionTip = false

Vue.use(VueCodemirror, {
  options: {
    ...adminConfig.codemirror,
    lineNumbers: true,
    autoCloseBrackets: true,
    gutters: true,
    lineWrapping: true
  }
})

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
