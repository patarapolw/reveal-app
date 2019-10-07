<template lang="pug">
v-app
  v-navigation-drawer(v-model="isDrawer" :clipped="$vuetify.breakpoint.lgAndUp" app)
    v-list(dense)
      v-list-group(:value="$route.path.startsWith('/post')")
        template(v-slot:activator)
          v-list-item-avatar
            v-icon mdi-content-copy
          v-list-item-content
            v-list-item-title Posts
        v-list-item(to="/post/edit")
          v-list-item-avatar.ml-3
              v-icon mdi-plus
          v-list-item-content
            v-list-item-title New entry
        v-list-item(to="/post/view")
          v-list-item-avatar.ml-3
              v-icon mdi-view-list
          v-list-item-content
            v-list-item-title View entries
      v-list-group(:value="$route.path.startsWith('/quiz')")
        template(v-slot:activator)
          v-list-item-avatar
            v-icon mdi-frequently-asked-questions
          v-list-item-content
            v-list-item-title Quiz
        v-list-item(to="/quiz/edit")
          v-list-item-avatar.ml-3
              v-icon mdi-plus
          v-list-item-content
            v-list-item-title New entry
        v-list-item(to="/quiz/view")
          v-list-item-avatar.ml-3
              v-icon mdi-view-list
          v-list-item-content
            v-list-item-title View entries
        v-list-item(to="/quiz/users")
          v-list-item-avatar.ml-3
            v-icon mdi-account-search
          v-list-item-content
            v-list-item-title Quiz results
      v-list-item(href="http://localhost:9000" target="_blank")
        v-list-item-avatar
          v-icon mdi-open-in-new
        v-list-item-content
          v-list-item-title Open website
      v-list-item(href="https://github.com/patarapolw/zhsrs" target="_blank")
        v-list-item-avatar
          v-icon mdi-github-circle
        v-list-item-content
          v-list-item-title About
    template(v-slot:append)
      v-card
        v-card-title Hint
        v-card-text You don't have to deploy 'admin' to remote server.
  v-app-bar(:clipped-left="isDrawer" app color="green" dark)
    v-toolbar-title.mr-3
      v-app-bar-nav-icon.mr-2(@click.stop="isDrawer = !isDrawer")
      span.hidden-md-and-down(style="cursor: pointer;" @click="$router.push('/')") 中文 SRS
    .flex-grow-1
    v-text-field.col-lg-4(flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search"
      v-model="g.q" @keydown="onSearchKeydown")
  v-content(fluid fill-height)
    router-view
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { g } from "./util";

@Component
export default class App extends Vue {
  private isDrawer: boolean = this.$vuetify.breakpoint.lgAndUp;
  private g = g;

  mounted() {
    Array.from(document.getElementsByTagName("input")).forEach((input) => {
      input.spellcheck = false;
      input.autocapitalize = "off";
      input.autocomplete = "off";
    });
  }

  @Watch("$route.path")
  onRouteChanged(to: string) {
    this.g.q = this.$route.query.q as string || "";
  }

  onSearchKeydown(evt: KeyboardEvent) {
    if (evt.code === "Enter") {
      this.g.q += "\n";
    }
  }
}
</script>

<style lang="scss">
.v-link {
  color: blue;
  cursor: pointer;
  text-decoration: none !important;
}

img {
  max-width: 100%;
}

iframe {
  border: none;
  border-width: 0;
}

pre {
  white-space: pre-wrap;
}

.w-100 {
  width: 100%;
}

.h-100 {
  height: 100%;
}

.click-table {
  width: 100%;

  tbody tr {
    cursor: pointer;

    &:hover {
      background-color: rgb(219, 236, 241) !important;
    }
  }
}

.CodeMirror {
  .cm-tab {
    background: gray;
  }
}
</style>
