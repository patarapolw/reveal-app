<template lang="pug">
v-app
  v-navigation-drawer(v-model="isDrawer" :clipped="$vuetify.breakpoint.lgAndUp" app)
    v-list(dense)
      v-list-group(:value="$route.path.startsWith('/admin/post')")
        template(v-slot:activator)
          v-list-item-avatar
            v-icon mdi-newspaper
          v-list-item-content
            v-list-item-title Posts
        v-list-item(to="/admin/post/view")
          v-list-item-avatar.ml-3
              v-icon mdi-view-list
          v-list-item-content
            v-list-item-title View entries
        v-list-item(to="/admin/post/edit")
          v-list-item-avatar.ml-3
              v-icon mdi-pencil-outline
          v-list-item-content
            v-list-item-title Edit entry
      v-list-group(:value="$route.path.startsWith('/admin/media')")
        template(v-slot:activator)
          v-list-item-avatar
            v-icon mdi-image-size-select-actual
          v-list-item-content
            v-list-item-title Media
        v-list-item(to="/admin/media/view")
          v-list-item-avatar.ml-3
              v-icon mdi-view-list
          v-list-item-content
            v-list-item-title View entries
        v-list-item(to="/admin/media/edit")
          v-list-item-avatar.ml-3
              v-icon mdi-pencil-outline
          v-list-item-content
            v-list-item-title Edit entry
      //- v-list-group(:value="$route.path.startsWith('/quiz')")
      //-   template(v-slot:activator)
      //-     v-list-item-avatar
      //-       v-icon mdi-frequently-asked-questions
      //-     v-list-item-content
      //-       v-list-item-title Quiz
      //-   v-list-item(to="/quiz/view")
      //-     v-list-item-avatar.ml-3
      //-         v-icon mdi-view-list
      //-     v-list-item-content
      //-       v-list-item-title View entries
      //-   v-list-item(to="/quiz/edit")
      //-     v-list-item-avatar.ml-3
      //-         v-icon mdi-pencil-outline
      //-     v-list-item-content
      //-       v-list-item-title Edit entry
      //-   v-list-item(to="/quiz/users")
      //-     v-list-item-avatar.ml-3
      //-       v-icon mdi-account-search
      //-     v-list-item-content
      //-       v-list-item-title Quiz results
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
        v-card-text {{getUserDeep("web.hint")}}
  v-app-bar(:clipped-left="isDrawer" app color="green" dark)
    v-toolbar-title.mr-3
      v-app-bar-nav-icon.mr-2(@click.stop="isDrawer = !isDrawer")
      span.hidden-md-and-down(style="cursor: pointer;" @click="$router.push('/')") {{getUserDeep("web.banner")}}
    .flex-grow-1
    v-text-field.col-lg-4(flat solo-inverted hide-details prepend-inner-icon="mdi-magnify" label="Search"
      v-model="g.q" @keydown="onSearchKeydown")
    v-btn.ml-3(light href="/" target="_blank")
      v-icon mdi-open-in-new
      | Open Website
  v-content(fluid fill-height)
    router-view
  v-dialog(v-model="isNewUser" max-width="800")
    v-card
      v-card-title Create new admin user
      v-card-text
        v-card.mb-3
          v-card-title User information
          v-card-text
            v-text-field(label="Name" :value="getUserDeep('info.name')" @input="setUserDeep('info.name', $event)")
            v-text-field(label="Image" :value="g.user.picture" @input="$set(g.user, 'picture', $event)")
            v-text-field(label="Email" :value="g.user.email" @input="$set(g.user, 'email', $event)")
            v-text-field(label="Website" :value="getUserDeep('info.website')" @input="setUserDeep('info.website', $event)")
        v-card
          v-card-title Website information
          v-card-text
            v-text-field(label="Title" :value="getUserDeep('web.title')" @input="setUserDeep('web.title', $event)")
            v-text-field(label="Banner" :value="getUserDeep('web.banner')" @input="setUserDeep('web.banner', $event)")
            v-text-field(label="Disqus" :value="getUserDeep('web.disqus')" @input="setUserDeep('web.disqus', $event)")
            v-textarea(outlined label="About"
            :value="getUserDeep('web.about')" @input="setUserDeep('web.about', $event)")
            v-textarea(outlined label="Hint"
            :value="getUserDeep('web.hint')" @input="setUserDeep('web.hint', $event)")
      v-card-actions
        v-btn(@click="onNewUserSaved") Save
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { g } from "../util";
import dotProp from "dot-prop";
import { IUser } from "@reveal-app/abstract-db";

@Component
export default class App extends Vue {
  private isDrawer: boolean = this.$vuetify.breakpoint.lgAndUp;
  private g = g;

  private mode = process.env.VUE_APP_MODE;
  private isNewUser = false;

  mounted() {
    Array.from(document.getElementsByTagName("input")).forEach((input) => {
      input.spellcheck = false;
      input.autocapitalize = "off";
      input.autocomplete = "off";
    });

    if (!g.user._id && process.env.VUE_APP_MODE !== "electron") {
      this.isNewUser = true;
    }
  }

  getUserDeep(path: string) {
    return dotProp.get(g.user || {}, path);
  }

  setUserDeep(path: string, value: string) {
    dotProp.set(g.user || {}, path, value);
    this.$set(this.g, "user", g.user);
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

  async onNewUserSaved() {
    g.user = await (await fetch("/api/user/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...g.user,
        type: "admin"
      })
    })).json();

    this.isNewUser = false;
    location.reload();
  }
}
</script>