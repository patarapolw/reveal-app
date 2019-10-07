import "./reveal.scss";
import matter from "gray-matter";
import { config } from './util';
import dotProp from "dot-prop";
import MakeHTML from "@reveal-app/make-html";

let makeHTML: MakeHTML;

try {
  const { slideExt, speakExt } = require("@zhsrs/custom-markdown");
  makeHTML = new MakeHTML(dotProp.get(
    config, "admin.codemirror.langs") || ["yaml", "markdown", "json", "application/json"],
    [slideExt, speakExt]
  );
} catch(e) {
  makeHTML = new MakeHTML(dotProp.get(
    config, "admin.codemirror.langs") || ["yaml", "markdown", "json", "application/json"]
  );
}

declare const revealCDN: string;
declare const Reveal: any;

(async () => {
  const _id = new URL(location.href).searchParams.get("id");
  if (_id) {
    let {title, content} = await (await fetch(`/api/post/${_id}`, {
      method: "POST"
    })).json();

    const m = matter(content);

    const {lang} = makeHTML.compile(m.content);
    let trueCode = m.content;

    if (content.startsWith("//")) {
      const lines = content.split("\n");
      trueCode = lines.slice(1).join("\n");
    }

    const slides = trueCode.split(/^---$/gm).map((slideGroup) => {
      return slideGroup.split(/^--$/gm).map((s) => {
        if (lang === "pug") {
          return makeHTML.pug(s);
        } else {
          return makeHTML.compile(s).html;
        }
      })
    });

    init({
      data: {
        title,
        ...m.data
      },
      slides
    });
  }
})().catch(console.error);

$(() => {
  $(document).on("click", ".v-speak", (ev) => {
    const p = ev.target as HTMLSpanElement;
    const lang = p.getAttribute("lang");
    const s = p.getAttribute("s");

    speak(s || p.innerText, lang || "zh-CN");
  });
});

function init(computedMd: any) {
  const headTag = document.getElementsByTagName("head")[0];
  const bodyTag = document.getElementsByTagName("body")[0];

  let { css, js } = computedMd.data;

  if (css) {
      if (!Array.isArray(css)) {
          css = [css];
      }

      for (const c of css) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.type = "text/css";
          link.href = c;
          headTag.append(link);
      }
  }

  if (js) {
      if (!Array.isArray(js)) {
          js = [js];
      }

      for (const j of js) {
          const script = document.createElement("script");
          script.src = j;
          bodyTag.append(script);
      }
  }

  if (computedMd.data.theme) {
      (document.getElementById("theme") as HTMLLinkElement).href = `${revealCDN}css/theme/${computedMd.data.theme}.css`;
  }

  if (computedMd.data.highlightTheme) {
      (document.getElementById("highlightTheme") as HTMLLinkElement).href = `${revealCDN}lib/css/${computedMd.data.highlightTheme}.css`;
  }

  let slideGroups = computedMd.slides;
  const markdownSections = document.getElementById("markdownSections");

  slideGroups.forEach((slides: any) => {
      const section = document.createElement("section");

      if (slides.length > 1) {
          slides.forEach((s: string) => {
              const subSection = document.createElement("section");
              subSection.setAttribute("data-transition", "slide");
              subSection.innerHTML = s;
              section.append(subSection);
          });
      } else {
          section.innerHTML = slides[0];
      }

      markdownSections!.appendChild(section);
  });

  // More info about config & dependencies:
  // - https://github.com/hakimel/reveal.js#configuration
  // - https://github.com/hakimel/reveal.js#dependencies
  Reveal.initialize({
      hash: true,
      history: true,
      ...computedMd.data,
      dependencies: [
          { src: `${revealCDN}plugin/markdown/marked.js` },
          { src: `${revealCDN}plugin/markdown/markdown.js` },
          { src: `${revealCDN}plugin/highlight/highlight.js`, async: true }
      ]
  });
}

function speak(s: string, lang = "zh-CN", rate = 0.8) {
  const allVoices = speechSynthesis.getVoices();
  let vs = allVoices.filter((v) => v.lang === lang);
  if (vs.length === 0) {
      const m1 = lang.substr(0, 2);
      const m2 = lang.substr(3, 2);
      const r1 = new RegExp(`^${m1}[-_]${m2}`, "i");

      vs = allVoices.filter((v) => r1.test(v.lang));
      if (vs.length === 0) {
          const r2 = new RegExp(`^${m1}`, "i");
          vs = allVoices.filter((v) => r2.test(v.lang));
      }
  }

  if (vs.length > 0) {
      const u = new SpeechSynthesisUtterance(s);
      u.lang = vs[0].lang;
      u.rate = rate || 0.8;
      speechSynthesis.speak(u);
  }
}
