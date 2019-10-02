export = UrlSafeString;

declare class UrlSafeString {
  constructor(options?: UrlSafeString.UrlSafeStringOptions);
  generate(...args: string[]): string;
}

declare namespace UrlSafeString {
  interface UrlSafeStringOptions {
    maxLen?: number;
    lowercaseOnly?: boolean;
    regexRemovePattern?: RegExp;
    joinString?: string;
    trimWhitespace?: boolean;
  }
}