import { insertScrapedPagesToDB } from "~/server/insertScrapedPagesToDB";
// @ts-ignore
import scrapedPagesFromFile from "./scrapedPages.json";
import { ScrapedPage } from "types/types";

/**
 * Used for manually backfilling large amounts of data. Run using
 * `npm run script:insert-from-file`.
 *
 * Requires a file called scrapedPages.json inside the utils folder.
 *
 * Get this file by running `npm run script:save` in pompoo-scraper
 * then copy-paste it into the utils folder here.
 */
insertScrapedPagesToDB(scrapedPagesFromFile as ScrapedPage[]);
