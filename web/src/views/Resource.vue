<template lang="pug">
v-container.pa-0(style="height: 100%")
  v-row(style="height: 100%")
    v-col.col-lg-4.h-100(fixed style="overflow-y: scroll;" :class="html ? 'hidden-md-and-down' : 'col-md-12'")
      v-treeview(@update:active="onSelected" :open="open" :items="items" item-key="data._id"
      open-on-click activatable return-object)
    v-divider(vertical)
    v-col.h-100(fixed style="overflow-y: scroll;" v-if="html")
      div(style="width: 100%; white-space: pre-wrap;" v-html="html")
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { normalizeArray } from "../util";
import { anyCompile } from "@zhsrs/make-html";
import ToNested, { ITreeViewItem } from "record-to-nested";
import matter from "gray-matter";

@Component
export default class App extends Vue {
  private items: any[] = [];
  private open = [];

  private html: string = "";

  private toNested = new ToNested({key: "deck"});

  async mounted() {
    this.html = "";

    const raw = await (await fetch("/api/post/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: "type=resource",
        limit: null,
        fields: ["_id", "deck", "title"]
      })
    })).json();

    this.items = this.toNested.toNested(raw.data);
  }

  get id() {
    const {id} = this.$route.query;
    return id as string;
  }

  @Watch("id")
  async onRouteChanged() {
    const {content} = await (await fetch(`/resources/${this.id}`)).json() || {};
    if (content) {
      this.html = anyCompile((content || "").split(/\r?\n===\r?\n/)[0]).html;
    }
  }

  async onSelected(v: ITreeViewItem[]) {
    if (v.length > 0) {
      const {data} = v[0];
      if (data) {
        this.html = anyCompile(
          matter((await (await fetch(`/api/post/${data._id}`, {
            method: "POST"
          })).json()).content).content
        ).html;;
      } else {
        this.html = "";
      }
    }
  }
}
</script>