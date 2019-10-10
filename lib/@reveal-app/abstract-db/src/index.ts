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
  updateById(id: string, set: any): Promise<void>;
  findById(id: string): Promise<T | null>;
  deleteById(id: string): Promise<void>;
  updateMany(cond: any, op: any): Promise<void>;

  addTags(ids: string[], tags: string[]): Promise<void>;
  removeTags(ids: string[], tags: string[]): Promise<void>;

  getSafeId(src: string): Promise<string>;
}

export interface ITables {
  user: ITable<IUser>;
  post: ITable<IPost>;
  media: ITable<IMedia>;
}

export default abstract class AbstractDb {
  abstract async connect(): Promise<this>;
  abstract async close(): Promise<this>;

  abstract tables: ITables;
  abstract models: Record<string, any>;
}