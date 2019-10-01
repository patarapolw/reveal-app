import { pre, prop, Typegoose, Ref, index, InstanceType } from "@hasezoey/typegoose";
import { generateSecret } from "./util";
import uuid4 from "uuid/v4";
import SparkMD5 from "spark-md5";
import stringify from "fast-json-stable-stringify";
import mongoose from "mongoose";

@pre<User>("save", async function () {
  if (!this.secret) {
    this.secret = await generateSecret();
  }
})
class User extends Typegoose {
  @prop({ required: true, unique: true }) email!: string;
  @prop() picture?: string;
  @prop({ required: true }) secret!: string;
}

const UserModel = new User().getModelForClass(User);

class Post extends Typegoose {
  @prop({ default: uuid4() }) _id!: string;
  @prop({ required: true, unique: true }) title!: string;
  @prop() date?: Date;
  @prop({ default: [] }) tag!: string[];
  @prop({ required: true }) content!: string;
}

const PostModel = new Post().getModelForClass(Post);

@pre<Card>("save", function () {
  const { front, back } = this;
  this.key = SparkMD5.hash(stringify({ front, back }));
})
class Card extends Typegoose {
  @prop({ required: true, unique: true }) key!: string;
  @prop({ required: true }) front!: string;
  @prop() back?: string;
  @prop({ default: [] }) tag!: string[];
}

const CardModel = new Card().getModelForClass(Card);

@index({ user: 1, card: 1 }, { unique: true })
class Quiz extends Typegoose {
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

const QuizModel = new Quiz().getModelForClass(Quiz);

export default class Database {
  public currentUser?: InstanceType<User>;

  public cols = {
    user: UserModel,
    post: PostModel,
    card: CardModel,
    quiz: QuizModel
  };

  constructor(private mongoUri: string) { }

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