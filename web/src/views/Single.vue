<template lang="pug">
v-row
  v-col.col-lg-8.col-md-12
    div(v-if="_id")
      post(:is-teaser="false" :_id="_id", :content="content")
      .ma-3
        vue-disqus(:shortname="disqus" :identifier="_id")
    div(v-else="")
      empty
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import Post from "@/components/Post.vue";
import Empty from "@/components/Empty.vue";
import moment from "moment";
import { webConfig, normalizeArray } from "../util";

@Component({
  components: {
    Post, Empty
  }
})
export default class Search extends Vue {
  private content: string = "";
  private disqus: string = webConfig.disqus;

  @Watch("_id")
  async mounted() {
    const {content} = await (await fetch(`/api/post/${this._id}`, {
      method: "POST"
    })).json();
    this.content = content;
  }

  get _id() {
    const {name} = this.$route.params;
    return name as string || "";
  }
}
</script>