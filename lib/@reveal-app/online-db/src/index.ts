import { pre, prop, Ref, index, DocumentType, getModelForClass } from "@typegoose/typegoose";
import { generateSecret, getSafeId, findByQ, generateTable } from "./util";
import SparkMD5 from "spark-md5";
import stringify from "fast-json-stable-stringify";
import mongoose from "mongoose";
import AbstractDb, { IPost, IFindByQOptions, IMedia, IUser } from "@reveal-app/abstract-db";

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

  static async getSafeId(title?: string) {
    return await getSafeId(UserModel, title);
  }

  static async findByQ(
    q: string,
    options: IFindByQOptions = {
      offset: 0,
      limit: 10
    }
  ) {
    return await findByQ<User>(UserModel, {
      anyOf: new Set(["email", "tag", "info.name", "info.website"]),
      isString: new Set(["email", "tag", "info.name", "info.website"]),
      isDate: new Set(["createdAt", "updatedAt"])
    }, q, options);
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

  static async getSafeId(title?: string) {
    return await getSafeId(PostModel, title);
  }

  static async findByQ(
    q: string,
    options: IFindByQOptions = {
      offset: 0,
      limit: 10
    }
  ) {
    return await findByQ<Post>(PostModel, {
      anyOf: new Set(["title", "tag"]),
      isString: new Set(["title", "tag"]),
      isDate: new Set(["date", "createdAt", "updatedAt"])
    }, q, options);
  }
}

const PostModel = getModelForClass(Post, {schemaOptions: {timestamps: true}});

class Media implements IMedia {
  @prop() _id!: string;
  @prop({ required: true }) name!: string;
  @prop({ default: [] }) tag!: string[];
  @prop({ required: true }) data!: ArrayBuffer;

  static async getSafeId(title?: string) {
    return await getSafeId(MediaModel, title);
  }

  static async findByQ(
    q: string,
    options: IFindByQOptions = {
      offset: 0,
      limit: 10
    }
  ) {
    return await findByQ<Media>(MediaModel, {
      anyOf: new Set(["name", "tag"]),
      isString: new Set(["name", "tag"]),
      isDate: new Set(["createdAt", "updatedAt"])
    }, q, options);
  }
}

const MediaModel = getModelForClass(Media, {schemaOptions: {timestamps: true}});

@pre<Card>("save", function () {
  const { front, back } = this;
  this.key = SparkMD5.hash(stringify({ front, back }));
})
class Card {
  @prop({ required: true, unique: true }) key!: string;
  @prop({ required: true }) front!: string;
  @prop() back?: string;
  @prop({ default: [] }) tag!: string[];
}

const CardModel = getModelForClass(Card, {schemaOptions: {timestamps: true}});

@index({ user: 1, card: 1 }, { unique: true })
class Quiz {
  @prop({ ref: User, required: true }) user!: Ref<User>;
  @prop({ ref: Card, required: true }) card!: Ref<Card>;
  @prop() note?: string;
  @prop() srsLevel?: number;
  @prop() nextReview?: Date;
  @prop({ default: [] }) tag!: string[];
  @prop() stat?: {
    streak: { right: number; wrong: number };
  };
}

const QuizModel = getModelForClass(Quiz, {schemaOptions: {timestamps: true}});

export default class OnlineDb extends AbstractDb {
  public currentUser?: DocumentType<User>;

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
    user: generateTable<User>(this.models.user)
  }

  constructor(private mongoUri: string) { 
    super();
  }

  public async connect() {
    mongoose.set('useCreateIndex', true);
    mongoose.set('useFindAndModify', false);
    await mongoose.connect(this.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    return this;
  }

  public async signup(
    email: string,
    password: string,
    options: { picture?: string } = {}
  ): Promise<string> {
    const u = await UserModel.findOne({ email });
    if (u) {
      this.currentUser = u;
      return u.secret!;
    } else {
      const secret = await generateSecret();
      this.currentUser = await UserModel.create({
        email,
        secret,
        ...options
      });

      return secret;
    }
  }

  public async getSecret(): Promise<string | null> {
    return this.currentUser ? this.currentUser.secret! : null;
  }

  public async newSecret(): Promise<string | null> {
    if (this.currentUser) {
      const secret = await generateSecret();
      this.currentUser.secret = secret;
      await this.currentUser.save();
      return secret;
    }

    return null;
  }

  public async parseSecret(secret: string): Promise<boolean> {
    const u = await UserModel.findOne({ secret });
    if (u) {
      this.currentUser = u;
      return true;
    }

    return false;
  }

  public async login(email: string, secret: string): Promise<boolean> {
    const u = await UserModel.findOne({ email, secret });
    if (u) {
      this.currentUser = u;
      return true;
    }

    return false;
  }

  public async logout() {
    this.currentUser = undefined;
    return true;
  }

  public async close() {
    await mongoose.disconnect();
    return this;
  }

  public async reset() {
    if (this.currentUser) {
      await QuizModel.deleteMany({ user: this.currentUser });
    }
  }
}