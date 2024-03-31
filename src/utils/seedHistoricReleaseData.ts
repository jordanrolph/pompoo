import { insertScrapedPagesToDB } from "~/server/insertScrapedPagesToDB";
import scrapeItemsFromPages from "./scrapeItemsFromPages";

const numberOfPagesToScrape = 1;

try {
  console.log(`Scraping ${numberOfPagesToScrape} historic pages`);

  const scrapedItems = await scrapeItemsFromPages(2);
  console.log(scrapedItems);
  //   await insertScrapedPagesToDB(scrapedPages);

  console.log("Done scraping historic pages");
} catch (error) {
  console.error(error);
}
