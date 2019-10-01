<template lang="pug">
v-app
  v-navigation-drawer(v-model="isDrawer" :clipped="$vuetify.breakpoint.lgAndUp" app)
    v-list(dense)
      v-list-group(value="true")
        template(v-slot:activator)
          v-list-item-avatar
            v-icon mdi-home
          v-list-item-content
            v-list-item-title Blog
        v-list-item(to="/blog/edit")
          v-list-item-avatar.ml-3
              v-icon mdi-plus
          v-list-item-content
            v-list-item-title New entry
        v-list-item(to="/blog/view")
          v-list-item-avatar.ml-3
              v-icon mdi-view-list
          v-list-item-content
            v-list-item-title View entries
      v-list-group
        template(v-slot:activator)
          v-list-item-avatar
            v-icon mdi-sitemap
          v-list-item-content
            v-list-item-title Resources
        v-list-item(to="/resources/edit")
          v-list-item-avatar.ml-3
              v-icon mdi-plus
          v-list-item-content
            v-list-item-title New entry
        v-list-item(to="/resources/view")
          v-list-item-avatar.ml-3
              v-icon mdi-view-list
          v-list-item-content
            v-list-item-title View entries
      v-list-group
        template(v-slot:activator)
          v-list-item-avatar
            v-icon mdi-frequently-asked-questions
          v-list-item-content
            v-list-item-title Quiz
        v-list-item(to="/quiz/view")
          v-list-item-avatar.ml-3
              v-icon mdi-view-list
          v-list-item-content
            v-list-item-title View entries
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
  private tags = ["tag1", "tag2"];

  @Watch("$route.path")
  onRouteChanged(to: string) {
    this.g.q = "";
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
}

img {
  max-width: 100%;
}

.w-100 {
  width: 100%;
}
</style>
