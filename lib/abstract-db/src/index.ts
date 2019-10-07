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

export interface ISortOptions<T> {
  key: keyof T,
  desc: boolean
}

export interface IProjection {[k: string]: 1 | 0};

export interface IFindByQOptions {
  offset: number,
  limit?: number,
  sort?: ISortOptions<IPost>,
  fields?: string[] | IProjection
}

export interface ITable<T> {
  findByQ(q: string, options: IFindByQOptions): Promise<{
    count: number;
    data: Partial<T>[];
  }>;
  create(entry: T): Promise<T>;
  getSafeId(src: string): Promise<string>;
  updateById(id: string, set: any): Promise<void>;
  findById(id: string): Promise<T | null>;
  deleteById(id: string): Promise<void>;
  updateMany(cond: any, op: any): Promise<void>;
  addTags(ids: string[], tags: string[]): Promise<void>;
  removeTags(ids: string[], tags: string[]): Promise<void>;
}

export interface ITables {
  post: ITable<IPost>;
  media: ITable<IMedia>;
}

export default abstract class AbstractDb {
  abstract async connect(): Promise<this>;
  abstract async close(): Promise<this>;

  abstract tables: ITables;
  abstract models: Record<string, any>;
}