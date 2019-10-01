import { createIndentedFilter } from "indented-filter";
import h from "hyperscript";

export const simpleTableExt = {
  type: "lang",
  filter(text: string) {
    const rowRegex = /(?:(?:^|\r?\n)(?:\| )?(?:(?:.* \| )+.+)*(?:.* \| )+.+(?: \|)?(?:$|\r?\n))+/m;

    text = text.replace(rowRegex, (p0) => {
      return h("table.table", p0.trim().split("\n").map((pi) => {
        pi = pi.trim().replace(/^|/, "").replace(/|$/, "")

        return h("tr", pi.split(" | ").map((x) => x.trim()).map((qi) => {
          return h("td", qi);
        }))
      })).outerHTML;
    });

    return text;
  }
};

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

export const toExt = {
  type: "lang",
  filter: createIndentedFilter("^^to", (s, attrs) => {
    let {url, ...params} = attrs;
    let q = []
    for (const [k, v] of Object.entries<string>(params)) {
      q.push(`${k}=${encodeURIComponent(v)}`);
    }

    if (q.length > 0) {
      url = `${url}?${q.join("&")}`;
    }

    return h("span.v-link", {attrs: {to: url}}, s).outerHTML;
  })
}

export const speakExt = {
  type: "lang",
  filter: createIndentedFilter("^^speak", (s0, attrs) => {
    let {lang, s} = attrs;

    return h("span.v-link.v-speak", {attrs: {lang: lang || "zh", s: s || s0}}, s0).outerHTML;
  })
}