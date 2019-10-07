import AbstractDb, { IPost, ITables, IMedia } from "@reveal-app/abstract-db";
import Db, { Table, primary, prop, Collection } from "liteorm";
import { generateTable } from "./util";

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
  };

  tables!: ITables;

  constructor(public filename: string) {
    super();
  }

  async connect() {
    this.db = await Db.connect(this.filename);
    this.models = {
      post: await this.db.collection(new Post()),
      media: await this.db.collection(new Media())
    };

    this.models.post.on("pre-create", (evt) => {
      evt.entry.createdAt = new Date();
      evt.entry.updatedAt = new Date();
    })

    this.models.post.on("pre-update", (evt) => {
      evt.set.updatedAt = new Date();
    });

    this.models.media.on("pre-create", (evt) => {
      evt.entry.createdAt = new Date();
      evt.entry.updatedAt = new Date();
    })

    this.models.media.on("pre-update", (evt) => {
      evt.set.updatedAt = new Date();
    });

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
      })
    }

    return this;
  }

  async close() {
    await this.db.close();
    return this;
  }
}