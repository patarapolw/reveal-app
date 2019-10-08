<template lang="pug">
v-container.pa-0(style="height: 100%")
  v-row(style="height: 100%")
    v-col.col-lg-4.h-100(fixed style="overflow-y: scroll;" :class="id ? 'hidden-md-and-down' : 'col-md-12'")
      v-treeview(@update:active="onSelected" :open="open" :items="items" item-key="data._id" open-on-click activatable return-object)
    v-divider(vertical)
    v-col.h-100(v-if="id")
      iframe(:src="iframeUrl" frameborder=0 style="width: 100%; height: 100%")
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { normalizeArray, setTitle } from "../util";
import ToNested, { ITreeViewItem } from "record-to-nested";

@Component
export default class Reveal extends Vue {
  private items: any[] = [];
  private open = [];

  private toNested = new ToNested({key: "deck"});
  private title = "";

  async mounted() {
    this.title = "";

    const raw = await (await fetch("/api/post/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        q: "type=reveal",
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

  set id(value: string) {
    if (value) {
      this.$router.push({query: {id: value}});
    } else {
      this.$router.push({query: {}});
    }
  }

  get iframeUrl() {
    if (this.id) {
      return `reveal.html?id=${this.id}`;
    } else {
      return "about:blank";
    }
  }

  onSelected(v: ITreeViewItem[]) {
    if (v.length > 0) {
      const {data} = v[0];
      if (data) {
        this.title = data.title;
        this.id = data._id;
      } else {
        this.title = "";
        this.id = "";
      }
    }
  }

  @Watch("title")
  onTitleChange() {
    setTitle(`${this.title ? `${this.title} - ` : ""}Quiz`);
  }
}
</script>