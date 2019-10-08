export function unUndefined(obj: any, isNull: any[] = [""]) {
  const nullSet = new Set([...(isNull || []), undefined])
  Object.keys(obj).forEach(key => nullSet.has(obj[key]) ? delete obj[key] : undefined);
  return obj;
}

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}