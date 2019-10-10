import { ReturnModelType } from '@typegoose/typegoose';
import { IFindOptions, IProjection, Table } from '@reveal-app/abstract-db';
import QParser, { IQParserOptions } from 'q2filter';

async function find<T>(
  model: ReturnModelType<any>,
  parserOptions: Partial<IQParserOptions<any>>,
  q: string | Record<string, any>,
  options: IFindOptions<T> = {
    offset: 0,
    limit: 10
  }
): Promise<{
  data: T[];
  count: number;
}> {
  let cond: Record<string, any>;
  let sorter: Record<string, 1 | -1>;

  if (typeof q === "string") {
    const parser = new QParser<any>(q, parserOptions);

    const fullCond = parser.getCondFull();
    const sort = fullCond.sortBy || options.sort;

    sorter = sort ? {[sort.key]: sort.desc ? -1 : 1} : {updatedAt: -1};
    cond = fullCond.cond;
  } else {
    cond = q;
    sorter = {updatedAt: -1};
  }

  const count = await model.find(cond).countDocuments();
  let chain = model.find(cond);

  if (options.fields) {
    let proj: IProjection<T> = {};
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

export function generateTable<T>(
  model: ReturnModelType<any>
): Table<T> {
  class NewTable extends Table<T> {
    async find(q: string | Record<string, any>, options: IFindOptions<T & {_id: string}>): Promise<{
      count: number;
      data: Partial<T & {_id: string}>[];
    }> {
      return await find(model, model.searchOptions, q, options);
    }

    async create(entry: T): Promise<T & {_id: string}> {
      return await model.create(entry);
    }

    async updateById(id: string, $set: Record<keyof T, any>) {
      return await model.findByIdAndUpdate(id, {$set: unUndefined($set)});
    }

    async deleteById(id: string) {
      await model.findByIdAndDelete(id);
    }

    async updateMany(q: string | Record<string, any>, $set: Record<keyof T, any>) {
      if (typeof q === "string") {
        const ids = (await this.find(q, {
          offset: 0,
          fields: ["_id"]
        })).data.map((el) => el._id) as string[];

        return await model.updateMany({_id: {$in: ids}}, {$set: unUndefined($set)});
      } else {
        return await model.updateMany(q, {$set: unUndefined($set)});
      }
    }

    async addTags(ids: string[], tags: string[]) {
      return await model.updateMany({_id: {$in: ids}}, {$addToSet: {
        tag: {$each: tags}
      }});
    }

    async removeTags(ids: string[], tags: string[]) {
      return await model.updateMany({_id: {$in: ids}}, {$pull: {
        tag: {$in: tags}
      }});
    }
  }

  return new NewTable();
}

export function unUndefined(obj: any, isNull: any[] = [""]) {
  const nullSet = new Set([...(isNull || []), undefined])
  Object.keys(obj).forEach(key => nullSet.has(obj[key]) ? delete obj[key] : undefined);
  return obj;
}