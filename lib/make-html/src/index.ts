import showdown from "showdown";
import h from "hyperscript";
import { HyperPug } from "hyperpug";
import { slideExt, simpleTableExt, toExt, speakExt } from "./extensions";

export class Markdown {
  private converter: showdown.Converter;

  constructor() {
    this.converter = new showdown.Converter({
      parseImgDimensions: true,
      extensions: [simpleTableExt, slideExt, toExt, speakExt]
    });
    this.converter.setFlavor("github");
  }

  md2html(md: string) {
    return this.converter.makeHtml(md);
  }
}

const md = new Markdown();

export const mdCompile = (s: string) => md.md2html(s);

const pugFilters = {
  markdown: (text: string) => {
    return mdCompile(text);
  },
  css: (text: string) => {
    return h("style", {innerHTML: text});
  }
};

const hp = new HyperPug(pugFilters);

export const pugCompile = (s: string) => hp.parse(s);

export function anyCompile(
  s: string,
  langs: string[] = ["markdown", "pug", "application/json", "yaml"]
): {html: string, lang: string} {
  let lang = "markdown";

  if (s.startsWith("//")) {
    const lines = s.split("\n");
    let newLang = lines[0].split(" ")[1];

    if (newLang === "json") {
      newLang = "application/json";
    }

    if (langs.includes(newLang)) {
      lang = newLang;
    }
    s = lines.slice(1).join("\n");
  }

  let html: string;

  if (lang === "pug") {
    html = pugCompile(s);
  } else if (lang === "markdown") {
    html = mdCompile(s);
  } else {
    html = h("pre", s).outerHTML;
  }

  return {html, lang};
}