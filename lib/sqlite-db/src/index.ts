import AbstractDb, { IPost, IFindByQOptions } from "@reveal-app/abstract-db";
import Db, { Table, primary, prop, Collection } from "liteorm";
import QParser from "q2filter";
import UrlSafeString from "url-safe-string";
import pinyin from "chinese-to-pinyin";
import uuid4 from "uuid/v4";

const uss = new UrlSafeString({
  regexRemovePattern: /((?!([a-z0-9.])).)/gi
});

@Table({name: "post"})
class Post implements IPost {
  @primary() _id!: string;
  @prop() title!: string;
  @prop({null: true}) date?: Date;
  @prop({default: '[]', null: true}) tag!: string[];
  @prop({null: true}) type?: string;
  @prop({null: true}) deck?: string;
  @prop() content!: string;
  @prop() updatedAt?: Date;
  @prop() createdAt?: Date;
}

export default class SqliteDb extends AbstractDb {
  db!: Db;

  tables = {
    post: {
      create: async (entry: IPost) => {
        await this.cols.post.create(entry);
        return (await this.cols.post.find({_id: entry._id}))[0] as IPost;
      },
      getSafeId: async (title: string) => {
        const ids = (await this.cols.post.find({}, ["_id"])).map((el) => el._id) as string[];
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
      },
      findById: async (_id: string) => {
        return (await this.cols.post.find({_id}))[0] as IPost | null;
      },
      findByQ: async (q: string, options: IFindByQOptions) => {
        const allData = await this.cols.post.find({});
        
        const parser = new QParser<Partial<Post>>(q, {
          anyOf: new Set(["title", "tag"]),
          isString: new Set(["title", "tag"]),
          isDate: new Set(["date"]),
          sortBy: options.sort || {
            key: "updatedAt",
            desc: true
          }
        });
    
        const allResult = parser.parse(allData);
        const count = allResult.length;

        let data = allResult.slice(options.offset, options.limit ? options.offset + options.limit : undefined);

        if (options.fields) {
          data = data.map((el) => {
            for (const k of Object.keys(el)) {
              if (Array.isArray(options.fields) && !options.fields.includes(k)) {
                delete (el as any)[k];
              }
            }

            return el;
          });
        }

        return {data, count}
      },
      updateById: async (_id: string, set: any) => {
        await this.cols.post.update({_id}, set);
      },
      deleteById: async (_id: string) => {
        await this.cols.post.delete({_id});
      },
      addTags: async (ids: string[], tags: string[]) => {
        await Promise.all((await this.cols.post.find({_id: {$in: ids}}, ["_id", "tag"])).map(async (el) => {
          try {
            const existing = el.tag || [];
            await this.cols.post.update({_id: el._id}, {
              tag: Array.from(new Set([...tags, ...existing]))
            })
          } catch(e) {}
        }))
      },
      removeTags: async (ids: string[], tags: string[]) => {
        await Promise.all((await this.cols.post.find({_id: {$in: ids}}, ["_id", "tag"])).map(async (el) => {
          try {
            const existing = el.tag || [];
            await this.cols.post.update({_id: el._id}, {
              tag: Array.from(existing.filter((t) => !tags.includes(t)))
            })
          } catch(e) {}
        }))
      },
      updateMany: async (cond: any, set: any) => {
        const {$set} = set;
        await this.cols.post.update(cond, $set);
      }
    }
  }

  private cols!: {
    post: Collection<Post>
  };

  constructor(public filename: string) {
    super();
  }

  async connect() {
    this.db = await Db.connect(this.filename);
    this.cols = {
      post: await this.db.collection(new Post())
    };

    this.cols.post.on("pre-create", (evt) => {
      evt.entry.createdAt = new Date();
      evt.entry.updatedAt = new Date();
    })

    this.cols.post.on("pre-update", (evt) => {
      evt.set.updatedAt = new Date();
    });

    return this;
  }

  async close() {
    await this.db.close();
    return this;
  }
}