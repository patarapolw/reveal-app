import { pre, prop, Ref, index, getModelForClass } from "@typegoose/typegoose";
import { generateTable } from "./util";
import SparkMD5 from "spark-md5";
import stringify from "fast-json-stable-stringify";
import mongoose, { Schema } from "mongoose";
import AbstractDb, { IPost, IMedia, IUser, ICard, IQuiz, generateSecret } from "@reveal-app/abstract-db";
import { IQParserOptions } from "q2filter";
import { Binary } from "bson";

type ISearchOptions<T> = Partial<IQParserOptions<T & {
  createdAt: Date;
  updatedAt: Date;
}>>;

@pre<User>("save", async function () {
  if (!this.secret) {
    this.secret = await generateSecret();
  }
})
class User implements IUser {
  @prop() _id!: string;
  @prop() type?: string;
  @prop({ unique: true }) email?: string;
  @prop() picture?: string;
  @prop() secret?: string;
  @prop() info?: {
    name?: string;
    website?: string;
  };
  @prop() web?: {
    title: string;
    banner?: string;
    codemirror?: {
      theme?: string;
    };
    disqus?: string;
    about?: string;
    hint?: string;
  }
  @prop({default: []}) tag!: string[];

  static searchOptions: ISearchOptions<any> = {
    anyOf: new Set(["type", "email", "info.name", "info.website"]),
    isString: new Set(["type", "email", "info.name", "info.website"]),
    isDate: new Set(["createdAt", "updatedAt"])
  }
}

const UserModel = getModelForClass(User, {schemaOptions: {timestamps: true}});

class Post implements IPost {
  @prop() _id!: string;
  @prop({ required: true }) title!: string;
  @prop() date?: Date;
  @prop({ default: [] }) tag!: string[];
  @prop() type?: string;  // 'reveal'
  @prop() deck?: string;
  @prop({ required: true }) content!: string;

  static searchOptions: ISearchOptions<Post> = {
    anyOf: new Set(["title", "tag"]),
    isString: new Set(["title", "tag"]),
    isDate: new Set(["date", "createdAt", "updatedAt"])
  }
}

const PostModel = getModelForClass(Post, {schemaOptions: {timestamps: true}});

class Media implements IMedia {
  @prop() _id!: string;
  @prop({ required: true }) name!: string;
  @prop({ default: [] }) tag!: string[];
  @prop({ required: true, type: Buffer }) data!: any;

  static searchOptions: ISearchOptions<Media> = {
    anyOf: new Set(["name", "tag"]),
    isString: new Set(["name", "tag"]),
    isDate: new Set(["createdAt", "updatedAt"])
  }
}

const MediaModel = getModelForClass(Media, {schemaOptions: {timestamps: true}});

@pre<Card>("save", function () {
  const { front, back, key } = this;
  if (!key) {
    this.key = SparkMD5.hash(stringify({ front, back }));
  }
})
class Card implements ICard {
  @prop() _id!: string;
  @prop({ required: true, unique: true }) key!: string;
  @prop({ required: true }) front!: string;
  @prop() back?: string;
  @prop({ default: [] }) tag!: string[];

  static searchOptions: ISearchOptions<Card> = {
    anyOf: new Set(["key", "front", "tag"]),
    isString: new Set(["key", "front", "back", "tag"]),
    isDate: new Set(["createdAt", "updatedAt"])
  }
}

const CardModel = getModelForClass(Card, {schemaOptions: {timestamps: true}});

@index({ user: 1, card: 1 }, { unique: true })
class Quiz implements IQuiz {
  @prop({ ref: User, type: String }) user!: Ref<User>;
  @prop({ ref: Card, required: true, type: String }) card!: Ref<Card>;
  @prop() note?: string;
  @prop() srsLevel!: number;
  @prop() nextReview!: Date;
  @prop({ default: [] }) tag!: string[];
  @prop() stat!: {
    streak: { right: number; wrong: number };
  };

  static searchOptions: ISearchOptions<Quiz> = {
    anyOf: new Set(["note", "tag"]),
    isString: new Set(["note", "tag"]),
    isDate: new Set(["nextReview", "createdAt", "updatedAt"])
  }
}

const QuizModel = getModelForClass(Quiz, {schemaOptions: {timestamps: true}});

export default class OnlineDb extends AbstractDb {
  public models = {
    post: PostModel,
    media: MediaModel,
    user: UserModel,
    card: CardModel,
    quiz: QuizModel
  }

  public tables = {
    post: generateTable<Post>(this.models.post),
    media: generateTable<Media>(this.models.media),
    user: generateTable<User>(this.models.user),
    card: generateTable<Card>(this.models.card),
    quiz: generateTable<Quiz>(this.models.quiz)
  }

  constructor(private mongoUri: string, isLocal: boolean = false) { 
    super(isLocal);
  }

  public async connect() {
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);
    await mongoose.connect(this.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    return this;
  }

  public async close() {
    await mongoose.disconnect();
    return this;
  }

  public async reset() {
    const userId = this.user.userId;
    if (userId) {
      await QuizModel.deleteMany({ user: userId });
    }
  }
}