import {
  GetNewReleasesWebhookResponse,
  GetNewReleasesWebhookRequest,
} from "types/types";
import { env } from "~/env";
import { insertLogToDB } from "~/server/insertLogToDB";
import { insertScrapedPagesToDB } from "~/server/insertScrapedPagesToDB";

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
        const scrapedPages = await scrapePages();
        await insertScrapedPagesToDB(scrapedPages);
        await insertLogToDB({
          type: "Scrape",
          status: "OK",
          message: "Inserted X logs",
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

async function scrapePages() {
  return [];
}
