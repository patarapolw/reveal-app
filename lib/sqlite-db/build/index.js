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
const util_1 = require("./util");
let User = class User {
};
__decorate([
    liteorm_1.primary(),
    __metadata("design:type", String)
], User.prototype, "_id", void 0);
__decorate([
    liteorm_1.prop({ null: true }),
    __metadata("design:type", String)
], User.prototype, "type", void 0);
__decorate([
    liteorm_1.prop({ null: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    liteorm_1.prop({ null: true }),
    __metadata("design:type", String)
], User.prototype, "picture", void 0);
__decorate([
    liteorm_1.prop(),
    __metadata("design:type", String)
], User.prototype, "secret", void 0);
__decorate([
    liteorm_1.prop({ null: true }),
    __metadata("design:type", Object)
], User.prototype, "info", void 0);
__decorate([
    liteorm_1.prop({ null: true }),
    __metadata("design:type", Object)
], User.prototype, "web", void 0);
__decorate([
    liteorm_1.prop({ default: '[]' }),
    __metadata("design:type", Array)
], User.prototype, "tag", void 0);
__decorate([
    liteorm_1.prop(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    liteorm_1.prop(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
User = __decorate([
    liteorm_1.Table({ name: "user" })
], User);
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
let Media = class Media {
};
__decorate([
    liteorm_1.primary(),
    __metadata("design:type", String)
], Media.prototype, "_id", void 0);
__decorate([
    liteorm_1.prop({ unique: true }),
    __metadata("design:type", String)
], Media.prototype, "name", void 0);
__decorate([
    liteorm_1.prop({ null: true }),
    __metadata("design:type", ArrayBuffer)
], Media.prototype, "data", void 0);
__decorate([
    liteorm_1.prop({ default: '[]', null: true }),
    __metadata("design:type", Array)
], Media.prototype, "tag", void 0);
__decorate([
    liteorm_1.prop(),
    __metadata("design:type", Date)
], Media.prototype, "updatedAt", void 0);
__decorate([
    liteorm_1.prop(),
    __metadata("design:type", Date)
], Media.prototype, "createdAt", void 0);
Media = __decorate([
    liteorm_1.Table({ name: "post" })
], Media);
class SqliteDb extends abstract_db_1.default {
    constructor(filename) {
        super();
        this.filename = filename;
    }
    async connect() {
        this.db = await liteorm_1.default.connect(this.filename);
        this.models = {
            post: await this.db.collection(new Post()),
            media: await this.db.collection(new Media()),
            user: await this.db.collection(new User())
        };
        this.attachTimestamp(this.models.user);
        this.attachTimestamp(this.models.post);
        this.attachTimestamp(this.models.media);
        this.tables = {
            post: util_1.generateTable(this.models.post, {
                anyOf: new Set(["title", "tag"]),
                isString: new Set(["title", "tag"]),
                isDate: new Set(["createdAt", "updatedAt", "date"]),
            }),
            media: util_1.generateTable(this.models.media, {
                anyOf: new Set(["name", "tag"]),
                isString: new Set(["name", "tag"]),
                isDate: new Set(["createdAt", "updatedAt"]),
            }),
            user: util_1.generateTable(this.models.user, {
                anyOf: new Set(["email", "tag", "info.name", "info.website"]),
                isString: new Set(["email", "tag", "info.name", "info.website"]),
                isDate: new Set(["createdAt", "updatedAt"]),
            })
        };
        return this;
    }
    async close() {
        await this.db.close();
        return this;
    }
    attachTimestamp(c) {
        c.on("pre-create", (evt) => {
            evt.entry.createdAt = new Date();
            evt.entry.updatedAt = new Date();
        });
        c.on("pre-update", (evt) => {
            evt.set.updatedAt = new Date();
        });
    }
}
exports.default = SqliteDb;
