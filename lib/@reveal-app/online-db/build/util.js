"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const url_safe_string_1 = __importDefault(require("url-safe-string"));
const chinese_to_pinyin_1 = __importDefault(require("chinese-to-pinyin"));
const v4_1 = __importDefault(require("uuid/v4"));
const q2filter_1 = __importDefault(require("q2filter"));
const uss = new url_safe_string_1.default({
    regexRemovePattern: /((?!([a-z0-9.])).)/gi
});
function generateSecret() {
    return new Promise((resolve, reject) => {
        crypto_1.default.randomBytes(48, (err, b) => {
            if (err) {
                return reject(err);
            }
            resolve(b.toString("base64"));
        });
    });
}
exports.generateSecret = generateSecret;
async function getSafeId(model, title) {
    const ids = (await model.find().select({ _id: 1 })).map((el) => el._id);
    let outputId = title ? uss.generate(chinese_to_pinyin_1.default(title, {
        keepRest: true, toneToNumber: true
    })) : "";
    while (ids.includes(outputId)) {
        const m = /-(\d+)$/.exec(outputId);
        let i = 1;
        if (m) {
            i = parseInt(m[1]) + 1;
        }
        outputId = `${outputId.replace(/-(\d+)$/, "")}-${i}`;
    }
    return outputId || v4_1.default();
}
exports.getSafeId = getSafeId;
async function findByQ(model, parserOptions, q, options = {
    offset: 0,
    limit: 10
}) {
    const parser = new q2filter_1.default(q, parserOptions);
    const fullCond = parser.getCondFull();
    const sort = fullCond.sortBy || options.sort;
    const sorter = sort ? { [sort.key]: sort.desc ? -1 : 1 } : { updatedAt: -1 };
    const count = await model.find(fullCond.cond).countDocuments();
    let chain = model.find(fullCond.cond);
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
exports.findByQ = findByQ;
function generateTable(model) {
    return {
        findByQ: model.findByQ,
        create: async (entry) => {
            return await model.create(entry);
        },
        getSafeId: model.getSafeId,
        updateById: async (id, set) => {
            await model.findByIdAndUpdate(id, set);
        },
        deleteById: async (id) => {
            await model.findByIdAndDelete(id);
        },
        findById: async (id) => {
            return await model.findById(id);
        },
        updateMany: async (cond, set) => {
            await model.updateMany(cond, set);
        },
        addTags: async (ids, tags) => {
            await model.updateMany({ _id: { $in: ids } }, { $addToSet: {
                    tag: { $each: tags }
                } });
        },
        removeTags: async (ids, tags) => {
            await model.updateMany({ _id: { $in: ids } }, { $pull: {
                    tag: { $in: tags }
                } });
        }
    };
}
exports.generateTable = generateTable;
