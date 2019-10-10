"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_safe_string_1 = __importDefault(require("url-safe-string"));
const chinese_to_pinyin_1 = __importDefault(require("chinese-to-pinyin"));
const crypto_1 = __importDefault(require("crypto"));
const v4_1 = __importDefault(require("uuid/v4"));
const uss = new url_safe_string_1.default({
    regexRemovePattern: /((?!([a-z0-9.])).)/gi
});
function generateSecret() {
    return new Promise((resolve, reject) => {
        crypto_1.default.randomBytes(48, (err, b) => {
            if (err) {
                return reject(err);
            }
            resolve(b.toString("base64"));
        });
    });
}
exports.generateSecret = generateSecret;
function _getSafeId(ids, title) {
    let outputId = title ? uss.generate(chinese_to_pinyin_1.default(title, {
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
    return outputId || v4_1.default();
}
exports._getSafeId = _getSafeId;
