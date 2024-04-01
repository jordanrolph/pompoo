import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env";
import { db } from "~/server/db";

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
  console.log("HERE!", env.CRON_SECRET);
  console.log("Header", req.headers["authorization"]);
  // Check this is a valid request
  if (
    req.headers["Authorization"] !== `Bearer ${env.CRON_SECRET}` &&
    req.headers["authorization"] !== `Bearer ${env.CRON_SECRET}`
  ) {
    return res.status(401).end("Unauthorized");
  }

  console.log("Running");

  try {
    // NextJS res.revalidate only accepts the actual path string, not a variable path
    // e.g. for "/blog/[slug]" this should be "/blog/post-1", "/blog/post-1",...etc.

    // Home page route
    let pathsToRevalidate: string[] = ["/"];

    // Add each beach page
    const bathingSitePaths = (await db.bathingSite.findMany({})).map(
      (bathingSite) => `/${bathingSite.slug}`,
    );
    pathsToRevalidate = [...pathsToRevalidate, ...bathingSitePaths];

    await Promise.all(pathsToRevalidate.map((path) => res.revalidate(path)));

    console.log("Done revalidating");

    return res.status(200).json({ message: "Done revalidating" });
  } catch (error) {
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    return res.status(500).json({ message: (error as Error).message });
  }
}
