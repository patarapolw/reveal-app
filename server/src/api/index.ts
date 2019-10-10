import { Router } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import postRouter from "./post";
import mediaRouter from "./media";
import { g } from "../config";
import OnlineDb from "@reveal-app/online-db";
import userRouter from "./user";
import quizRouter from "./quiz";

const apiRouter = Router();

apiRouter.use(bodyParser.json({limit: "50mb"}));
apiRouter.use(cors({
  origin: /\/\/localhost/
}));

apiRouter.get("/", (req, res) => {
  return res.sendStatus(200);
});

apiRouter.post("/", (req, res) => {
  return res.json({
    status: !!g.db
  });
});

apiRouter.put("/", async (req, res, next) => {
  try {
    const {filename} = req.body;

    if (filename.startsWith("mongodb://") || filename.startsWith("mongodb+srv://")) {
      g.db = await new OnlineDb(filename).connect();
    }
    // else {
    //   g.db = await new SqliteDb(filename).connect();
    // }

    return res.sendStatus(201);
  } catch(e) {
    return next(e);
  }
});

apiRouter.use("/post", postRouter);
apiRouter.use("/media", mediaRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/quiz", quizRouter);

export default apiRouter;
