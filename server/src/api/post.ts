import { Router } from "express";
import { g } from "../config";
import { unUndefined, clone } from "../util";
import { toDate } from "valid-moment";
import matter from "gray-matter";

const postRouter = Router();

postRouter.post("/", async (req, res, next) => {
  try {
    let { q, offset, limit, sort, fields } = req.body;
    const r = await g.db.tables.post.findByQ(q || "", {
      offset,
      limit: limit || 10,
      sort,
      fields
    });

    return res.json(r);
  } catch(e) {
    return next(e);
  }
})

postRouter.put("/", async (req, res, next) => {
  try {
    let { _id, newId, title, date, tag, content, hidden, type, deck } = req.body;
    const m = matter(content);
    content = matter.stringify(m.content, clone({...m.data, title, date, tag, hidden, type, deck}));
    const payload = unUndefined({title, date: date ? toDate(date) : null, tag, content, hidden, type, deck });
    let outputId = _id || newId || undefined;

    if (!_id) {
      const p = await g.db.tables.post.create({
        _id: await g.db.tables.post.getSafeId(outputId || title),
        ...payload
      });
      outputId = p._id;
    } else {
      await g.db.tables.post.updateById(_id, {$set: payload});
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
    const p = await g.db.tables.post.findById(req.params.id)
    return res.json(p);
  } catch(e) {
    return next(e);
  }
});

postRouter.delete("/:id", async (req, res, next) => {
  try {
    const p = await g.db!.tables.post.deleteById(req.params.id)
    return res.json(p);
  } catch(e) {
    return next(e);
  }
});

postRouter.put("/tags", async (req, res, next) => {
  try {
    const {ids, tags} = req.body;
    await g.db.tables.post.addTags(ids, tags);
    return res.sendStatus(201);
  } catch(e) {
    return next(e);
  }
});

postRouter.delete("/tags", async (req, res, next) => {
  try {
    const {ids, tags} = req.body;
    await g.db.tables.post.removeTags(ids, tags);
    return res.sendStatus(201);
  } catch(e) {
    return next(e);
  }
})

export default postRouter;
