import AbstractDb, { IPost, ITables, IMedia, IUser } from "@reveal-app/abstract-db";
import Db, { Collection } from "liteorm";
declare class User implements IUser {
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
    };
    tag: string[];
    updatedAt: Date;
    createdAt: Date;
}
declare class Post implements IPost {
    _id: string;
    title: string;
    date?: Date;
    tag: string[];
    type?: string;
    deck?: string;
    content: string;
    updatedAt: Date;
    createdAt: Date;
}
declare class Media implements IMedia {
    _id: string;
    name: string;
    data: ArrayBuffer;
    tag: string[];
    updatedAt: Date;
    createdAt: Date;
}
export default class SqliteDb extends AbstractDb {
    filename: string;
    db: Db;
    models: {
        post: Collection<Post>;
        media: Collection<Media>;
        user: Collection<User>;
    };
    tables: ITables;
    constructor(filename: string);
    connect(): Promise<this>;
    close(): Promise<this>;
    private attachTimestamp;
}
export {};
//# sourceMappingURL=index.d.ts.map