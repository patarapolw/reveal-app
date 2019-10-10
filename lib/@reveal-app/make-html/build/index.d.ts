import showdown from "showdown";
import { IHyperPugFilters } from "hyperpug";
export declare class Markdown {
    private converter;
    constructor(ext?: showdown.ShowdownExtension[]);
    md2html(md: string): string;
}
export default class MakeHTML {
    langs: string[];
    markdown: (s: string) => string;
    pug: (s: string) => string;
    constructor(langs: string[], markdownExt?: showdown.ShowdownExtension[], hyperpugFilters?: IHyperPugFilters);
    compile(s: string): {
        html: string;
        lang: string;
    };
}
//# sourceMappingURL=index.d.ts.map