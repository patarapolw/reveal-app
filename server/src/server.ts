import express from "express";
import session from "express-session";
import passport from "passport";
import connectMongo from "connect-mongodb-session";
import "./auth/auth0";
import "./auth/token";
import apiRouter from "./api";
import { g } from "./config";
import OnlineDb from "@reveal-app/online-db";
import history from "connect-history-api-fallback";

const app = express();
const port = process.env.PORT || 24000;

if (process.env.MONGO_URI) {
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
}

const rewrites = [{ from: /\/reveal/, to: '/reveal.html' }];

if (process.env.NODE_ENV === "development" || !process.env.MONGO_URI) {
  rewrites.push({ from: /\/admin/, to: '/admin.html' });
} else {
  app.use("/admin*", (req, res) => res.sendStatus(401));
}

app.use(history({
  rewrites
}));

app.use(express.static("../web/dist"));
app.use("/api", apiRouter);

app.listen(port, async () => {
  // if (process.env.FILENAME) {
  //   g.db = await new SqliteDb(process.env.FILENAME).connect();
  // } else 
  if (process.env.MONGO_URI) {
    g.db = await new OnlineDb(process.env.MONGO_URI, process.env.NODE_ENV === "development").connect();
  }
  console.log(`Server running on http://localhost:${port}`);
});