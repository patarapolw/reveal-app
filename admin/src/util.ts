import CodeMirror from "codemirror";
import { pugCompile, mdCompile } from '@zhsrs/make-html';

export const adminConfig = ADMIN_CONFIG;

export const g: {
  q: string;
} = {
  q: ""
};

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  // $& means the whole matched string
}