import { createIndentedFilter } from "indented-filter";
import h from "hyperscript";

export const slideExt = {
  type: "lang",
  filter: createIndentedFilter("^^slide", (s, attrs) => {
    const a = document.createElement("a");
    const url = new URL("https://reveal-md.herokuapp.com/");
    let q = "";
    if (attrs.github) {
      q = `https://raw.githubusercontent.com/${attrs.github}/master/${s}`;
      a.innerText = `github/${attrs.github}/${s}`;
    } else {
      q = s;
      a.innerText = s;
    }

    url.searchParams.append("q", q);
    a.href = url.href; 
    a.title = s;
    a.target = "_blank";

    return a.outerHTML;
  })
}

export const speakExt = {
  type: "lang",
  filter: createIndentedFilter("^^speak", (s0, attrs) => {
    let {lang, s} = attrs;

    return h("span.v-link.v-speak", {attrs: {lang: lang || "zh", s: s || s0}}, s0).outerHTML;
  })
}