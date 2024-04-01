import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env";
import { insertLogToDB } from "~/server/insertLogToDB";
import { insertScrapedHistoricSpillsToDB } from "~/server/insertScrapedHistoricSpillsToDB";
import scrapeHistoricSpillsFromPages from "~/utils/scrapeHistoricSpillsFromPages";

type SuccessResponse = {
  message: string;
};

type ErrorResponse = {
  message: string;
};

type ResponseData = SuccessResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  try {
    // Check this is a valid request
    if (
      req.headers["Authorization"] !== `Bearer ${env.CRON_SECRET}` &&
      req.headers["authorization"] !== `Bearer ${env.CRON_SECRET}`
    ) {
      return res.status(401).end("Unauthorized");
    }

    console.log("Cron task running: Fetching new releases");

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
    } catch (error) {
      if (error instanceof Error) {
        await insertLogToDB({
          type: "Scrape",
          status: "Failure",
          message: error.message,
        });

        throw new Error(error.message);
      }
    }

    return res.status(200).json({ message: "Done fetching new releases" });
  } catch (error) {
    const errorMessage =
      (error as Error)?.message || "Error fetching new releases";
    console.error(errorMessage);
    return res.status(500).json({ message: errorMessage });
  }
}
