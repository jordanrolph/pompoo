import type { NextApiRequest, NextApiResponse } from "next";
import { WebhookResponseData, WebhookRequestBody } from "types/types";
import { env } from "~/env";
import { insertLogToDB } from "~/server/insertLogToDB";
import { insertScrapedPagesToDB } from "~/server/insertScrapedPagesToDB";

interface CustomNextApiRequest extends NextApiRequest {
  body: WebhookRequestBody;
}

export default async function handler(
  req: CustomNextApiRequest,
  res: NextApiResponse<WebhookResponseData>,
) {
  if (req.method === "POST") {
    console.log(`Webhook called at ${new Date().toLocaleString()}`);

    // Process a POST request
    const { secret, scrapedPages, log } = req.body;

    // Do nothing if the secret is wrong
    if (secret !== env.WEBHOOK_SECRET) {
      return res.status(401).json({ message: "Wrong secret." });
    }

    res.status(200).json({
      message: `Webhook recieved ${scrapedPages?.length ?? 0} pages with ${
        log?.status ?? "no"
      } status`,
    });

    await insertLogToDB(log);
    await insertScrapedPagesToDB(scrapedPages);

    console.log(`Webhook done at ${new Date().toLocaleString()}`);
    return;
  } else {
    // Handle any other HTTP method
    res.status(404);
  }
}
