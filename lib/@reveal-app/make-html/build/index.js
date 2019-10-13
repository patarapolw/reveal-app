import showdown from "showdown";
import h from "hyperscript";
import pug from "hyperpug";
import { simpleTableExt, toExt, srsExt } from "./extensions";
export class Markdown {
    constructor(ext = []) {
        this.converter = new showdown.Converter({
            parseImgDimensions: true,
            extensions: [simpleTableExt, toExt, srsExt, ...ext]
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
        let newLang = "";
        if (s.startsWith("//")) {
            const lines = s.split("\n");
            newLang = lines[0].split(" ")[1];
            s = lines.slice(1).join("\n");
        }
        else if (s.startsWith("```") && s.endsWith("```")) {
            const lines = s.split("\n");
            newLang = lines[0].substr(3);
            s = lines.slice(1, lines.length - 1).join("\n");
        }
        if (newLang === "json") {
            newLang = "application/json";
        }
        let lang = "markdown";
        if (this.langs.includes(newLang)) {
            lang = newLang;
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
