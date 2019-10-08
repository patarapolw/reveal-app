import { IUser } from "@reveal-app/abstract-db";
import dotProp from 'dot-prop';

export const g: {
  q: string;
  user?: Partial<IUser>
} = {
  q: ""
};

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  // $& means the whole matched string
}

export function normalizeArray(it: any): any {
  if (Array.isArray(it)) {
    return it[0];
  }

  return it;
}

export function speak(s: string, lang: string = "zh-CN", rate: number = 0.8) {
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

export function setTitle(s?: string): string {
  const subtitle = dotProp.get(g.user!, "web.title");
  const title = `${s ? `${s} | ` : ""}${subtitle ? `${subtitle} - ` : ""}`;

  document.getElementsByTagName("title")[0].innerText = title;

  return title;
}