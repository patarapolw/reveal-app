import { Ref } from "@typegoose/typegoose";
import AbstractDb, { IPost, IMedia, IUser, ICard, IQuiz } from "@reveal-app/abstract-db";
import { IQParserOptions } from "q2filter";
declare type ISearchOptions<T> = Partial<IQParserOptions<T & {
    createdAt: Date;
    updatedAt: Date;
}>>;
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
    static searchOptions: ISearchOptions<any>;
}
declare class Post implements IPost {
    _id: string;
    title: string;
    date?: Date;
    tag: string[];
    type?: string;
    deck?: string;
    content: string;
    static searchOptions: ISearchOptions<Post>;
}
declare class Media implements IMedia {
    _id: string;
    name: string;
    tag: string[];
    data: any;
    static searchOptions: ISearchOptions<Media>;
}
declare class Card implements ICard {
    _id: string;
    key: string;
    front: string;
    back?: string;
    tag: string[];
    static searchOptions: ISearchOptions<Card>;
}
declare class Quiz implements IQuiz {
    user: Ref<User>;
    card: Ref<Card>;
    note?: string;
    srsLevel: number;
    nextReview: Date;
    tag: string[];
    stat: {
        streak: {
            right: number;
            wrong: number;
        };
    };
    static searchOptions: ISearchOptions<Quiz>;
}
export default class OnlineDb extends AbstractDb {
    private mongoUri;
    models: {
        post: import("@typegoose/typegoose").ReturnModelType<typeof Post, unknown>;
        media: import("@typegoose/typegoose").ReturnModelType<typeof Media, unknown>;
        user: import("@typegoose/typegoose").ReturnModelType<typeof User, unknown>;
        card: import("@typegoose/typegoose").ReturnModelType<typeof Card, unknown>;
        quiz: import("@typegoose/typegoose").ReturnModelType<typeof Quiz, unknown>;
    };
    tables: {
        post: import("@reveal-app/abstract-db").Table<Post>;
        media: import("@reveal-app/abstract-db").Table<Media>;
        user: import("@reveal-app/abstract-db").Table<User>;
        card: import("@reveal-app/abstract-db").Table<Card>;
        quiz: import("@reveal-app/abstract-db").Table<Quiz>;
    };
    constructor(mongoUri: string, isLocal?: boolean);
    connect(): Promise<this>;
    close(): Promise<this>;
    reset(): Promise<void>;
}
export {};
//# sourceMappingURL=index.d.ts.map