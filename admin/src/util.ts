export const config = CONFIG;

export const g: {
  q: string;
} = {
  q: ""
};

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  // $& means the whole matched string
}

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}