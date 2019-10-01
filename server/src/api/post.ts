import { Router } from "express";
import { g } from "../config";
import { unUndefined } from "../util";
import { toDate } from "valid-moment";
import UrlSafeString from "url-safe-string";
import pinyin from "chinese-to-pinyin";
import QParser from "q2filter";

const postRouter = Router();
const uss = new UrlSafeString({
  regexRemovePattern: /((?!([a-z0-9.])).)/gi
});

postRouter.post("/", async (req, res, next) => {
  try {
    let { q, offset, limit, sort } = req.body;
    const parser = new QParser(q, {
      anyOf: new Set(["title", "tag"]),
      isString: new Set(["title", "tag"]),
      isDate: new Set(["date"])
    });

    const fullCond = parser.getCondFull();
    sort = fullCond.sortBy || sort;

    const sorter = sort ? {[sort.key]: sort.desc ? -1 : 1} : {date: -1};

    const count = await g.db!.cols.post.find(fullCond.cond).countDocuments();
    const data = await g.db!.cols.post.find(fullCond.cond)
    .sort(sorter).skip(offset).limit(limit);
    return res.json({data, count});
  } catch(e) {
    return next(e);
  }
})

postRouter.put("/", async (req, res, next) => {
  try {
    const { _id, newId, title, date, tag, content } = req.body;
    const payload = unUndefined({title, date: date ? toDate(date) : null, tag, content });
    let outputId = _id || newId || uss.generate(pinyin(title, {
      keepRest: true, toneToNumber: true
    })) || undefined;

    if (!_id) {
      while (true) {
        try {
          const p = await g.db!.cols.post.create({
            _id: outputId,
            ...payload
          });
          outputId = p.id;
          break;
        } catch(e) {
          const m = / (\d+)$/.exec(outputId);
          let i = 1;

          if (m) {
            i = parseInt(m[1]) + 1;
          }

          outputId = `${outputId.replace(/(\d+)$/, "")} (${i})`;
        }
      }
    } else {
      await g.db!.cols.post.findByIdAndUpdate(_id, {$set: payload});
    }
    
    return res.json({
      _id: outputId
    });
  } catch(e) {
    return next(e);
  }
});

postRouter.post("/:id", async (req, res, next) => {
  try {
    const p = await g.db!.cols.post.findById(req.params.id)
    return res.json(p);
  } catch(e) {
    return next(e);
  }
});

export default postRouter;
