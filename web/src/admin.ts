import Vue from 'vue'
import Admin from './pages/Admin.vue'
import {routerOptions, activateVLink} from './router'
import Router from "vue-router";
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
import "codemirror/mode/javascript/javascript.js";
import "codemirror/addon/edit/closebrackets.js";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/markdown-fold.js";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/scroll/scrollpastend.js";
import "codemirror/theme/monokai.css";
import { g } from "./util";

Vue.config.productionTip = false

Vue.use(VueCodemirror, {
  options: {
    theme: "monokai",
    lineNumbers: true,
    autoCloseBrackets: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    lineWrapping: true,
    tabSize: 2,
    extraKeys: {
      'Cmd-/' : 'toggleComment',
      'Ctrl-/' : 'toggleComment',
      Tab: (cm: CodeMirror.Editor) => {
        const spaces = Array(cm.getOption("indentUnit")! + 1).join(" ");
        cm.getDoc().replaceSelection(spaces);
      }
    },
    foldGutter: true,
    scrollPastEnd: true
  }
});

Vue.use(Router);

routerOptions.routes = routerOptions.routes || []
routerOptions.routes.push(
  {path: "/admin", redirect: "/admin/post/view"},
  {
    path: "/admin/post/edit",
    component: () => import(/* webpackChunkName: "PostEdit" */ './views/PostEdit.vue')
  },
  {
    path: "/admin/post/view",
    component: () => import(/* webpackChunkName: "PostView" */ './views/PostView.vue')
  },
);

const router = new Router(routerOptions);
activateVLink(router);

(async () => {
  const r = await (await fetch("/api/user/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      q: `-web=NULL`,
      limit: 1
    })
  })).json();

  g.user = r.data[0] || g.user;

  new Vue({
    router,
    vuetify,
    render: h => h(Admin)
  }).$mount('#app');
})().catch(console.error);
