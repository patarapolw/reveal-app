import "../src/config";
import Database from "@zhsrs/db";

(async () => {
  const db = await new Database(process.env.MONGO_URI!).connect();

  console.log(await db.cols.post.find().select({_id: 1}));

  db.close();
})();