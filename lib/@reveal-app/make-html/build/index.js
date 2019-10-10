import showdown from "showdown";
import h from "hyperscript";
import pug from "hyperpug";
import { simpleTableExt, toExt } from "./extensions";
export class Markdown {
    constructor(ext = []) {
        this.converter = new showdown.Converter({
            parseImgDimensions: true,
            extensions: [simpleTableExt, toExt, ...ext]
        });
        this.converter.setFlavor("github");
    }
    md2html(md) {
        return this.converter.makeHtml(md);
    }
}
export default class MakeHTML {
    constructor(langs, markdownExt = [], hyperpugFilters = {}) {
        this.langs = langs;
        const md = new Markdown(markdownExt);
        this.markdown = (s) => {
            return md.md2html(s);
        };
        this.pug = pug.compile({ filters: {
                markdown: (text) => {
                    return this.markdown(text);
                },
                ...hyperpugFilters
            } });
    }
    compile(s) {
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
        let html;
        if (lang === "pug") {
            html = this.pug(s);
        }
        else if (lang === "markdown") {
            html = this.markdown(s);
        }
        else {
            html = h("pre", s).outerHTML;
        }
        return { html, lang };
    }
}
