import AbstractDb, { IPost, ITables, IMedia, IUser } from "@reveal-app/abstract-db";
import Db, { Table, primary, prop, Collection } from "liteorm";
import { generateTable } from "./util";

@Table({name: "user"})
class User implements IUser {
  @primary() _id!: string;
  @prop({null: true}) type?: string;
  @prop({null: true, unique: true }) email?: string;
  @prop({null: true}) picture?: string;
  @prop() secret?: string;
  @prop({null: true}) info?: {
    name?: string;
    website?: string;
  };
  @prop({null: true}) web?: {
    title: string;
    banner?: string;
    codemirror?: {
      theme?: string;
    };
    disqus?: string;
    about?: string;
    hint?: string;
  }
  @prop({default: '[]'}) tag!: string[];
  @prop() updatedAt!: Date;
  @prop() createdAt!: Date;
}

@Table({name: "post"})
class Post implements IPost {
  @primary() _id!: string;
  @prop() title!: string;
  @prop({null: true}) date?: Date;
  @prop({default: '[]', null: true}) tag!: string[];
  @prop({null: true}) type?: string;
  @prop({null: true}) deck?: string;
  @prop() content!: string;
  @prop() updatedAt!: Date;
  @prop() createdAt!: Date;
}

@Table({name: "post"})
class Media implements IMedia {
  @primary() _id!: string;
  @prop({unique: true}) name!: string;
  @prop({null: true}) data!: ArrayBuffer;
  @prop({default: '[]', null: true}) tag!: string[];
  @prop() updatedAt!: Date;
  @prop() createdAt!: Date;
}

export default class SqliteDb extends AbstractDb {
  db!: Db;

  models!: {
    post: Collection<Post>;
    media: Collection<Media>;
    user: Collection<User>;
  };

  tables!: ITables;

  constructor(public filename: string) {
    super();
  }

  async connect() {
    this.db = await Db.connect(this.filename);
    this.models = {
      post: await this.db.collection(new Post()),
      media: await this.db.collection(new Media()),
      user: await this.db.collection(new User())
    };

    this.attachTimestamp(this.models.user);
    this.attachTimestamp(this.models.post);
    this.attachTimestamp(this.models.media);

    this.tables = {
      post: generateTable<Post>(this.models.post, {
        anyOf: new Set(["title", "tag"]),
        isString: new Set(["title", "tag"]),
        isDate: new Set(["createdAt", "updatedAt", "date"]),
      }),
      media: generateTable<Media>(this.models.media, {
        anyOf: new Set(["name", "tag"]),
        isString: new Set(["name", "tag"]),
        isDate: new Set(["createdAt", "updatedAt"]),
      }),
      user: generateTable<User>(this.models.user, {
        anyOf: new Set(["email", "tag", "info.name", "info.website"]),
        isString: new Set(["email", "tag", "info.name", "info.website"]),
        isDate: new Set(["createdAt", "updatedAt"]),
      })
    }

    return this;
  }

  async close() {
    await this.db.close();
    return this;
  }

  private attachTimestamp<T extends {createdAt: Date, updatedAt: Date}>(c: Collection<T>) {
    c.on("pre-create", (evt) => {
      evt.entry.createdAt = new Date();
      evt.entry.updatedAt = new Date();
    })

    c.on("pre-update", (evt) => {
      evt.set.updatedAt = new Date() as any;
    });
  }
}