import showdown from "showdown";
import h from "hyperscript";
import pug, { IHyperPugFilters } from "hyperpug";
import { simpleTableExt, toExt } from "./extensions";

export class Markdown {
  private converter: showdown.Converter;

  constructor(ext: showdown.ShowdownExtension[] = []) {
    this.converter = new showdown.Converter({
      parseImgDimensions: true,
      extensions: [simpleTableExt, toExt, ...ext]
    });
    this.converter.setFlavor("github");
  }

  md2html(md: string) {
    return this.converter.makeHtml(md);
  }
}

export default class MakeHTML {
  markdown: (s: string) => string;
  pug: (s: string) => string;

  constructor(
    public langs: string[], 
    markdownExt: showdown.ShowdownExtension[] = [], hyperpugFilters: IHyperPugFilters = {}
  ) {
    const md = new Markdown(markdownExt)
    this.markdown = (s: string) => {
      return md.md2html(s);
    };
    
    this.pug = pug.compile({filters: {
      markdown: (text: string) => {
        return this.markdown(text);
      },
      ...hyperpugFilters
    }});
  }

  compile(s: string) {
    let lang = "markdown";

    if (s.startsWith("//")) {
      const lines = s.split("\n");
      let newLang = lines[0].split(" ")[1];

      if (newLang === "json") {
        newLang = "application/json";
      }

      if (this.langs.includes(newLang)) {
        lang = newLang;
      }
      s = lines.slice(1).join("\n");
    }

    let html: string;

    if (lang === "pug") {
      html = this.pug(s);
    } else if (lang === "markdown") {
      html = this.markdown(s);
    } else {
      html = h("pre", s).outerHTML;
    }

    return {html, lang};
  }
}