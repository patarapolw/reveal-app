"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_db_1 = __importDefault(require("@reveal-app/abstract-db"));
const liteorm_1 = __importStar(require("liteorm"));
const q2filter_1 = __importDefault(require("q2filter"));
const url_safe_string_1 = __importDefault(require("url-safe-string"));
const chinese_to_pinyin_1 = __importDefault(require("chinese-to-pinyin"));
const v4_1 = __importDefault(require("uuid/v4"));
const uss = new url_safe_string_1.default({
    regexRemovePattern: /((?!([a-z0-9.])).)/gi
});
let Post = class Post {
};
__decorate([
    liteorm_1.primary(),
    __metadata("design:type", String)
], Post.prototype, "_id", void 0);
__decorate([
    liteorm_1.prop(),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    liteorm_1.prop({ null: true }),
    __metadata("design:type", Date)
], Post.prototype, "date", void 0);
__decorate([
    liteorm_1.prop({ default: '[]', null: true }),
    __metadata("design:type", Array)
], Post.prototype, "tag", void 0);
__decorate([
    liteorm_1.prop({ null: true }),
    __metadata("design:type", String)
], Post.prototype, "type", void 0);
__decorate([
    liteorm_1.prop({ null: true }),
    __metadata("design:type", String)
], Post.prototype, "deck", void 0);
__decorate([
    liteorm_1.prop(),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
__decorate([
    liteorm_1.prop(),
    __metadata("design:type", Date)
], Post.prototype, "updatedAt", void 0);
__decorate([
    liteorm_1.prop(),
    __metadata("design:type", Date)
], Post.prototype, "createdAt", void 0);
Post = __decorate([
    liteorm_1.Table({ name: "post" })
], Post);
class SqliteDb extends abstract_db_1.default {
    constructor(filename) {
        super();
        this.filename = filename;
        this.tables = {
            post: {
                create: async (entry) => {
                    await this.cols.post.create(entry);
                    return (await this.cols.post.find({ _id: entry._id }))[0];
                },
                getSafeId: async (title) => {
                    const ids = (await this.cols.post.find({}, ["_id"])).map((el) => el._id);
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
                },
                findById: async (_id) => {
                    return (await this.cols.post.find({ _id }))[0];
                },
                findByQ: async (q, options) => {
                    const allData = await this.cols.post.find({});
                    const parser = new q2filter_1.default(q, {
                        anyOf: new Set(["title", "tag"]),
                        isString: new Set(["title", "tag"]),
                        isDate: new Set(["date"]),
                        sortBy: options.sort || {
                            key: "updatedAt",
                            desc: true
                        }
                    });
                    const allResult = parser.parse(allData);
                    const count = allResult.length;
                    let data = allResult.slice(options.offset, options.limit ? options.offset + options.limit : undefined);
                    if (options.fields) {
                        data = data.map((el) => {
                            for (const k of Object.keys(el)) {
                                if (Array.isArray(options.fields) && !options.fields.includes(k)) {
                                    delete el[k];
                                }
                            }
                            return el;
                        });
                    }
                    return { data, count };
                },
                updateById: async (_id, set) => {
                    await this.cols.post.update({ _id }, set);
                },
                deleteById: async (_id) => {
                    await this.cols.post.delete({ _id });
                },
                addTags: async (ids, tags) => {
                    await Promise.all((await this.cols.post.find({ _id: { $in: ids } }, ["_id", "tag"])).map(async (el) => {
                        try {
                            const existing = el.tag || [];
                            await this.cols.post.update({ _id: el._id }, {
                                tag: Array.from(new Set([...tags, ...existing]))
                            });
                        }
                        catch (e) { }
                    }));
                },
                removeTags: async (ids, tags) => {
                    await Promise.all((await this.cols.post.find({ _id: { $in: ids } }, ["_id", "tag"])).map(async (el) => {
                        try {
                            const existing = el.tag || [];
                            await this.cols.post.update({ _id: el._id }, {
                                tag: Array.from(existing.filter((t) => !tags.includes(t)))
                            });
                        }
                        catch (e) { }
                    }));
                },
                updateMany: async (cond, set) => {
                    const { $set } = set;
                    await this.cols.post.update(cond, $set);
                }
            }
        };
    }
    async connect() {
        this.db = await liteorm_1.default.connect(this.filename);
        this.cols = {
            post: await this.db.collection(new Post())
        };
        this.cols.post.on("pre-create", (evt) => {
            evt.entry.createdAt = new Date();
            evt.entry.updatedAt = new Date();
        });
        this.cols.post.on("pre-update", (evt) => {
            evt.set.updatedAt = new Date();
        });
        return this;
    }
    async close() {
        await this.db.close();
        return this;
    }
}
exports.default = SqliteDb;
