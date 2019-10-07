"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
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
