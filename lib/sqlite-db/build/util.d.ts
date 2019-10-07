import { IFindByQOptions, ITable } from '@reveal-app/abstract-db';
import { IQParserOptions } from 'q2filter';
import { Collection } from "liteorm";
export declare function getSafeId<T extends {
    _id: string;
}>(model: Collection<T>, title?: string): Promise<string>;
export declare function findByQ<T extends {
    updatedAt: Date;
}>(model: Collection<T>, parserOptions: Partial<IQParserOptions<T>>, q: string, options?: IFindByQOptions): Promise<{
    data: any;
    count: any;
}>;
export declare function generateTable<T extends {
    _id: string;
    updatedAt: Date;
    tag: string[];
}>(model: Collection<T>, qParserOptions: Partial<IQParserOptions<T>>): ITable<T>;
//# sourceMappingURL=util.d.ts.map