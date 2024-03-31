import { insertScrapedHistoricSpillsToDB } from "~/server/insertScrapedHistoricSpillsToDB";
import scrapeHistoricSpillsFromPages from "./scrapeHistoricSpillsFromPages";

const NUMBER_OF_PAGES_TO_SCRAPE = 3;

try {
  console.log(`Scraping ${NUMBER_OF_PAGES_TO_SCRAPE} historic pages`);

  const scrapedHistoricSpills = await scrapeHistoricSpillsFromPages(
    NUMBER_OF_PAGES_TO_SCRAPE,
  );
  await insertScrapedHistoricSpillsToDB(scrapedHistoricSpills);

  console.log("Done scraping historic pages");
} catch (error) {
  console.error(error);
}
