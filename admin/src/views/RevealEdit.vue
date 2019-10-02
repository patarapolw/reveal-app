<template lang="pug">
v-container.h-100.d-flex.flex-column.pa-0
  div(style="position: fixed; z-index: 100; width: calc(100% - 256px); padding: 10px")
    v-toolbar.elevation-1
      v-toolbar-title {{title ? `${title} ${date ? `(${date.toDateString()})` : ""}` : ""}}
      v-spacer
      v-toolbar-items
        v-btn(text @click="hasPreview = !hasPreview") {{hasPreview ? "Hide Presentation" : "Show Presentation"}}
        v-btn(text :disabled="!code" @click="reset") New
        v-btn(text :disabled="!trueId" @click="load") Reload
        v-btn(text :disabled="!title" @click="save") Save
  v-row.w-100(style="overflow-y: scroll; margin-top: 75px")
    v-col(:class="hasPreview ? 'col-6 pr-0' : 'col-12'")
      codemirror.h-100(ref="cm" v-model="code" :options="cmOptions" @input="onCmCodeChange")
    v-col#iframeHolder(v-if="hasPreview" ref="iframeHolder" style="width: 50%")
      iframe#iframe(ref="iframe" frameborder="0" :src="iframeUrl")
  v-snackbar(v-model="snackbar.show" :color="snackbar.color" :top="true")
    | {{snackbar.text}}
    v-btn(text @click="snackbar.show = false") Close
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import matter from "gray-matter";
import { adminConfig } from "../util";
import { toDate } from "valid-moment";
import { anyCompile } from "@zhsrs/make-html";

@Component
export default class BlogEdit extends Vue {
  private code = "";
  private cmOptions = {
    mode: {
      name: "yaml-frontmatter",
      base: "markdown"
    }
  }

  private _id: string | null  = null;
  private title: string | null = null;
  private date: Date | null = null;
  private tag: string[] = [];

  private iframeUrl = "about:blank";
  private hasPreview = adminConfig.blog.preview;

  private snackbar = {
    text: "",
    color: "",
    show: false
  }

  mounted() {
    this.load();
    this.codemirror.setSize("100%", "100%");
  }

  @Watch("hasPreview")
  resizeListener() {
    this.$nextTick(() => {
      const iframeHolder = document.getElementById("iframeHolder") as HTMLDivElement;
      const iframe = document.getElementById("iframe") as HTMLIFrameElement;
      if (iframe && iframeHolder) {
        const sqWidth = Math.min(iframeHolder.clientHeight, iframeHolder.clientWidth);
        iframe.style.maxHeight = `${sqWidth}px`;
        iframe.style.maxWidth = `${sqWidth}px`;
      }
    })
  }

  get codemirror(): CodeMirror.Editor {
    return (this.$refs.cm as any).codemirror;
  }

  get iframe(): HTMLIFrameElement {
    return this.$refs.iframe as any;
  }

  get trueId(): string {
    const {_id} = this.$route.query;
    return _id as string;
  }

  reset() {
    this._id = null;
    this.code = "";
    this.iframeUrl = "about:blank";
    this.title = null;
    this.date = null;
    this.tag = [];
    this.cmOptions.mode.base = "markdown";

    this.$router.push({query: undefined});
  }

  @Watch("$route", {deep: true})
  async load() {
    const {_id} = this.$route.query;
    if (_id) {
      this.iframeUrl = `/web/reveal.html?_id=${_id}`;
      if (this.iframe) {
        this.iframe.contentWindow!.location.reload();
      }

      const url = `/api/post/${_id}`;

      try {
        const {_id, content, title, date, tag} = await (await fetch(url, {
          method: "POST"
        })).json();

        this._id = _id;
        this.title = title;
        this.code = content;
        this.date = toDate(date) || null;
        this.tag = tag;
      } catch(e) {
        this.snackbar.text = e.toString();
        this.snackbar.color = "error",
        this.snackbar.show = true;
      }
    } else {
      this.reset();
    }
  }

  async save() {
    try {
      const {_id} = await (await fetch("/api/post/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          _id: this.$route.query._id,
          newId: this._id,
          content: this.code,
          title: this.title,
          date: this.date,
          tag: this.tag,
          type: "reveal"
        })
      })).json();

      this._id = _id;

      this.$router.push({query: {_id}});

      this.snackbar.text = "Saved";
      this.snackbar.color = "cyan darken-2";
      this.snackbar.show = true;
    } catch(e) {
      this.snackbar.text = e.toString();
      this.snackbar.color = "error",
      this.snackbar.show = true;
    }
  }

  onCmCodeChange(newCode: string) {
    this.code = newCode;
    const {data, content} = matter(newCode);
    
    this._id = data._id || null;
    this.title = data.title || null;
    this.date = toDate(data.date || "") || null;
    this.tag = Array.isArray(data.tag) ? data.tag : [];

    const {lang} = anyCompile(content);

    this.cmOptions.mode.base = lang;
  }
}
</script>

<style lang="scss" scoped>
iframe {
  position: fixed;
  height: 100%;
  width: 100%;
}
</style>