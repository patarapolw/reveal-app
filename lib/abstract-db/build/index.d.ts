export interface IPost {
    _id: string;
    title: string;
    date?: Date;
    tag: string[];
    type?: string;
    deck?: string;
    content: string;
}
export interface ISortOptions<T> {
    key: keyof T;
    desc: boolean;
}
export interface IProjection {
    [k: string]: 1 | 0;
}
export interface IFindByQOptions {
    offset: number;
    limit?: number;
    sort?: ISortOptions<IPost>;
    fields?: string[] | IProjection;
}
export default abstract class AbstractDb {
    abstract connect(): Promise<this>;
    abstract close(): Promise<this>;
    abstract tables: {
        post: {
            findByQ(q: string, options: IFindByQOptions): Promise<{
                count: number;
                data: IPost[];
            }>;
            create(entry: IPost): Promise<IPost>;
            getSafeId(src: string): Promise<string>;
            updateById(id: string, set: any): Promise<void>;
            findById(id: string): Promise<IPost | null>;
            deleteById(id: string): Promise<void>;
            updateMany(cond: any, op: any): Promise<void>;
            addTags(ids: string[], tags: string[]): Promise<void>;
            removeTags(ids: string[], tags: string[]): Promise<void>;
        };
    };
}
//# sourceMappingURL=index.d.ts.map