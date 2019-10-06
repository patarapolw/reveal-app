import { Ref, DocumentType } from "@typegoose/typegoose";
import { ISortOptions } from "q2filter";
interface IProjection {
    [k: string]: 1 | 0;
}
declare class User {
    email: string;
    picture?: string;
    secret: string;
}
declare class Post {
    _id: string;
    title: string;
    date?: Date;
    tag: string[];
    hidden?: boolean;
    type?: string;
    content: string;
    static getSafeId(title?: string): Promise<string>;
    static findByQ(q: string, offset?: number, limit?: number | null, sort?: ISortOptions<Post>, fields?: string[] | IProjection): Promise<{
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
export default class Database {
    private mongoUri;
    currentUser?: DocumentType<User>;
    cols: {
        user: import("@typegoose/typegoose").ReturnModelType<typeof User, unknown>;
        post: import("@typegoose/typegoose").ReturnModelType<typeof Post, unknown>;
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