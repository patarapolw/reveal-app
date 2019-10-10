<script lang="ts">
import { Vue, Component, Prop, Emit } from "vue-property-decorator";
import MakeHTML from "@reveal-app/make-html";

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
export default class Raw extends Vue {
  @Prop() code!: string;

  render(h: any){
    const {lang, html} = makeHTML.compile(this.code);
    this.emitLanguage(lang);

    const div = document.createElement("div");
    div.innerHTML = html;

    return h(Vue.compile(div.outerHTML));
  }

  @Emit("lang")
  emitLanguage(lang: string) {
    return lang;
  }
}
</script>