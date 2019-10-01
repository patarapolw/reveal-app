import dotenv from "dotenv";
import Database from "@zhsrs/db";

dotenv.config({
    path: "../.env"
});
dotenv.config();

export const g: {
    db?: Database;
} = {};
