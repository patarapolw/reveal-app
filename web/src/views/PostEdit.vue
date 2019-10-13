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
      v-card.iframe(v-else ref="iframe")
        eagle-markdown(:markdown="html" :line="line"
           :mouse-navigation="false" :keyboard-navigation="false" :back-by-slide="true")
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
import EagleMarkdown from "../components/EagleMarkdown.vue";
import CodeMirror from "codemirror";

@Component({
  components: {
    Raw, EagleMarkdown
  }
})
export default class PostEdit extends Vue {
  private code = "";
  private cmOptions = {
    mode: {
      name: "yaml-frontmatter",
      base: "markdown"
    }
  }

  private headers: any = {};
  private currentId: string | null = null;

  private html = "";
  private line = 0;
  private offset = 0;
  private hasPreview = false;

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
    this.codemirror.on("cursorActivity", (instance) => {
      this.line = instance.getCursor().line - this.offset;
    });
    this.codemirror.on("change", (instance) => {
      this.line = instance.getCursor().line - this.offset;
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
  }

  @Watch("isReveal")
  resizeIFrame() {
    const cursor = this.codemirror.getDoc().getCursor();

    this.$nextTick(() => {
      this.codemirror.setSize("100%", "100%");
      this.codemirror.scrollIntoView(null, 400);

      const iframeHolder = this.$refs.previewHolder as HTMLDivElement;
      const iframe = document.getElementsByClassName("iframe")[0] as HTMLIFrameElement;
      if (iframe && iframeHolder) {
        const sqWidth = Math.min(iframeHolder.clientHeight, iframeHolder.clientWidth) * 0.95;
        iframe.style.height = `${sqWidth}px`;
        iframe.style.width = `${sqWidth}px`;
      }
    });
  }

  get fileUrl() {
    const {id} = this.$route.query;
    if (!id) {
      return null;
    }

    if (this.isReveal) {
      return this.$router.resolve(`/present?id=${id}`).href;
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

    if (id && id !== this.currentId) {
      this.currentId = id as string;
      const url = `/api/post/${id}`;

      try {
        const {title, date, tag, hidden, type, content} = await (await fetch(url, {
          method: "POST"
        })).json();

        const m = matter(content);
        this.code = matter.stringify(m.content, clone({...m.data, title, date, tag, hidden, type}));
        this.isEdited = false;

        this.$nextTick(() => this.isEdited = false);
      } catch(e) {
        this.snackbar.text = e.toString();
        this.snackbar.color = "error",
        this.snackbar.show = true;
      }
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
          _id: this.currentId || undefined,
          newId: this.headers._id,
          content: this.code
        })
      })).json();

      if (_id) {
        this.$router.push({query: {
          ...this.$route.query,
          id: _id
        }})
      };

      this.snackbar.text = "Saved";
      this.snackbar.color = "cyan darken-2";
      this.snackbar.show = true;

      this.isEdited = false;
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
      this.offset = newCode.replace(content, "").split("\n").length - 1;
    } catch(e) {
      this.html = newCode;
      this.offset = 0;
    }
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

<style lang="scss">
.iframe {
  position: fixed;
  height: calc(100vh - 180px);
  width: calc(100vh - 180px);
}
</style>