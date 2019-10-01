import express from "express";
import session from "express-session";
import passport from "passport";
import connectMongo from "connect-mongodb-session";
import "./auth/auth0";
import "./auth/token";
import apiRouter from "./api";
import { g } from "./config";
import Database from "@zhsrs/db";

const app = express();
const port = process.env.PORT || 24000;
const MongoStore = connectMongo(session);

const sessionMiddleware = session({
  secret: process.env.SECRET_KEY!,
  cookie: { maxAge: 24 * 3600 * 1000 },
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
      uri: process.env.MONGO_URI!,
      collection: "session"
  })
});

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("../web/dist"));
app.use("/api", apiRouter);

app.listen(port, async () => {
  g.db = await new Database(process.env.MONGO_URI!).connect();
  console.log(`Server running on http://localhost:${port}`);
});