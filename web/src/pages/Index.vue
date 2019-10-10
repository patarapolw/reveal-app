<template lang="pug">
v-app
  v-navigation-drawer(v-model="isDrawer" :clipped="$vuetify.breakpoint.lgAndUp" app)
    v-list(dense)
      v-list-item(to="/blog")
        v-list-item-avatar
          v-icon mdi-calendar-edit
        v-list-item-content
          v-list-item-title Blog
      v-list-item(to="/resource")
        v-list-item-avatar
          v-icon mdi-sitemap
        v-list-item-content
          v-list-item-title Resource
      v-list-item(to="/present")
        v-list-item-avatar
          v-icon mdi-play-box-outline
        v-list-item-content
          v-list-item-title Presentations
      v-list-item(v-if="isAdmin" href="/admin")
        v-list-item-avatar
          v-icon mdi-account-supervisor-circle
        v-list-item-content
          v-list-item-title Admin
      v-list-item(href="https://github.com/patarapolw/reveal-app" target="_blank")
        v-list-item-avatar
          v-icon mdi-github-circle
        v-list-item-content
          v-list-item-title GitHub
      v-list-item(v-if="getUserDeep('web.about')" to="/about")
        v-list-item-avatar
          v-icon mdi-information-variant
        v-list-item-content
          v-list-item-title About
    template(v-if="getUserDeep('web.hint')" v-slot:append)
      v-card
        v-card-title Hint
        v-card-text {{getUserDeep('web.hint')}}
  v-app-bar(:clipped-left="isDrawer" app color="green" dark)
    v-toolbar-title.mr-3
      v-app-bar-nav-icon.mr-2(@click.stop="isDrawer = !isDrawer")
      span.hidden-md-and-down(style="cursor: pointer;" @click="$router.push('/')") {{getUserDeep('web.banner')}}
    .flex-grow-1
    v-text-field.col-lg-4(flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search"
      v-model="g.q" @keydown="onSearchKeydown")
  v-content(fluid fill-height)
    router-view
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { g } from "../util";
import dotProp from "dot-prop";

@Component
export default class Index extends Vue {
  private isDrawer: boolean = this.$vuetify.breakpoint.lgAndUp;
  private g = g;

  private isAdmin = process.env.VUE_APP_IS_ADMIN;

  mounted() {
    Array.from(document.getElementsByTagName("input")).forEach((input) => {
      input.spellcheck = false;
      input.autocapitalize = "off";
      input.autocomplete = "off";
    });
  }

  getUserDeep(path: string) {
    return dotProp.get(g.user, path);
  }

  setUserDeep(path: string, value: string) {
    dotProp.set(g.user!, path, value);
    this.$set(this.g, "user", g.user);
  }

  @Watch("$route.path")
  onRouteChanged(to: string) {
    this.g.q = "";
  }

  onSearchKeydown(evt: KeyboardEvent) {
    if (evt.code === "Enter") {
      this.g.q += "\n";
    }
  }
};
</script>