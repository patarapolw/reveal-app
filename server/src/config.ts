import dotenv from "dotenv";
import AbstractDb from "@reveal-app/abstract-db";

dotenv.config({
    path: "../.env"
});
dotenv.config();

export const g: {
    db?: AbstractDb;
} = {};
