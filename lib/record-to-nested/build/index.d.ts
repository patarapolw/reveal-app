export interface ITreeViewItem {
    name: string;
    path: string;
    data?: Record<string, any>;
    children?: ITreeViewItem[];
}
export interface IToNestedOptions {
    splitBy?: string;
    key: string;
}
export default class ToNested {
    options: Required<IToNestedOptions>;
    constructor(options: IToNestedOptions);
    toNested(records: Record<string, any>[]): ITreeViewItem[];
    private recurseParseData;
}
//# sourceMappingURL=index.d.ts.map