import { Ref, DocumentType } from "@typegoose/typegoose";
import mongoose from "mongoose";
import AbstractDb, { IPost, IFindByQOptions } from "@reveal-app/abstract-db";
declare class User {
    email: string;
    picture?: string;
    secret: string;
}
declare class Post implements IPost {
    _id: string;
    title: string;
    date?: Date;
    tag: string[];
    type?: string;
    deck?: string;
    content: string;
    static getSafeId(title?: string): Promise<string>;
    static findByQ(q: string, options?: IFindByQOptions): Promise<{
        count: number;
        data: DocumentType<Post>[];
    }>;
}
declare class Card {
    key: string;
    front: string;
    back?: string;
    tag: string[];
}
declare class Quiz {
    user: Ref<User>;
    card: Ref<Card>;
    note?: string;
    srsLevel?: number;
    nextReview?: Date;
    tag: string[];
    stat?: {
        streak: {
            right: number;
            wrong: number;
        };
    };
}
export default class OnlineDb extends AbstractDb {
    private mongoUri;
    currentUser?: DocumentType<User>;
    tables: {
        post: {
            findByQ: typeof Post.findByQ;
            create: {
                (docs: any[], callback?: ((err: any, res: DocumentType<Post>[]) => void) | undefined): Promise<DocumentType<Post>[]>;
                (docs: any[], options?: mongoose.SaveOptions | undefined, callback?: ((err: any, res: DocumentType<Post>[]) => void) | undefined): Promise<DocumentType<Post>[]>;
                (...docs: any[]): Promise<DocumentType<Post>>;
                (...docsWithCallback: any[]): Promise<DocumentType<Post>>;
            };
            getSafeId: typeof Post.getSafeId;
            updateById: (id: string, set: any) => Promise<void>;
            deleteById: (id: string) => Promise<void>;
            findById: (id: string) => Promise<DocumentType<Post> | null>;
            updateMany: (cond: any, set: any) => Promise<void>;
            addTags: (ids: string[], tags: string[]) => Promise<void>;
            removeTags: (ids: string[], tags: string[]) => Promise<void>;
        };
        user: import("@typegoose/typegoose").ReturnModelType<typeof User, unknown>;
        card: import("@typegoose/typegoose").ReturnModelType<typeof Card, unknown>;
        quiz: import("@typegoose/typegoose").ReturnModelType<typeof Quiz, unknown>;
    };
    constructor(mongoUri: string);
    connect(): Promise<this>;
    signup(email: string, password: string, options?: {
        picture?: string;
    }): Promise<string>;
    getSecret(): Promise<string | null>;
    newSecret(): Promise<string | null>;
    parseSecret(secret: string): Promise<boolean>;
    login(email: string, secret: string): Promise<boolean>;
    logout(): Promise<boolean>;
    close(): Promise<this>;
    reset(): Promise<void>;
}
export {};
//# sourceMappingURL=index.d.ts.map