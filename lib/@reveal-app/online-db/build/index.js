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
const typegoose_1 = require("@typegoose/typegoose");
const util_1 = require("./util");
const spark_md5_1 = __importDefault(require("spark-md5"));
const fast_json_stable_stringify_1 = __importDefault(require("fast-json-stable-stringify"));
const mongoose_1 = __importDefault(require("mongoose"));
const abstract_db_1 = __importStar(require("@reveal-app/abstract-db"));
let User = class User {
};
User.searchOptions = {
    anyOf: new Set(["type", "email", "info.name", "info.website"]),
    isString: new Set(["type", "email", "info.name", "info.website"]),
    isDate: new Set(["createdAt", "updatedAt"])
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
            this.secret = await abstract_db_1.generateSecret();
        }
    })
], User);
const UserModel = typegoose_1.getModelForClass(User, { schemaOptions: { timestamps: true } });
class Post {
}
Post.searchOptions = {
    anyOf: new Set(["title", "tag"]),
    isString: new Set(["title", "tag"]),
    isDate: new Set(["date", "createdAt", "updatedAt"])
};
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
}
Media.searchOptions = {
    anyOf: new Set(["name", "tag"]),
    isString: new Set(["name", "tag"]),
    isDate: new Set(["createdAt", "updatedAt"])
};
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
    typegoose_1.prop({ required: true, type: Buffer }),
    __metadata("design:type", Object)
], Media.prototype, "data", void 0);
const MediaModel = typegoose_1.getModelForClass(Media, { schemaOptions: { timestamps: true } });
let Card = class Card {
};
Card.searchOptions = {
    anyOf: new Set(["key", "front", "tag"]),
    isString: new Set(["key", "front", "back", "tag"]),
    isDate: new Set(["createdAt", "updatedAt"])
};
__decorate([
    typegoose_1.prop(),
    __metadata("design:type", String)
], Card.prototype, "_id", void 0);
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
        const { front, back, key } = this;
        if (!key) {
            this.key = spark_md5_1.default.hash(fast_json_stable_stringify_1.default({ front, back }));
        }
    })
], Card);
const CardModel = typegoose_1.getModelForClass(Card, { schemaOptions: { timestamps: true } });
let Quiz = class Quiz {
};
Quiz.searchOptions = {
    anyOf: new Set(["note", "tag"]),
    isString: new Set(["note", "tag"]),
    isDate: new Set(["nextReview", "createdAt", "updatedAt"])
};
__decorate([
    typegoose_1.prop({ ref: User, type: String }),
    __metadata("design:type", Object)
], Quiz.prototype, "user", void 0);
__decorate([
    typegoose_1.prop({ ref: Card, required: true, type: String }),
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
    constructor(mongoUri, isLocal = false) {
        super(isLocal);
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
            user: util_1.generateTable(this.models.user),
            card: util_1.generateTable(this.models.card),
            quiz: util_1.generateTable(this.models.quiz)
        };
    }
    async connect() {
        mongoose_1.default.set('useCreateIndex', true);
        mongoose_1.default.set('useFindAndModify', false);
        await mongoose_1.default.connect(this.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        return this;
    }
    async close() {
        await mongoose_1.default.disconnect();
        return this;
    }
    async reset() {
        const userId = this.user.userId;
        if (userId) {
            await QuizModel.deleteMany({ user: userId });
        }
    }
}
exports.default = OnlineDb;
