import { insertScrapedPagesToDB } from "~/server/insertScrapedPagesToDB";
// @ts-expect-error - this file may not exist
import scrapedPagesFromFile from "./scrapedPages_MAY_NOT_EXIST.json";
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
await insertScrapedPagesToDB(scrapedPagesFromFile as ScrapedPage[]);
