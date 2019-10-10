<template lang="pug">
v-container.h-100.d-flex.flex-column.pa-0
  div(style="position: fixed; z-index: 100; width: calc(100% - 256px); padding: 10px")
    v-toolbar.elevation-1
      v-toolbar-title {{headers.title ? `${headers.title} ${date ? `(${date.toDateString()})` : ""}` : ""}}
      v-spacer
      v-toolbar-items
        v-btn(text @click="onTogglePreviewClicked") {{hasPreview ? "Hide Preview" : "Show Preview"}}
        v-btn(text :disabled="!fileUrl" @click="openInExternal") Open in external
        v-btn(text @click="reset") New
        v-btn(text @click="load") Reload
        v-btn(text :disabled="!canSave" @click="save") Save
  v-row(style="overflow-y: scroll; margin-top: 75px")
    v-col(:class="hasPreview ? 'col-6 pr-0' : 'col-12'")
      codemirror.h-100(ref="cm" v-model="code" :options="cmOptions" @input="onCmCodeChange")
    v-col(v-show="hasPreview" ref="previewHolder" style="width: 50%")
      v-card.h-100.pa-3(v-if="!isReveal")
        raw(:code="html" @lang="onLangChanged")
      iframe(v-show="isReveal" ref="iframe" frameborder="0" :src="iframeUrl")
  v-snackbar(v-model="snackbar.show" :color="snackbar.color" :top="true")
    | {{snackbar.text}}
    v-btn(text @click="snackbar.show = false") Close
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import matter from "gray-matter";
import { clone, setTitle } from "../util";
import { toDate } from "valid-moment";
import { g } from '../util';
import Raw from "../components/Raw.vue";

@Component({
  components: {Raw}
})
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
  private hasPreview = false;
  private iframeUrl = "about:blank";

  private isEdited = false;

  private snackbar = {
    text: "",
    color: "",
    show: false
  }

  async mounted() {
    this.isEdited = false;
    this.codemirror.setSize("100%", "100%");
    this.codemirror.addKeyMap({
      "Cmd-S": () => {this.save()},
      "Ctrl-S": () => {this.save()}
    });

    await this.load();
    this.onTitleChange();

    window.onbeforeunload = (e: any) => {
      console.log(e);
      const msg = this.canSave ? "Please save before leaving." : null;
      if (msg) {
        e.returnValue = msg;
        return msg;
      }
    }
  }

  async destroyed() {
    window.onbeforeunload = null;
  }

  get codemirror(): CodeMirror.Editor {
    return (this.$refs.cm as any).codemirror;
  }

  get isReveal() {
    return this.headers.type === "reveal";
  }

  get canSave() {
    return this.headers.title && this.isEdited;
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
  
  onTogglePreviewClicked() {
    this.$router.push({query: {
      ...this.$route.query,
      preview: (!this.hasPreview).toString()
    }});
    // this.hasPreview = !this.hasPreview;
  }

  resizeIFrame() {
    const cursor = this.codemirror.getDoc().getCursor();

    this.$nextTick(() => {
      this.codemirror.setSize("100%", "100%");
      this.codemirror.scrollIntoView(null, 400);

      if (this.isReveal) {
        this.iframeUrl = this.fileUrl || "about:blank";
        const iframeHolder = this.$refs.previewHolder as HTMLDivElement;
        const iframe = this.$refs.iframe as HTMLIFrameElement;
        if (iframe && iframeHolder) {
          const sqWidth = Math.min(iframeHolder.clientHeight, iframeHolder.clientWidth) * 0.95;
          iframe.style.maxHeight = `${sqWidth}px`;
          iframe.style.maxWidth = `${sqWidth}px`;
        }
      } else {
      }
    });
  }

  reloadIFrame() {
    if (this.isReveal) {
      const {id} = this.$route.query
      if (id) {
        const iframe = this.$refs.iframe as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
          const url = new URL(iframe.contentWindow.location.href);
          if (url.searchParams.get("id") === id) {
            iframe.contentWindow.location.reload();
          } else {
            this.iframeUrl = `/reveal?id=${id}`;
          }
        }
      } else {
        this.iframeUrl = "about:blank";
      }
    }
  }

  get fileUrl() {
    const {id} = this.$route.query;
    if (!id) {
      return null;
    }

    if (this.isReveal) {
      const iframe = this.$refs.iframe as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        const url = new URL(iframe.contentWindow.location.href);
        if (url.searchParams.get("id") === id) {
          return url.href;
        }
        
        return this.$router.resolve(`/reveal?id=${id}`).href;
      }
    }

    return this.$router.resolve(`/post?id=${id}`).href;
  }

  openInExternal() {
    if (this.fileUrl) {
      open(this.fileUrl, "_blank");
    }
  }

  @Watch("$route", {deep: true})
  async load() {
    const {id, preview} = this.$route.query;

    if (preview) {
      try {
        this.hasPreview = JSON.parse(preview as string);
      } catch(e) {
        this.hasPreview = false;
      }
      this.resizeIFrame();
    }

    if (id) {
      const url = `/api/post/${id}`;

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
    if (!this.canSave) {
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
          _id: this.$route.query.id,
          newId: this.headers._id,
          content: this.code
        })
      })).json();

      this.$router.push({query: {id: _id}});

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
      this.html = content;
    } catch(e) {}
  }

  onLangChanged(lang: string) {
    this.cmOptions.mode.base = lang;
  }

  @Watch("headers.title")
  onTitleChange() {
    setTitle(this.headers.title || "New Entry", true);
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