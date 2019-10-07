"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_safe_string_1 = __importDefault(require("url-safe-string"));
const chinese_to_pinyin_1 = __importDefault(require("chinese-to-pinyin"));
const v4_1 = __importDefault(require("uuid/v4"));
const q2filter_1 = __importDefault(require("q2filter"));
const uss = new url_safe_string_1.default({
    regexRemovePattern: /((?!([a-z0-9.])).)/gi
});
async function getSafeId(model, title) {
    const ids = (await model.find({}, ["_id"])).map((el) => el._id);
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
    const allData = await model.find({});
    // @ts-ignore
    const parser = new q2filter_1.default(q, {
        ...parserOptions,
        sortBy: options.sort || {
            key: "updatedAt",
            desc: true
        }
    });
    const allResult = parser.parse(allData);
    const count = allResult.length;
    let data = allResult.slice(options.offset, options.limit ? options.offset + options.limit : undefined);
    if (options.fields) {
        data = data.map((el) => {
            for (const k of Object.keys(el)) {
                if (Array.isArray(options.fields) && !options.fields.includes(k)) {
                    delete el[k];
                }
            }
            return el;
        });
    }
    return { data, count };
}
exports.findByQ = findByQ;
function generateTable(model, qParserOptions) {
    return {
        create: async (entry) => {
            await model.create(entry);
            return (await model.find({ _id: entry._id }))[0];
        },
        getSafeId: async (title) => {
            const ids = (await model.find({}, ["_id"])).map((el) => el._id);
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
        },
        findById: async (_id) => {
            return (await model.find({ _id }))[0];
        },
        findByQ: async (q, options) => {
            return await findByQ(model, qParserOptions, q, options);
        },
        updateById: async (_id, set) => {
            await model.update({ _id }, set);
        },
        deleteById: async (_id) => {
            await model.delete({ _id });
        },
        addTags: async (ids, tags) => {
            await Promise.all((await model.find({ _id: { $in: ids } }, ["_id", "tag"])).map(async (el) => {
                try {
                    const existing = el.tag || [];
                    await model.update({ _id: el._id }, {
                        tag: Array.from(new Set([...tags, ...existing]))
                    });
                }
                catch (e) { }
            }));
        },
        removeTags: async (ids, tags) => {
            await Promise.all((await model.find({ _id: { $in: ids } }, ["_id", "tag"])).map(async (el) => {
                try {
                    const existing = el.tag || [];
                    await model.update({ _id: el._id }, {
                        tag: Array.from(existing.filter((t) => !tags.includes(t)))
                    });
                }
                catch (e) { }
            }));
        },
        updateMany: async (cond, set) => {
            const { $set } = set;
            await model.update(cond, $set);
        }
    };
}
exports.generateTable = generateTable;
