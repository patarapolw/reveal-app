import { pre, prop, Ref, index, DocumentType, getModelForClass } from "@typegoose/typegoose";
import { generateSecret } from "./util";
import uuid4 from "uuid/v4";
import SparkMD5 from "spark-md5";
import stringify from "fast-json-stable-stringify";
import mongoose from "mongoose";
import UrlSafeString from "url-safe-string";
import pinyin from "chinese-to-pinyin";
import QParser from "q2filter";
import AbstractDb, { IPost, IFindByQOptions, IProjection } from "@reveal-app/abstract-db";

const uss = new UrlSafeString({
  regexRemovePattern: /((?!([a-z0-9.])).)/gi
});

@pre<User>("save", async function () {
  if (!this.secret) {
    this.secret = await generateSecret();
  }
})
class User {
  @prop({ required: true, unique: true }) email!: string;
  @prop() picture?: string;
  @prop({ required: true }) secret!: string;
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
    const ids = (await PostModel.find().select({_id: 1})).map((el) => el._id);
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

  static async findByQ(
    q: string,
    options: IFindByQOptions = {
      offset: 0,
      limit: 10
    }
  ) {
    const parser = new QParser<Post>(q, {
      anyOf: new Set(["title", "tag"]),
      isString: new Set(["title", "tag"]),
      isDate: new Set(["date"])
    });

    const fullCond = parser.getCondFull();
    const sort = fullCond.sortBy || options.sort;

    const sorter = sort ? {[sort.key]: sort.desc ? -1 : 1} : {updatedAt: -1};

    const count = await PostModel.find(fullCond.cond).countDocuments();
    let chain = PostModel.find(fullCond.cond);

    if (options.fields) {
      let proj: IProjection = {};
      if (Array.isArray(options.fields)) {
        for (const f of options.fields) {
          proj[f] = 1;
        }
      } else {
        proj = options.fields;
      }

      chain = chain.select(proj);
    }

    chain = chain.sort(sorter).skip(options.offset);

    if (options.limit) {
      chain = chain.limit(options.limit);
    }

    const data = await chain;

    return {count, data};
  }
}

const PostModel = getModelForClass(Post, {schemaOptions: {timestamps: true}});

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

  public tables = {
    post: {
      findByQ: PostModel.findByQ,
      create: PostModel.create,
      getSafeId: PostModel.getSafeId,
      updateById: async (id: string, set: any) => {
        await PostModel.findByIdAndUpdate(id, set);
      },
      deleteById: async (id: string) => {
        await PostModel.findByIdAndDelete(id);
      },
      findById: async (id: string) => {
        return await PostModel.findById(id);
      },
      updateMany: async (cond: any, set: any) => {
        await PostModel.updateMany(cond, set);
      },
      addTags: async (ids: string[], tags: string[]) => {
        await PostModel.updateMany({_id: {$in: ids}}, {$addToSet: {
          tag: {$each: tags}
        }});
      },
      removeTags: async (ids: string[], tags: string[]) => {
        await PostModel.updateMany({_id: {$in: ids}}, {$pull: {
          tag: {$in: tags}
        }});
      }
    },
    user: UserModel,
    card: CardModel,
    quiz: QuizModel
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
      return u.secret;
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
    return this.currentUser ? this.currentUser.secret : null;
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