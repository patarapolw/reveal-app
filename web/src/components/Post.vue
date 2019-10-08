<template lang="pug">
v-card.ma-3
  .post--meta.pa-2
    .d-flex
      span
        a(:href="dotProp.get(author, 'info.website') || '#'"): img.avatar(:src="author.picture")
      span.ml-3
        a(:href="dotProp.get(author, 'info.website') || '#'") {{dotProp.get(author, 'info.name')}}
      span(style="flex-grow: 1")
      span {{dateString}}
  v-card-title.v-link(@click="to ? $router.push(to) : undefined") {{title}}
  v-card-text
    div(v-html="html")
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import moment from "moment";
import matter from "gray-matter";
import { g } from '../util';
import MakeHTML from "@reveal-app/make-html";
import dotProp from "dot-prop";

let makeHTML: MakeHTML;

try {
  const { slideExt, speakExt } = require("@zhsrs/custom-markdown");
  makeHTML = new MakeHTML(
    ["yaml", "markdown", "json", "application/json"],
    [slideExt, speakExt]
  );
} catch(e) {
  makeHTML = new MakeHTML(
    ["yaml", "markdown", "json", "application/json"]
  );
}

@Component
export default class Post extends Vue {
  @Prop() id!: string;
  @Prop({default: false}) isTeaser!: boolean;
  @Prop() content!: string;

  dotProp = dotProp;

  get matter() {
    return matter(this.content);
  }

  get title() {
    if (this.matter.data) {
      return this.matter.data.title || "";
    }

    return "";
  }

  get moment(): moment.Moment | null {
    if (this.matter.data && this.matter.data.date) {
      return moment(this.matter.data.date);
    }

    return null;
  }

  get dateString() {
    return this.moment ? this.moment.format("ddd D MMMM YYYY") : "";
  }

  get author() {
    const author = this.matter.data ? this.matter.data.author : null;
    if (!author) {
      console.log(g.user)
      return g.user;
    }

    return author;
  }

  get to() {
    const m = this.moment;
    if (m) {
      return `/post/${m.format("YYYY")}/${m.format("MM")}/${this.id}`;
    }

    return "";
  }

  get html(): string {
    const { content } = this.matter;
    if (this.isTeaser) {
      return makeHTML.compile(content.split(/\r?\n===\r?\n/)[0]).html
    } else {
      return makeHTML.compile(content.replace(/\r?\n===\r?\n/, "")).html;
    }
  }
}
</script>

<style lang="scss">
.avatar {
  border-radius: 50%;
  height: 24px;
}

.hanzi-img {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  height: 100px;
  font-size: 80px;
  font-family: serif;
}

.post--meta {
  a {
    text-decoration: none;
  }
}
</style>