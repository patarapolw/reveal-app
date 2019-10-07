import AbstractDb, { IPost, IFindByQOptions } from "@reveal-app/abstract-db";
import Db from "liteorm";
declare class Post implements IPost {
    _id: string;
    title: string;
    date?: Date;
    tag: string[];
    type?: string;
    deck?: string;
    content: string;
    updatedAt?: Date;
    createdAt?: Date;
}
export default class SqliteDb extends AbstractDb {
    filename: string;
    db: Db;
    tables: {
        post: {
            create: (entry: IPost) => Promise<IPost>;
            getSafeId: (title: string) => Promise<string>;
            findById: (_id: string) => Promise<IPost | null>;
            findByQ: (q: string, options: IFindByQOptions) => Promise<{
                data: Partial<Post>[];
                count: number;
            }>;
            updateById: (_id: string, set: any) => Promise<void>;
            deleteById: (_id: string) => Promise<void>;
            addTags: (ids: string[], tags: string[]) => Promise<void>;
            removeTags: (ids: string[], tags: string[]) => Promise<void>;
            updateMany: (cond: any, set: any) => Promise<void>;
        };
    };
    private cols;
    constructor(filename: string);
    connect(): Promise<this>;
    close(): Promise<this>;
}
export {};
//# sourceMappingURL=index.d.ts.map