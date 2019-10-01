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
    console.log(this.converter);
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
