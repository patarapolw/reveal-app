import dotenv from "dotenv";
import Database from "@reveal-app/abstract-db";
import OnlineDb from "@reveal-app/online-db";

dotenv.config({
    path: "../.env"
});
dotenv.config();

export const g: {
    db: Database;
} = {
    db: new OnlineDb(process.env.MONGO_URI!)
};
