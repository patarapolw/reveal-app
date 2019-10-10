import { srsMap, getNextReview, repeatReview } from "./quiz";
import { _getSafeId, generateSecret } from "./util";

export { generateSecret };

export interface IUser {
  _id: string;
  type?: string;
  email?: string;
  picture?: string;
  secret?: string;
  info?: {
    name?: string;
    website?: string;
  };
  web?: {
    title: string;
    banner?: string;
    codemirror?: {
      theme?: string;
    };
    disqus?: string;
    about?: string;
    hint?: string;
  }
  tag: string[];
}

export interface IPost {
  _id: string;
  title: string;
  date?: Date;
  tag: string[];
  type?: string;
  deck?: string;
  content: string;
}

export interface IMedia {
  _id: string;
  name: string;
  data: ArrayBuffer;
  tag: string[];
}

export interface ICard {
  _id: string;
  key: string;
  front: string;
  back?: string;
  tag: string[];
}

export interface IQuiz {
  user?: any;
  card: any;
  note?: string;
  srsLevel: number;
  nextReview: Date;
  tag: string[];
  stat: {
    streak: { right: number; wrong: number };
  };
}

export interface ISortOptions<T> {
  key: keyof T,
  desc: boolean
}

export type IProjection<T> = Partial<Record<keyof T, 1 | 0>>;

export interface IFindOptions<T> {
  offset: number,
  limit?: number,
  sort?: ISortOptions<T>,
  fields?: Array<keyof T> | IProjection<T>
}

export abstract class Table<T> {
  abstract async find(q: string | Record<string, any>, options: IFindOptions<T & {_id: string}>): Promise<{
    count: number;
    data: Partial<T & {_id: string}>[];
  }>;
  abstract async create(entry: T): Promise<T & {_id: string}>;
  abstract async updateById(id: string, set: Partial<Record<keyof T, any>>): Promise<any>;
  abstract async deleteById(id: string): Promise<any>;
  abstract async updateMany(q: string | Record<string, any>, set: Partial<Record<keyof T, any>>): Promise<any>;
  abstract async addTags(ids: string[], tags: string[]): Promise<any>;
  abstract async removeTags(ids: string[], tags: string[]): Promise<any>;

  async getSafeId(src: string): Promise<string> {
    const ids = (await this.find({}, {
      offset: 0,
      fields: ["_id"]
    })).data.map((el) => el._id) as string[];

    return _getSafeId(ids, src);
  }

  async findOne(q: string | Record<string, any>): Promise<T | null> {
    return (await this.find(q, {
      offset: 0,
      limit: 1
    })).data[0] as T || null;
  }

  async findById(id: string): Promise<T | null> {
    return await this.findOne({_id: id});
  }
}

export interface ITables {
  user: Table<IUser>;
  post: Table<IPost>;
  media: Table<IMedia>;
  card: Table<ICard>;
  quiz: Table<IQuiz>;
}

export default abstract class AbstractDb {
  abstract tables: ITables;
  abstract models: Record<keyof ITables, any>;

  private _user: UserDb | null = null;

  constructor(private isLocal: boolean = false) {}

  get user() {
    if (this._user) {
      return this._user;
    } else if (this.isLocal) {
      return new UserDb(this);
    }
    
    throw new Error("Not logged in");
  }

  abstract async connect(): Promise<this>;
  abstract async close(): Promise<this>;

  async signup(
    email: string,
    password: string | null = null,
    options?: Partial<IUser>
  ): Promise<IUser> {
    let user = await this.tables.user.findOne({email});

    if (!user) {
      user = await this.tables.user.create({
        email,
        ...options
      } as IUser);
    }

    this._user = new UserDb(this, user._id);

    return user;
  }

  async login(email: string, secret: string) {
    const user = await this.tables.user.findOne({email, secret});

    if (!user) {
      throw new Error("Not logged in");
    }

    this._user = new UserDb(this, user._id);
  }

  logout() {
    this._user = null;
  }

  async newSecret(): Promise<string> {
    const { userId } = this.user;
    if (!userId) {
      throw new Error("Not logged in");
    }

    const secret = await generateSecret();

    await this.tables.user.updateById(userId, {secret});

    return secret;
  }

  async getSecret(): Promise<string> {
    const { userId } = this.user;
    if (!userId) {
      throw new Error("Not logged in");
    }

    const user = await this.tables.user.findById(userId);
    const secret = user ? user.secret : null;

    if (!secret) {
      throw new Error("User not found");
    }

    return secret;
  }

  async parseSecret(secret: string) {
    const user = await this.tables.user.findOne({secret});

    if (!user) {
      throw new Error("Not logged in");
    }

    this._user = new UserDb(this, user._id);
  }
}

class UserDb {
  constructor(public db: AbstractDb, private user?: any) {}

  get userId() {
    return this.user as string || null;
  }

  async markRight(card: string | Partial<ICard>) {
    return this.updateSrsLevel(+1, card);
  }

  async markWrong(card: string | Partial<ICard>) {
    return this.updateSrsLevel(-1, card);
  }

  async updateSrsLevel(dSrsLevel: number, card: string | Partial<ICard>): Promise<string> {
    let cardId: string;

    if (typeof card === "string") {
      cardId = card;
    } else if (!card._id) {
      const {key} = card;
      if (!key) {
        throw new Error("CardId or Key not specified");
      }

      const c = await this.db.tables.card.findOne({key});
      if (c) {
        cardId = c._id;
      } else {
        cardId = (await this.db.tables.card.create({
          tag: [],
          key,
          front: key,
          ...card,
          _id: await this.db.tables.card.getSafeId(key)
        }))._id;
      }
    } else {
      cardId = card._id;
    }

    let quiz = await this.db.tables.quiz.findOne({card: cardId});

    if (!quiz) {
      const q: IQuiz = {
        user: this.user,
        card: cardId,
        srsLevel: 0,
        nextReview: new Date(),
        tag: [],
        stat: {
          streak: {
            right: 0,
            wrong: 0
          }
        }
      };

      quiz = q;
    }

    if (dSrsLevel > 0) {
      quiz.stat!.streak.right += 1;
      quiz.stat!.streak.wrong = 0;
    } else if (dSrsLevel < 0) {
      quiz.stat!.streak.wrong += 1;
      quiz.stat!.streak.right = 0;
    }

    quiz.srsLevel! += dSrsLevel;

    if (quiz.srsLevel! >= srsMap.length) {
      quiz.srsLevel = srsMap.length - 1;
    }

    if (quiz.srsLevel! < 0) {
      quiz.srsLevel = 0;
    }

    if (dSrsLevel > 0) {
      quiz.nextReview = getNextReview(quiz.srsLevel!);
    } else {
      quiz.nextReview = repeatReview();
    }

    let {_id} = quiz as any;

    if (_id) {
      await this.db.tables.quiz.updateById(_id, quiz);
    } else {
      _id = (await this.db.tables.quiz.create(quiz as IQuiz))._id;
    }

    return _id;
  };
}