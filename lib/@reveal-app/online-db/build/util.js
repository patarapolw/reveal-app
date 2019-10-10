"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_db_1 = require("@reveal-app/abstract-db");
const q2filter_1 = __importDefault(require("q2filter"));
async function find(model, parserOptions, q, options = {
    offset: 0,
    limit: 10
}) {
    let cond;
    let sorter;
    if (typeof q === "string") {
        const parser = new q2filter_1.default(q, parserOptions);
        const fullCond = parser.getCondFull();
        const sort = fullCond.sortBy || options.sort;
        sorter = sort ? { [sort.key]: sort.desc ? -1 : 1 } : { updatedAt: -1 };
        cond = fullCond.cond;
    }
    else {
        cond = q;
        sorter = { updatedAt: -1 };
    }
    const count = await model.find(cond).countDocuments();
    let chain = model.find(cond);
    if (options.fields) {
        let proj = {};
        if (Array.isArray(options.fields)) {
            for (const f of options.fields) {
                proj[f] = 1;
            }
        }
        else {
            proj = options.fields;
        }
        chain = chain.select(proj);
    }
    chain = chain.sort(sorter).skip(options.offset);
    if (options.limit) {
        chain = chain.limit(options.limit);
    }
    const data = await chain;
    return { count, data };
}
function generateTable(model) {
    class NewTable extends abstract_db_1.Table {
        async find(q, options) {
            return await find(model, model.searchOptions, q, options);
        }
        async create(entry) {
            return await model.create(entry);
        }
        async updateById(id, $set) {
            return await model.findByIdAndUpdate(id, { $set: unUndefined($set) });
        }
        async deleteById(id) {
            await model.findByIdAndDelete(id);
        }
        async updateMany(q, $set) {
            if (typeof q === "string") {
                const ids = (await this.find(q, {
                    offset: 0,
                    fields: ["_id"]
                })).data.map((el) => el._id);
                return await model.updateMany({ _id: { $in: ids } }, { $set: unUndefined($set) });
            }
            else {
                return await model.updateMany(q, { $set: unUndefined($set) });
            }
        }
        async addTags(ids, tags) {
            return await model.updateMany({ _id: { $in: ids } }, { $addToSet: {
                    tag: { $each: tags }
                } });
        }
        async removeTags(ids, tags) {
            return await model.updateMany({ _id: { $in: ids } }, { $pull: {
                    tag: { $in: tags }
                } });
        }
    }
    return new NewTable();
}
exports.generateTable = generateTable;
function unUndefined(obj, isNull = [""]) {
    const nullSet = new Set([...(isNull || []), undefined]);
    Object.keys(obj).forEach(key => nullSet.has(obj[key]) ? delete obj[key] : undefined);
    return obj;
}
exports.unUndefined = unUndefined;
