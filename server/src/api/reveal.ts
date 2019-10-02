import { Router } from "express";
import { g } from "../config";
import { unUndefined } from "../util";
import { toDate } from "valid-moment";

const revealRouter = Router();

revealRouter.post("/", async (req, res, next) => {
  try {
    let { q, offset, limit, sort } = req.body;
    const r = await g.db!.cols.reveal.findByQ(q, offset, limit, sort);

    return res.json(r);
  } catch(e) {
    return next(e);
  }
})

revealRouter.put("/", async (req, res, next) => {
  try {
    const { _id, newId, title, date, tag, content } = req.body;
    const payload = unUndefined({title, date: date ? toDate(date) : null, tag, content });
    let outputId = _id || newId || undefined;

    if (!_id) {
      while (true) {
        const p = await g.db!.cols.reveal.create({
          _id: outputId,
          ...payload
        });
        outputId = p.id;
      }
    } else {
      await g.db!.cols.reveal.findByIdAndUpdate(_id, {$set: payload});
    }
    
    return res.json({
      _id: outputId
    });
  } catch(e) {
    return next(e);
  }
});

revealRouter.post("/:id", async (req, res, next) => {
  try {
    const p = await g.db!.cols.reveal.findById(req.params.id)
    return res.json(p);
  } catch(e) {
    return next(e);
  }
});

revealRouter.delete("/:id", async (req, res, next) => {
  try {
    const p = await g.db!.cols.reveal.findByIdAndDelete(req.params.id)
    return res.json(p);
  } catch(e) {
    return next(e);
  }
});

export default revealRouter;
