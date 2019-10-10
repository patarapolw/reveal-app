import crypto from 'crypto';
import { ReturnModelType } from '@typegoose/typegoose';
import UrlSafeString from "url-safe-string";
import pinyin from "chinese-to-pinyin";
import uuid4 from "uuid/v4";
import { IFindByQOptions, IProjection, ITable } from '@reveal-app/abstract-db';
import QParser, { IQParserOptions } from 'q2filter';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';

const uss = new UrlSafeString({
  regexRemovePattern: /((?!([a-z0-9.])).)/gi
});

export function generateSecret(): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(48, (err, b) => {
      if (err) {
        return reject(err);
      }
      resolve(b.toString("base64"));
    });
  })
}

export async function getSafeId<T extends AnyParamConstructor<any>>(
  model: ReturnModelType<T>, 
  title?: string
): Promise<string> {
  const ids = (await model.find().select({ _id: 1 })).map((el: any) => el._id);
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

export async function findByQ<T>(
  model: ReturnModelType<any>,
  parserOptions: Partial<IQParserOptions<any>>,
  q: string,
  options: IFindByQOptions = {
    offset: 0,
    limit: 10
  }
): Promise<{
  data: T[];
  count: number;
}> {
  const parser = new QParser<any>(q, parserOptions);

  const fullCond = parser.getCondFull();
  const sort = fullCond.sortBy || options.sort;

  const sorter = sort ? {[sort.key]: sort.desc ? -1 : 1} : {updatedAt: -1};

  const count = await model.find(fullCond.cond).countDocuments();
  let chain = model.find(fullCond.cond);

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

export function generateTable<T>(model: ReturnModelType<any>): ITable<T> {
  return {
    findByQ: model.findByQ,
    create: async (entry: any) => {
      return await model.create(entry)
    },
    getSafeId: model.getSafeId,
    updateById: async (id: string, set: any) => {
      await model.findByIdAndUpdate(id, set);
    },
    deleteById: async (id: string) => {
      await model.findByIdAndDelete(id);
    },
    findById: async (id: string) => {
      return await model.findById(id);
    },
    updateMany: async (cond: any, set: any) => {
      await model.updateMany(cond, set);
    },
    addTags: async (ids: string[], tags: string[]) => {
      await model.updateMany({_id: {$in: ids}}, {$addToSet: {
        tag: {$each: tags}
      }});
    },
    removeTags: async (ids: string[], tags: string[]) => {
      await model.updateMany({_id: {$in: ids}}, {$pull: {
        tag: {$in: tags}
      }});
    }
  }
}