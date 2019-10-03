<template lang="pug">
v-container.h-100.d-flex.flex-column.pa-0
  div(style="position: fixed; z-index: 100; width: calc(100% - 256px); padding: 10px")
    v-toolbar.elevation-1
      v-toolbar-title {{headers.title ? `${headers.title} ${date ? `(${date.toDateString()})` : ""}` : ""}}
      v-spacer
      v-toolbar-items
        v-btn(text @click="hasPreview = !hasPreview") {{hasPreview ? "Hide Preview" : "Show Preview"}}
        v-btn(text @click="reset") New
        v-btn(text @click="load") Reload
        v-btn(text :disabled="!headers.title || !isEdited" @click="save") Save
  v-row(style="overflow-y: scroll; margin-top: 75px")
    v-col(:class="hasPreview ? 'col-6 pr-0' : 'col-12'")
      codemirror.h-100(ref="cm" v-model="code" :options="cmOptions" @input="onCmCodeChange")
    v-col(v-if="hasPreview" ref="previewHolder" style="width: 50%")
      v-card.h-100.pa-3(v-if="headers.type !== 'reveal'" v-html="html")
      iframe(v-else ref="iframe" frameborder="0" :src="iframeUrl")
  v-snackbar(v-model="snackbar.show" :color="snackbar.color" :top="true")
    | {{snackbar.text}}
    v-btn(text @click="snackbar.show = false") Close
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { anyCompile } from "@zhsrs/make-html";
import matter from "gray-matter";
import { adminConfig, clone } from "../util";
import { toDate } from "valid-moment";

@Component
export default class BlogEdit extends Vue {
  private code = "";
  private cmOptions = {
    mode: {
      name: "yaml-frontmatter",
      base: "markdown"
    }
  }

  private headers: any = {};

  private html = "";
  private hasPreview = adminConfig.blog.preview;
  private iframeUrl = "about:blank";

  private isEdited = false;

  private snackbar = {
    text: "",
    color: "",
    show: false
  }

  mounted() {
    this.isEdited = false;
    this.load();
    this.codemirror.setSize("100%", "100%");
    this.codemirror.addKeyMap({
      "Cmd-S": () => {this.save()},
      "Ctrl-S": () => {this.save()}
    });
  }

  get codemirror(): CodeMirror.Editor {
    return (this.$refs.cm as any).codemirror;
  }

  get date() {
    if (typeof this.headers.date === "string") {
      return toDate(this.headers.date);
    } else if (this.headers.date instanceof Date) {
      return this.headers.date;
    }

    return null;
  }

  reset() {
    Vue.set(this, "headers", {});
    this.code = "";
    this.html = "";
    this.cmOptions.mode.base = "markdown";
    this.isEdited = false;

    this.hasPreview = false;

    this.$router.push({query: undefined});
  }

  @Watch("hasPreview")
  resizeIFrame() {
    this.$nextTick(() => {
      const iframeHolder = this.$refs.previewHolder as HTMLDivElement;
      const iframe = this.$refs.iframe as HTMLIFrameElement;
      if (iframe && iframeHolder) {
        const sqWidth = Math.min(iframeHolder.clientHeight, iframeHolder.clientWidth) * 0.95;
        iframe.style.maxHeight = `${sqWidth}px`;
        iframe.style.maxWidth = `${sqWidth}px`;
      }
    })
  }

  reloadIFrame() {
    const {_id} = this.$route.query
    if (_id) {
      this.iframeUrl = `/web/reveal.html?_id=${_id}`;
      const iframe = this.$refs.iframe as HTMLIFrameElement;
      if (iframe) {
        iframe.contentWindow!.location.reload();
      }
    } else {
      this.iframeUrl = "about:blank";
    }
  }

  @Watch("$route", {deep: true})
  async load() {
    const {_id} = this.$route.query
    if (_id) {
      const url = `/api/post/${_id}`;

      try {
        const {title, date, tag, hidden, type, content} = await (await fetch(url, {
          method: "POST"
        })).json();

        const m = matter(content);
        this.code = matter.stringify(m.content, clone({...m.data, title, date, tag, hidden, type}));
        this.isEdited = false;

        setTimeout(() => this.isEdited = false, 100);

        if (type === "reveal") {
          this.reloadIFrame();
        }
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
    if (!this.headers.title) {
      return;
    }

    try {
      const {_id} = await (await fetch("/api/post/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...this.headers,
          _id: this.$route.query._id,
          newId: this.headers._id,
          content: this.code
        })
      })).json();

      this.$router.push({query: {_id}});

      this.snackbar.text = "Saved";
      this.snackbar.color = "cyan darken-2";
      this.snackbar.show = true;

      this.isEdited = false;
      this.reloadIFrame();
    } catch(e) {
      this.snackbar.text = e.toString();
      this.snackbar.color = "error",
      this.snackbar.show = true;
    }
  }

  onCmCodeChange(newCode: string) {
    this.isEdited = true;
    this.code = newCode;
    try {
      const {data, content} = matter(newCode);
      Vue.set(this, "headers", data);
      const {lang, html} = anyCompile(content);

      this.cmOptions.mode.base = lang;
      this.html = html;
    } catch(e) {}
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