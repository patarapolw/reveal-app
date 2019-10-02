import { Router } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import postRouter from "./post";
import revealRouter from "./reveal";

const apiRouter = Router();

apiRouter.get("/", (req, res) => {
  return res.sendStatus(200);
});

apiRouter.use(bodyParser.json({limit: "50mb"}));
apiRouter.use(cors({
  origin: /\/\/localhost/
}));

apiRouter.use("/post", postRouter);
apiRouter.use("/reveal", revealRouter);

export default apiRouter;
