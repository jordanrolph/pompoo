import { Log } from "types/types";
import { db } from "./db";

export const insertLogToDB = async (log: Log) => {
  try {
    console.log("Inserting log to DB");

    if (!log.status || !log.message || !log.type) {
      console.log("There is no log to insert");
      return;
    }

    await db.log.create({
      data: log,
    });
  } catch (error) {
    throw new Error(`Error inserting log to DB: ${JSON.stringify(error)}`);
  }
};
