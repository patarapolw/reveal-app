import { Ref, DocumentType } from "@typegoose/typegoose";
import AbstractDb, { IPost, IFindByQOptions, IMedia } from "@reveal-app/abstract-db";
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
        data: Post[];
        count: number;
    }>;
}
declare class Media implements IMedia {
    _id: string;
    name: string;
    tag: string[];
    data: ArrayBuffer;
    static getSafeId(title?: string): Promise<string>;
    static findByQ(q: string, options?: IFindByQOptions): Promise<{
        data: Media[];
        count: number;
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
    models: {
        post: import("@typegoose/typegoose").ReturnModelType<typeof Post, unknown>;
        media: import("@typegoose/typegoose").ReturnModelType<typeof Media, unknown>;
        user: import("@typegoose/typegoose").ReturnModelType<typeof User, unknown>;
        card: import("@typegoose/typegoose").ReturnModelType<typeof Card, unknown>;
        quiz: import("@typegoose/typegoose").ReturnModelType<typeof Quiz, unknown>;
    };
    tables: {
        post: import("@reveal-app/abstract-db").ITable<Post>;
        media: import("@reveal-app/abstract-db").ITable<Media>;
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