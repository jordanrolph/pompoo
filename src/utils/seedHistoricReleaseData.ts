import { insertScrapedHistoricSpillsToDB } from "~/server/insertScrapedHistoricSpillsToDB";
import scrapeHistoricSpillsFromPages from "./scrapeHistoricSpillsFromPages";

const MAX_RETRIES = 10;
const DELAY_MS = 1000;
const BATCH_SIZE = 3; // Number of pages to try fetching before processsing
const LAST_PAGE = 225; // As of 2024-03-31, page 225 had data from 2023-12-09
let currentPage = 134;

// This function gives retry logic to any async function, passed as an arguement. If
// the async function fails (throws an error), the error is caught and the function
// is called again. It is called with an exponential delay, starting at e.g. 1000ms
// then increasing in delay duration with each retry. It exits if the function does
// not succeed after the MAX_RETRIES number of retries.
async function retryIfFailed<T>(functionToRetryOnFailure: () => Promise<T>) {
  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      return await functionToRetryOnFailure();
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, (error as Error).message);
      retries++;
      await new Promise((resolve) =>
        setTimeout(resolve, DELAY_MS * Math.pow(2, retries)),
      );
    }
  }
  throw new Error(`Max retries (${MAX_RETRIES}) exceeded.`);
}

// This code can fetch specific page ranges to help backfill historic data.
// Because the API is slow and unreliable, it uses a BATCH_SIZE to persist
// the data after every few fetches. That way if the API fails on a page,
// we know where to resume fetching more data.
try {
  while (currentPage <= LAST_PAGE) {
    const startPage = currentPage;
    const endPage = Math.min(currentPage + BATCH_SIZE - 1, LAST_PAGE);
    console.log(`Scraping historic pages ${startPage} to ${endPage}`);

    const scrapedHistoricSpills = await retryIfFailed(async () => {
      return await scrapeHistoricSpillsFromPages({
        startPage,
        endPage,
      });
    });

  await insertScrapedHistoricSpillsToDB(scrapedHistoricSpills);

    console.log(`Processed historic pages ${startPage} to ${endPage}`);

    currentPage += BATCH_SIZE;
  }

  console.log("Done scraping historic pages");
} catch (error) {
  console.error(error);
}
