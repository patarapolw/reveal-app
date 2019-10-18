import { generateSecret } from "./util";
export { generateSecret };
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
    };
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
    data: any;
    tag: string[];
}
export interface ICard {
    _id: string;
    key: string;
    front: string;
    back?: string;
    tag: string[];
}
export interface IQuiz {
    user?: any;
    card: any;
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
}
export interface ISortOptions<T> {
    key: keyof T;
    desc: boolean;
}
export declare type IProjection<T> = Partial<Record<keyof T, 1 | 0>>;
export interface IFindOptions<T> {
    offset: number;
    limit?: number;
    sort?: ISortOptions<T>;
    fields?: Array<keyof T> | IProjection<T>;
}
export declare abstract class Table<T> {
    abstract find(q: string | Record<string, any>, options: IFindOptions<T & {
        _id: string;
    }>): Promise<{
        count: number;
        data: Partial<T & {
            _id: string;
        }>[];
    }>;
    abstract create(entry: T): Promise<T & {
        _id: string;
    }>;
    abstract updateById(id: string, set: Partial<Record<keyof T, any>>): Promise<any>;
    abstract deleteById(id: string): Promise<any>;
    abstract updateMany(q: string | Record<string, any>, set: Partial<Record<keyof T, any>>): Promise<any>;
    abstract addTags(ids: string[], tags: string[]): Promise<any>;
    abstract removeTags(ids: string[], tags: string[]): Promise<any>;
    getSafeId(src: string): Promise<string>;
    findOne(q: string | Record<string, any>): Promise<T | null>;
    findById(id: string): Promise<T | null>;
}
export interface ITables {
    user: Table<IUser>;
    post: Table<IPost>;
    media: Table<IMedia>;
    card: Table<ICard>;
    quiz: Table<IQuiz>;
}
export default abstract class AbstractDb {
    private isLocal;
    abstract tables: ITables;
    abstract models: Record<keyof ITables, any>;
    private _user;
    constructor(isLocal?: boolean);
    readonly user: UserDb;
    abstract connect(): Promise<this>;
    abstract close(): Promise<this>;
    signup(email: string, password?: string | null, options?: Partial<IUser>): Promise<IUser>;
    login(email: string, secret: string): Promise<void>;
    logout(): void;
    newSecret(): Promise<string>;
    getSecret(): Promise<string>;
    parseSecret(secret: string): Promise<void>;
}
declare class UserDb {
    db: AbstractDb;
    private user?;
    constructor(db: AbstractDb, user?: any);
    readonly userId: string | null;
    markRight(card: string | Partial<ICard>): Promise<string>;
    markWrong(card: string | Partial<ICard>): Promise<string>;
    updateSrsLevel(dSrsLevel: number, card: string | Partial<ICard>): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map