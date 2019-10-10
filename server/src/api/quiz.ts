import { Router } from "express";
import { g } from "../config";

const quizRouter = Router();

quizRouter.put("/right", async (req, res, next) => {
  try {
    const {key, ...kwargs} = req.body;
    const db = g.db!;

    await db.user.markRight({key, ...kwargs});

    return res.sendStatus(201);
  } catch(e) {
    return next(e);
  }
});

quizRouter.put("/wrong", async (req, res, next) => {
  try {
    const {key, ...kwargs} = req.body;
    const db = g.db!;

    await db.user.markWrong({key, ...kwargs});

    return res.sendStatus(201);
  } catch(e) {
    return next(e);
  }
});

export default quizRouter;
