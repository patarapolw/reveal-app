import "./reveal.scss";
import "./global.scss";
import "./global";
import matter from "gray-matter";
import MakeHTML from "@reveal-app/make-html";
import h from "hyperscript";
import { speak } from "./util";
import hljs from "highlight.js";

const revealCDN = "https://cdn.jsdelivr.net/npm/reveal.js@3.8.0/";
let makeHTML: MakeHTML;

declare global {
  interface Window {
    Reveal: RevealStatic;
    reveal: RevealMaker;
    revealCDN: string;
  }
}

window.revealCDN = revealCDN;

try {
  const { slideExt, speakExt } = require("@zhsrs/custom-markdown");
  makeHTML = new MakeHTML(
    ["yaml", "markdown", "json", "application/json"],
    [slideExt, speakExt]
  );
} catch(e) {
  makeHTML = new MakeHTML(
    ["yaml", "markdown", "json", "application/json"]
  );
}

(async () => {
  const _id = new URL(location.href).searchParams.get("id");
  if (_id) {
    let {content} = await (await fetch(`/api/post/${_id}`, {
      method: "POST"
    })).json();

    window.reveal.update(content);
    window.reveal.refresh();
  }
})().catch(console.error);

document.addEventListener("click", (evt) => {
  const {target} = evt;
  if (target instanceof HTMLElement && target.classList.contains("v-speak")) {
    const p = target;
    const lang = p.getAttribute("lang");
    const s = p.getAttribute("s") || p.innerText;

    if (s) {
      speak(s, lang || "zh-CN");
    }
  }
});

let mainDiv: HTMLDivElement;

window.addEventListener("load", async () => {
  mainDiv = document.getElementById("slides") as HTMLDivElement;
  const Reveal = window.Reveal;

  Reveal.initialize();

  Reveal.once = (type, listener, useCapture) => {
    const removeOnDone = () => {
      listener(undefined);
      Reveal.removeEventListener(type, removeOnDone, useCapture);
    }
  
    if (Reveal.isReady()) {
      Reveal.addEventListener(type, removeOnDone, useCapture);
    } else {
      setTimeout(() => {
        Reveal.once(type, listener, useCapture);
      }, 100);
    }
  }
  
  Reveal.onReady = (listener) => {
    if (Reveal.isReady()) {
      listener();
    } else {
      Reveal.once("ready", listener);
    }
  }

  Reveal.once("ready", () => {
    window.reveal.reveal = window.Reveal;
    window.reveal.queue.forEach((it) => it());
    window.reveal.queue = [];
    Reveal.slide(-1, -1, -1);
    Reveal.sync();
  });
});

function renderDOM(text: string) {
  let lang = "markdown";
  const m = /(?:^|\r?\n)```(\S+)\r?\n(.+)```(?:\r?\n|$)/ms.exec(text);
  if (m) {
    lang = m[1];
    text = m[2];
  }

  let html = text;

  switch(lang) {
    case "markdown": html = makeHTML.markdown(text); break;
    case "html": html = text; break;
    case "pug": html = makeHTML.pug(text); break;
    default:
      const pre = document.createElement("pre");
      pre.innerText = text;
      html = pre.outerHTML;
  }

  return html;
}

export class RevealMaker {
  raw: string[][] = [[]];
  headers: any = {};
  queue: Array<() => void> = [];
  reveal = window.Reveal;
  events: Record<string, (evt: any) => void> = {};

  constructor(
    public markdown: string,
    public rSource: {css: string[], js: (string | {async?: boolean, src: string})[]} = {css: [], js: []}
  ) {
    const {data, content} = matter(markdown);
    this.headers = data;
    this.raw = content.split(/^(?:---|===)$/gm).map((el) => {
      return el.split(/^--$/gm);
    });

    this.onReady(() => {
      window.Reveal.configure(data);

      mainDiv.innerHTML = "";
      this.raw.map((el, i) => {
        mainDiv.appendChild(h("section", el.map((ss, j) => {
          return h("section", [
            h(".container", {innerHTML: renderDOM(ss)})
          ]);
        })));
      });

      mainDiv.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightBlock(block);
      });
    });

    window.reveal = this;

    setTitle(this.headers.title);
  }

  update(markdown: string) {
    this.markdown = markdown;
    const {data, content} = matter(markdown);

    this.headers = data;
    this.onReady(() => {
      window.Reveal.configure(data);

      const newRaw = content.split(/^(?:---|===)$/gm).map((el, x) => {
        return el.split(/^--$/gm).map((ss, y) => {
          if (!this.raw[x] || this.raw[x][y] !== ss) {
            let container = h(".container", {innerHTML: renderDOM(ss)});
            const subSection = this.reveal.getSlide(x, y);
  
            if (subSection) {
              const oldContainers = subSection.getElementsByClassName("container");
              if (oldContainers) {
                oldContainers[0].replaceWith(container);
              } else {
                subSection.appendChild(container);
              }
            } else {
              const section = this.reveal.getSlide(x);
              if (section) {
                section.appendChild(h("section", [
                  container
                ]));
              } else {
                mainDiv.appendChild(h("section", [
                  h("section", [
                    container
                  ])
                ]));
              }
            }
  
            container.querySelectorAll("pre code").forEach((block) => {
              hljs.highlightBlock(block);
            });
          }

          return ss;
        });
      });

      this.raw.map((el, x) => {
        el.map((ss, j) => {
          const y = el.length - j - 1;

          if (!newRaw[x] || newRaw[x][y] === undefined) {
            const subSection = this.reveal.getSlide(x, y);
            if (subSection) {
              subSection.remove();
            }
          }
        });

        if (!newRaw[x]) {
          const section = this.reveal.getSlide(x);
          if (section) {
            section.remove();
          }
        }
      });

      this.raw = newRaw;
    });

    setTitle(this.headers.title);
  }

  onReady(fn: () => void) {
    if (this.reveal && this.reveal.isReady()) {
      fn();
      this.updateOnChange();
    } else {
      this.queue.push(() => {
        fn();
      })
    }
  }

  private updateOnChange() {
    const event = "onslidechanged";
    const cb = (evt: any) => {
      const {indexh, indexv} = evt;
      this.refresh();
      this.reveal.slide(indexh, indexv);
      delete this.events[event];
      this.reveal.removeEventListener(event, cb);
    }

    if (!this.events[event]) {
      this.reveal.addEventListener(event, cb);
    }

    this.events[event] = cb;
  }

  goto(x: number, y: number) {
    this.reveal.slide(x, y);
  }

  refresh() {
    this.reveal.slide(-1, -1, -1);
    this.reveal.sync();
  }
}

(window as any).RevealMaker = RevealMaker;
const reveal = new RevealMaker("");
window.reveal = reveal;

function setTitle(s?: string) {
  let title = document.getElementsByTagName("title")[0];
  if (!title) {
    title = document.createElement("title");
    document.head.appendChild(title);
  }

  title.innerText = s || "";
}

function loadReveal() {
  reveal.rSource.css.push(
    "css/reveal.css",
    `css/theme/${reveal.headers.theme || "white"}.css`
  );
  reveal.rSource.js.push(
    {async: false, src: "js/reveal.js"}
  );

  for (const href of reveal.rSource.css) {
    document.body.appendChild(Object.assign(document.createElement("link"), {
      href: window.revealCDN + href,
      rel: "stylesheet",
      type: "text/css"
    }));
  }

  for (let js of reveal.rSource.js) {
    if (typeof js === "string") {
      js = {async: true, src: js}
    }

    const {async, src} = js;
    document.body.appendChild(Object.assign(document.createElement("script"), {
      async,
      type: "text/javascript",
      src: window.revealCDN + src
    }));
  }
}

loadReveal();