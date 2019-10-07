import UrlSafeString from "url-safe-string";
import pinyin from "chinese-to-pinyin";
import uuid4 from "uuid/v4";
import { IFindByQOptions, ITable } from '@reveal-app/abstract-db';
import QParser, { IQParserOptions } from 'q2filter';
import { Collection } from "liteorm";

const uss = new UrlSafeString({
  regexRemovePattern: /((?!([a-z0-9.])).)/gi
});

export async function getSafeId<T extends {_id: string}>(
  model: Collection<T>, 
  title?: string
): Promise<string> {
  const ids = (await model.find({}, ["_id"])).map((el: any) => el._id);
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

export async function findByQ<T extends {updatedAt: Date}>(
  model: Collection<T>,
  parserOptions: Partial<IQParserOptions<T>>,
  q: string,
  options: IFindByQOptions = {
    offset: 0,
    limit: 10
  }
) {
  const allData = await model.find({});
  // @ts-ignore
  const parser = new QParser<T>(q, {
    ...parserOptions,
    sortBy: options.sort || {
      key: "updatedAt",
      desc: true
    }
  });

  const allResult = parser.parse(allData);
  const count = allResult.length;

  let data = allResult.slice(options.offset, options.limit ? options.offset + options.limit : undefined);

  if (options.fields) {
    data = data.map((el: T) => {
      for (const k of Object.keys(el)) {
        if (Array.isArray(options.fields) && !options.fields.includes(k)) {
          delete (el as any)[k];
        }
      }

      return el;
    });
  }

  return {data, count}
}

export function generateTable<T extends {_id: string, updatedAt: Date, tag: string[]}>(
  model: Collection<T>,
  qParserOptions: Partial<IQParserOptions<T>>
): ITable<T> {
  return {
    create: async (entry: T) => {
      await model.create(entry);
      return (await model.find({_id: entry._id} as any))[0] as T;
    },
    getSafeId: async (title: string) => {
      const ids = (await model.find({}, ["_id"])).map((el) => el._id) as string[];
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
      return (await model.find({_id} as any))[0] as T | null;
    },
    findByQ: async (q: string, options: IFindByQOptions) => {
      return await findByQ(model, qParserOptions, q, options);
    },
    updateById: async (_id: string, set: any) => {
      await model.update({_id} as any, set);
    },
    deleteById: async (_id: string) => {
      await model.delete({_id} as any);
    },
    addTags: async (ids: string[], tags: string[]) => {
      await Promise.all((await model.find({_id: {$in: ids}} as any, ["_id", "tag"])).map(async (el) => {
        try {
          const existing = el.tag || [];
          await model.update({_id: el._id} as any, {
            tag: Array.from(new Set([...tags, ...existing]))
          } as any);
        } catch(e) {}
      }))
    },
    removeTags: async (ids: string[], tags: string[]) => {
      await Promise.all((await model.find({_id: {$in: ids}} as any, ["_id", "tag"])).map(async (el) => {
        try {
          const existing = el.tag || [];
          await model.update({_id: el._id} as any, {
            tag: Array.from(existing.filter((t: any) => !tags.includes(t)))
          } as any);
        } catch(e) {}
      }))
    },
    updateMany: async (cond: any, set: any) => {
      const {$set} = set;
      await model.update(cond, $set);
    }
  }
}