import { Router } from "express";
import { g } from "../config";
import { unUndefined } from "../util";
import fileUpload, { UploadedFile } from "express-fileupload";

const mediaRouter = Router();
mediaRouter.use(fileUpload());

mediaRouter.post("/", async (req, res, next) => {
  try {
    let { q, offset, limit, sort, fields } = req.body;
    const r = await g.db!.tables.media.findByQ(q || "", {
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

mediaRouter.put("/", async (req, res, next) => {
  try {
    const file = req.files!.file as UploadedFile;
    const { _id, newId, tag } = req.body;
    const payload = unUndefined({name: file.name, data: file.data, tag});
    let outputId = _id || newId || undefined;

    if (!_id) {
      const p = await g.db!.tables.media.create({
        _id: await g.db!.tables.media.getSafeId(outputId || name),
        ...payload
      });
      outputId = p._id;
    } else {
      await g.db!.tables.media.updateById(_id, {$set: payload});
    }
    
    return res.json({
      _id: outputId
    });
  } catch(e) {
    return next(e);
  }
});

mediaRouter.get("/:id", async (req, res, next) => {
  try {
    const p = await g.db!.tables.media.findById(req.params.id)
    return res.send(p ? p.data : "");
  } catch(e) {
    return next(e);
  }
});

mediaRouter.delete("/:id", async (req, res, next) => {
  try {
    const p = await g.db!.tables.media.deleteById(req.params.id)
    return res.json(p);
  } catch(e) {
    return next(e);
  }
});

mediaRouter.put("/tags", async (req, res, next) => {
  try {
    const {ids, tags} = req.body;
    await g.db!.tables.media.addTags(ids, tags);
    return res.sendStatus(201);
  } catch(e) {
    return next(e);
  }
});

mediaRouter.delete("/tags", async (req, res, next) => {
  try {
    const {ids, tags} = req.body;
    await g.db!.tables.media.removeTags(ids, tags);
    return res.sendStatus(201);
  } catch(e) {
    return next(e);
  }
})

export default mediaRouter;
