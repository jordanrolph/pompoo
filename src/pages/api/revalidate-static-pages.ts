import { NextApiRequest, NextApiResponse } from "next";
import { env } from "~/env";
import { db } from "~/server/db";

type SuccessResponse = {
  message: string;
};

type ErrorResponse = {
  message: string;
};

export type ResponseData = SuccessResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  // Check this is a valid request
  if (
    req.headers.Authorization !== `Bearer ${env.WORKER_SECRET}` &&
    req.headers.authorization !== `Bearer ${env.WORKER_SECRET}`
  ) {
    return res.status(401).end("Unauthorized");
  }

  console.log("Cron task running: Revalidating static pages");

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

    console.log("Done revalidating static pages");

    return res.status(200).json({ message: "Done revalidating" });
  } catch (error) {
    const errorMessage =
      (error as Error)?.message || "Error revalidating static pages";
    // If there was an error, Next.js will continue
    // to show the last successfully generated page
    console.error(errorMessage);
    return res.status(500).json({ message: errorMessage });
  }
}
