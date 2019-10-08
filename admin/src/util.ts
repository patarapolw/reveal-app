import { IUser } from "@reveal-app/abstract-db";
import dotProp from 'dot-prop';

export const g: {
  q: string;
  user: Partial<IUser>;
} = {
  q: "",
  user: {
    web: {
      title: ""
    }
  }
};

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  // $& means the whole matched string
}

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function setTitle(s?: string): string {
  const subtitle = dotProp.get(g.user, "web.title");
  const title = `${s ? `${s} | ` : ""}${subtitle ? `${subtitle} - ` : ""}Admin panel`;

  document.getElementsByTagName("title")[0].innerText = title;

  return title;
}

setTitle();