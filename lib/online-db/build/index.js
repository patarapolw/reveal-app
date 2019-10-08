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
Object.defineProperty(exports, "__esModule", { value: true });
const typegoose_1 = require("@typegoose/typegoose");
const util_1 = require("./util");
const spark_md5_1 = __importDefault(require("spark-md5"));
const fast_json_stable_stringify_1 = __importDefault(require("fast-json-stable-stringify"));
const mongoose_1 = __importDefault(require("mongoose"));
const abstract_db_1 = __importDefault(require("@reveal-app/abstract-db"));
let User = class User {
    static async getSafeId(title) {
        return await util_1.getSafeId(UserModel, title);
    }
    static async findByQ(q, options = {
        offset: 0,
        limit: 10
    }) {
        return await util_1.findByQ(UserModel, {
            anyOf: new Set(["email", "tag", "info.name", "info.website"]),
            isString: new Set(["email", "tag", "info.name", "info.website"]),
            isDate: new Set(["createdAt", "updatedAt"])
        }, q, options);
    }
};
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "_id", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "type", void 0);
__decorate([
    typegoose_1.prop({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "picture", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], User.prototype, "secret", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Object)
], User.prototype, "info", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Object)
], User.prototype, "web", void 0);
__decorate([
    typegoose_1.prop({ default: [] }),
    __metadata("design:type", Array)
], User.prototype, "tag", void 0);
User = __decorate([
    typegoose_1.pre("save", async function () {
        if (!this.secret) {
            this.secret = await util_1.generateSecret();
        }
    })
], User);
const UserModel = typegoose_1.getModelForClass(User, { schemaOptions: { timestamps: true } });
class Post {
    static async getSafeId(title) {
        return await util_1.getSafeId(PostModel, title);
    }
    static async findByQ(q, options = {
        offset: 0,
        limit: 10
    }) {
        return await util_1.findByQ(PostModel, {
            anyOf: new Set(["title", "tag"]),
            isString: new Set(["title", "tag"]),
            isDate: new Set(["date", "createdAt", "updatedAt"])
        }, q, options);
    }
}
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], Post.prototype, "_id", void 0);
__decorate([
    typegoose_1.prop({ required: true }),
    __metadata("design:type", String)
], Post.prototype, "title", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Date)
], Post.prototype, "date", void 0);
__decorate([
    typegoose_1.prop({ default: [] }),
    __metadata("design:type", Array)
], Post.prototype, "tag", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], Post.prototype, "type", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], Post.prototype, "deck", void 0);
__decorate([
    typegoose_1.prop({ required: true }),
    __metadata("design:type", String)
], Post.prototype, "content", void 0);
const PostModel = typegoose_1.getModelForClass(Post, { schemaOptions: { timestamps: true } });
class Media {
    static async getSafeId(title) {
        return await util_1.getSafeId(MediaModel, title);
    }
    static async findByQ(q, options = {
        offset: 0,
        limit: 10
    }) {
        return await util_1.findByQ(MediaModel, {
            anyOf: new Set(["name", "tag"]),
            isString: new Set(["name", "tag"]),
            isDate: new Set(["createdAt", "updatedAt"])
        }, q, options);
    }
}
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], Media.prototype, "_id", void 0);
__decorate([
    typegoose_1.prop({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "name", void 0);
__decorate([
    typegoose_1.prop({ default: [] }),
    __metadata("design:type", Array)
], Media.prototype, "tag", void 0);
__decorate([
    typegoose_1.prop({ required: true }),
    __metadata("design:type", ArrayBuffer)
], Media.prototype, "data", void 0);
const MediaModel = typegoose_1.getModelForClass(Media, { schemaOptions: { timestamps: true } });
let Card = class Card {
};
__decorate([
    typegoose_1.prop({ required: true, unique: true }),
    __metadata("design:type", String)
], Card.prototype, "key", void 0);
__decorate([
    typegoose_1.prop({ required: true }),
    __metadata("design:type", String)
], Card.prototype, "front", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], Card.prototype, "back", void 0);
__decorate([
    typegoose_1.prop({ default: [] }),
    __metadata("design:type", Array)
], Card.prototype, "tag", void 0);
Card = __decorate([
    typegoose_1.pre("save", function () {
        const { front, back } = this;
        this.key = spark_md5_1.default.hash(fast_json_stable_stringify_1.default({ front, back }));
    })
], Card);
const CardModel = typegoose_1.getModelForClass(Card, { schemaOptions: { timestamps: true } });
let Quiz = class Quiz {
};
__decorate([
    typegoose_1.prop({ ref: User, required: true }),
    __metadata("design:type", Object)
], Quiz.prototype, "user", void 0);
__decorate([
    typegoose_1.prop({ ref: Card, required: true }),
    __metadata("design:type", Object)
], Quiz.prototype, "card", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], Quiz.prototype, "note", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Number)
], Quiz.prototype, "srsLevel", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Date)
], Quiz.prototype, "nextReview", void 0);
__decorate([
    typegoose_1.prop({ default: [] }),
    __metadata("design:type", Array)
], Quiz.prototype, "tag", void 0);
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", Object)
], Quiz.prototype, "stat", void 0);
Quiz = __decorate([
    typegoose_1.index({ user: 1, card: 1 }, { unique: true })
], Quiz);
const QuizModel = typegoose_1.getModelForClass(Quiz, { schemaOptions: { timestamps: true } });
class OnlineDb extends abstract_db_1.default {
    constructor(mongoUri) {
        super();
        this.mongoUri = mongoUri;
        this.models = {
            post: PostModel,
            media: MediaModel,
            user: UserModel,
            card: CardModel,
            quiz: QuizModel
        };
        this.tables = {
            post: util_1.generateTable(this.models.post),
            media: util_1.generateTable(this.models.media),
            user: util_1.generateTable(this.models.user)
        };
    }
    async connect() {
        mongoose_1.default.set('useCreateIndex', true);
        mongoose_1.default.set('useFindAndModify', false);
        await mongoose_1.default.connect(this.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        return this;
    }
    async signup(email, password, options = {}) {
        const u = await UserModel.findOne({ email });
        if (u) {
            this.currentUser = u;
            return u.secret;
        }
        else {
            const secret = await util_1.generateSecret();
            this.currentUser = await UserModel.create({
                email,
                secret,
                ...options
            });
            return secret;
        }
    }
    async getSecret() {
        return this.currentUser ? this.currentUser.secret : null;
    }
    async newSecret() {
        if (this.currentUser) {
            const secret = await util_1.generateSecret();
            this.currentUser.secret = secret;
            await this.currentUser.save();
            return secret;
        }
        return null;
    }
    async parseSecret(secret) {
        const u = await UserModel.findOne({ secret });
        if (u) {
            this.currentUser = u;
            return true;
        }
        return false;
    }
    async login(email, secret) {
        const u = await UserModel.findOne({ email, secret });
        if (u) {
            this.currentUser = u;
            return true;
        }
        return false;
    }
    async logout() {
        this.currentUser = undefined;
        return true;
    }
    async close() {
        await mongoose_1.default.disconnect();
        return this;
    }
    async reset() {
        if (this.currentUser) {
            await QuizModel.deleteMany({ user: this.currentUser });
        }
    }
}
exports.default = OnlineDb;
