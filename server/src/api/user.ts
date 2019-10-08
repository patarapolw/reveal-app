import { Router } from "express";
import { g } from "../config";
import { unUndefined } from "../util";

const userRouter = Router();

userRouter.post("/", async (req, res, next) => {
  try {
    let { q, offset, limit, sort, fields } = req.body;
    const r = await g.db!.tables.user.findByQ(q || "", {
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

userRouter.put("/", async (req, res, next) => {
  try {
    let { _id, type, email, picture, secret, info, web } = req.body;
    const payload = unUndefined({type, email, picture, secret, info, web});
    let outputId = _id || undefined;

    if (!_id) {
      const p = await g.db!.tables.user.create({
        _id: await g.db!.tables.user.getSafeId(outputId || email),
        ...payload
      });
      outputId = p._id;
    } else {
      await g.db!.tables.user.updateById(_id, {$set: payload});
    }
    
    return res.json({
      _id: outputId
    });
  } catch(e) {
    return next(e);
  }
});

userRouter.post("/:id", async (req, res, next) => {
  try {
    const p = await g.db!.tables.user.findById(req.params.id)
    return res.json(p);
  } catch(e) {
    return next(e);
  }
});

userRouter.delete("/:id", async (req, res, next) => {
  try {
    const p = await g.db!.tables.user.deleteById(req.params.id)
    return res.json(p);
  } catch(e) {
    return next(e);
  }
});

userRouter.put("/tags", async (req, res, next) => {
  try {
    const {ids, tags} = req.body;
    await g.db!.tables.user.addTags(ids, tags);
    return res.sendStatus(201);
  } catch(e) {
    return next(e);
  }
});

userRouter.delete("/tags", async (req, res, next) => {
  try {
    const {ids, tags} = req.body;
    await g.db!.tables.user.removeTags(ids, tags);
    return res.sendStatus(201);
  } catch(e) {
    return next(e);
  }
})

export default userRouter;
