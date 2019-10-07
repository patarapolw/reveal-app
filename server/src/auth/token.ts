import passport from "passport";
import { Strategy } from "passport-local";
import expressJwt from "express-jwt";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { g } from "../config";
import OnlineDb from "@reveal-app/online-db";

if (process.env.MONGO_URI) {
  passport.use(new Strategy({
    usernameField: "email",
    passwordField: "password"
  }, (email, password, done) => {
    if (g.db instanceof OnlineDb) {
      (async () => {
        if (g.db instanceof OnlineDb) {
          const db = g.db!;
          const result = await db.login(email, password);
      
          if (!result || !db.currentUser) {
            return done(null, false, { message: "No login or password is invalid" });;
          }
      
          return done(null, db.currentUser.id);
        }
      })().catch(done);
    } else {
      done(null);
    }
  }));
}

function getTokenFromHeaders(req: Request) {
  const { headers: { authorization } } = req;
  if (authorization && authorization.split(" ")[0] === "Token") {
    return authorization.split(" ")[1];
  }
  return null;
}

const auth = {
  required: expressJwt({
    secret: "secret",
    userProperty: "payload",
    getToken: getTokenFromHeaders
  }),
  optional: expressJwt({
    secret: "secret",
    userProperty: "payload",
    getToken: getTokenFromHeaders,
    credentialsRequired: false
  })
};

export function generateJwt(secret: string) {
  const today = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(today.getDate() + 60);

  return jwt.sign({
    secret,
    exp: expirationDate.getTime() / 1000
  }, "secret");
}

export function toAuthJson(secret: string) {
  return {
    token: generateJwt(secret)
  };
}

export default auth;