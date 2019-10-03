export function unUndefined(obj: any) {
  Object.keys(obj).forEach(key => obj[key] === undefined && delete obj[key]);
  return obj;
}

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}