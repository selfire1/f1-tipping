import { db } from "../utils/db";
import { groupsTable } from "./schema";

const main = async () => {
  console.log("running seed");

  await db.delete(groupsTable);

  await db.insert(groupsTable).values([
    {
      name: "Scuderia Small Group",
    },
  ]);
};

main();
