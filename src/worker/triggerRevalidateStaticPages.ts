import { env } from "process";
import { ResponseData } from "~/pages/api/revalidate-static-pages";

const URL = "https://pompoo.org/api/revalidate-static-pages";

export default async function triggerRevalidateStaticPages() {
  try {
    console.log("Revalidating pages using NextJS webhook");
    const response = await fetch(URL, {
      headers: {
        Authorization: `Bearer ${env.WORKER_SECRET}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error calling webhook");
    }

    const responseData = (await response.json()) as ResponseData;

    console.log("Done revalidating pages", responseData.message);
  } catch (error) {
    const errorMessage = (error as Error).message || "Error revalidating pages";
    console.error(errorMessage);
  }

  return;
}
