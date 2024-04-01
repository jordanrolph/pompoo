import { insertLogToDB } from "~/server/insertLogToDB";
import { insertScrapedHistoricSpillsToDB } from "~/server/insertScrapedHistoricSpillsToDB";
import scrapeHistoricSpillsFromPages from "~/utils/scrapeHistoricSpillsFromPages";

export default async function getNewReleases() {
  console.log("Getting new releases");

  try {
    const scrapedHistoricSpills = await scrapeHistoricSpillsFromPages({
      startPage: 1,
      endPage: 1,
    });
    await insertScrapedHistoricSpillsToDB(scrapedHistoricSpills);
    await insertLogToDB({
      type: "Scrape",
      status: "OK",
      message: `Fetched ${scrapedHistoricSpills.length}`,
    });

    console.log("Done getting new releases");
  } catch (error) {
    if (error instanceof Error) {
      await insertLogToDB({
        type: "Scrape",
        status: "Failure",
        message: error.message,
      });
      console.error("Error getting new releases");
      console.error(error.message);
    }
  }
}
