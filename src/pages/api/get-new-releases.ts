import {
  GetNewReleasesWebhookResponse,
  GetNewReleasesWebhookRequest,
} from "types/types";
import { env } from "~/env";
import { insertLogToDB } from "~/server/insertLogToDB";
import { insertScrapedHistoricSpillsToDB } from "~/server/insertScrapedHistoricSpillsToDB";
import scrapeHistoricSpillsFromPages from "~/utils/scrapeHistoricSpillsFromPages";

const START_PAGE = 1;
const END_PAGE = 1;

export default async function handler(
  req: GetNewReleasesWebhookRequest,
  res: GetNewReleasesWebhookResponse,
) {
  try {
    if (req.method === "POST") {
      // Do nothing if the secret is wrong
      if (req.body.secret !== env.WEBHOOK_SECRET) {
        console.error(`Webhook called with incorrect secret`);
        return res.status(404);
      }

      console.log(`Webhook called at ${new Date().toLocaleString()}`);

      try {
        const scrapedHistoricSpills = await scrapeHistoricSpillsFromPages({
          startPage: START_PAGE,
          endPage: END_PAGE,
        });
        await insertScrapedHistoricSpillsToDB(scrapedHistoricSpills);
        await insertLogToDB({
          type: "Scrape",
          status: "OK",
          message: `Fetched ${scrapedHistoricSpills.length}`,
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          return await insertLogToDB({
            type: "Scrape",
            status: "Failure",
            message: error.message,
          });
        }
      }

      console.log(`Webhook done at ${new Date().toLocaleString()}`);
      return;
    } else {
      // Handle any other HTTP method
      return res.status(404);
    }
  } catch (error) {
    console.error(error);
  }
}
