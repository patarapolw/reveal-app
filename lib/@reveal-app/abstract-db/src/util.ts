
import UrlSafeString from "url-safe-string";
import pinyin from "chinese-to-pinyin";
import crypto from "crypto";
import uuid4 from "uuid/v4";

const uss = new UrlSafeString({
  regexRemovePattern: /((?!([a-z0-9.])).)/gi
});

export function generateSecret(): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(48, (err, b) => {
      if (err) {
        return reject(err);
      }
      resolve(b.toString("base64"));
    });
  })
}

export function _getSafeId(
  ids: string[], 
  title?: string
): string {
  let outputId = title ? uss.generate(pinyin(title, {
    keepRest: true, toneToNumber: true
  })) : "";

  while (ids.includes(outputId)) {
    const m = /-(\d+)$/.exec(outputId);
    let i = 1;

    if (m) {
      i = parseInt(m[1]) + 1;
    }

    outputId = `${outputId.replace(/-(\d+)$/, "")}-${i}`;
  }

  return outputId || uuid4();
}