"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
exports.srsMap = [
    moment_1.default.duration(4, "hour"),
    moment_1.default.duration(8, "hour"),
    moment_1.default.duration(1, "day"),
    moment_1.default.duration(3, "day"),
    moment_1.default.duration(1, "week"),
    moment_1.default.duration(2, "week"),
    moment_1.default.duration(4, "week"),
    moment_1.default.duration(16, "week")
];
function getNextReview(srsLevel) {
    let toAdd = exports.srsMap[srsLevel];
    toAdd = toAdd === undefined ? moment_1.default.duration(10, "minute") : toAdd;
    return moment_1.default().add(toAdd).toDate();
}
exports.getNextReview = getNextReview;
function repeatReview() {
    return moment_1.default().add(10, "minute").toDate();
}
exports.repeatReview = repeatReview;
