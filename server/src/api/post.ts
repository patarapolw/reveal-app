import { Router } from "express";
import { g } from "../config";
import { unUndefined } from "../util";
import { toDate } from "valid-moment";

const postRouter = Router();

postRouter.post("/", async (req, res, next) => {
  try {
    let { q, offset, limit, sort } = req.body;
    const r = await g.db!.cols.post.findByQ(q, offset, limit, sort);

    return res.json(r);
  } catch(e) {
    return next(e);
  }
})

postRouter.put("/", async (req, res, next) => {
  try {
    const { _id, newId, title, date, tag, content, hidden, type } = req.body;
    const payload = unUndefined({title, date: date ? toDate(date) : null, tag, content, hidden, type });
    let outputId = _id || newId || undefined;

    if (!_id) {
      const p = await g.db!.cols.post.create({
        _id: await g.db!.cols.post.getSafeId(outputId || title),
        ...payload
      });
      outputId = p.id;
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

postRouter.delete("/:id", async (req, res, next) => {
  try {
    const p = await g.db!.cols.post.findByIdAndDelete(req.params.id)
    return res.json(p);
  } catch(e) {
    return next(e);
  }
});

export default postRouter;
