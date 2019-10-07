import { ReturnModelType } from '@typegoose/typegoose';
import { IFindByQOptions, ITable } from '@reveal-app/abstract-db';
import { IQParserOptions } from 'q2filter';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';
export declare function generateSecret(): Promise<string>;
export declare function getSafeId<T extends AnyParamConstructor<any>>(model: ReturnModelType<T>, title?: string): Promise<string>;
export declare function findByQ<T>(model: ReturnModelType<any>, parserOptions: Partial<IQParserOptions<T & {
    createdAt: Date;
    updatedAt: Date;
}>>, q: string, options?: IFindByQOptions): Promise<{
    data: T[];
    count: number;
}>;
export declare function generateTable<T>(model: ReturnModelType<any>): ITable<T>;
//# sourceMappingURL=util.d.ts.map