import { createIndentedFilter } from "indented-filter";
import h from "hyperscript";
export const simpleTableExt = {
    type: "lang",
    filter(text) {
        const rowRegex = /(?:(?:^|\r?\n)(?:\| )?(?:(?:.* \| )+.+)*(?:.* \| )+.+(?: \|)?(?:$|\r?\n))+/m;
        text = text.replace(rowRegex, (p0) => {
            return h("table.table", p0.trim().split("\n").map((pi) => {
                pi = pi.trim().replace(/^|/, "").replace(/|$/, "");
                return h("tr", pi.split(" | ").map((x) => x.trim()).map((qi) => {
                    return h("td", qi);
                }));
            })).outerHTML;
        });
        return text;
    }
};
export const toExt = {
    type: "lang",
    filter: createIndentedFilter("^^to", (s, attrs) => {
        let { url, ...params } = attrs;
        let q = [];
        for (const [k, v] of Object.entries(params)) {
            q.push(`${k}=${encodeURIComponent(v)}`);
        }
        if (q.length > 0) {
            url = `${url}?${q.join("&")}`;
        }
        return h("router-link", { attrs: { to: url } }, s).outerHTML;
    })
};
export const srsExt = {
    type: "lang",
    filter: createIndentedFilter("^^srs", (key) => {
        return h("div", [
            h("button.button", {
                style: "color: white; background-color:green;",
                type: "button",
                attrs: { onclick: `fetchJSON('/api/quiz/right', {key: '${key}'}, 'PUT'); this.disabled = true;` }
            }, "Right"),
            h("button.button", {
                style: "color: white; background-color:red;",
                type: "button",
                attrs: { onclick: `fetchJSON('/api/quiz/wrong', {key: '${key}'}, 'PUT'); this.disabled = true;` }
            }, "Wrong")
        ]).outerHTML;
    })
};
