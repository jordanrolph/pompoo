import pLimit from "p-limit";
import type { ScrapedEvent, ScrapedPage } from "types/types";

const MAX_CONCURRENT_REQUESTS = 3; // Maximum concurrent API requests allowed

interface PlatformHeader {
  "sec-ch-ua": string;
  "sec-ch-ua-platform": string;
  "user-agent": string;
}

const platformHeaders: PlatformHeader[] = [
  {
    "sec-ch-ua":
      '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    "sec-ch-ua-platform": '"Linux"',
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
  },
  {
    "sec-ch-ua":
      '"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36"',
    "sec-ch-ua-platform": '"Windows"',
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
  },
  {
    "sec-ch-ua":
      '"Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"',
    "sec-ch-ua-platform": '"iPhone"',
    "user-agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
  },
];

function generatePageURL(pageNumber: number) {
  const baseURL =
    "https://www.southernwater.co.uk/gateway/Beachbuoy/1.0/api/v1.0/Spills/GetHistoricSpills?status=Genuine";
  if (pageNumber === 1) {
    return baseURL;
  }
  return `${baseURL}&page=${pageNumber}`;
}

async function scrapePage(pageNumber: number): Promise<ScrapedPage> {
  console.log(`Scraping page ${pageNumber}`);

  const pageURL = generatePageURL(pageNumber);
  const randomIndex = Math.floor(Math.random() * platformHeaders.length);
  const randomPlatformHeader = platformHeaders[randomIndex];

  const fetchResponse = await fetch(pageURL, {
    headers: {
      accept: "*/*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "sec-ch-ua": `${randomPlatformHeader?.["sec-ch-ua"]}`,
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": `${randomPlatformHeader?.["sec-ch-ua-platform"]}`,
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent": `${randomPlatformHeader?.["user-agent"]}`,
      "x-gateway-apikey": "d25662b7-9fd3-4e19-a68b-0c581ec229d0",
      "x-requested-with": "XMLHttpRequest",
      Referer:
        "https://www.southernwater.co.uk/water-for-life/beachbuoy/releasehistory",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: null,
    method: "GET",
  });

  if (fetchResponse.status === 200) {
    return fetchResponse.json();
  }

  throw new Error(`Fetch failed with status: ${fetchResponse.statusText}`);
}

export default async function scrapeItemsFromPages(
  numberOfPagesToScrape: number = 2,
): Promise<ScrapedEvent[]> {
  try {
    console.log(`scrapeItemsFromPages called`);

    const limit = pLimit(MAX_CONCURRENT_REQUESTS);
    const scrapePromises: Promise<ScrapedPage>[] = [];

    // Start all scrapePage calls concurrently, respecting the concurrency limit
    for (
      let pageNumber = 1;
      pageNumber <= numberOfPagesToScrape;
      pageNumber++
    ) {
      // Queue the scrapePage call with the concurrency limiter
      const scrapePromise = limit(() => scrapePage(pageNumber));

      scrapePromises.push(scrapePromise);
    }

    // Wait for all promises to resolve
    const pages = await Promise.all(scrapePromises);

    const scrapedItems: ScrapedEvent[] = pages.flatMap((page) => page.items);

    return scrapedItems;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("scrapeItemsFromPages failed without message");
  }
}
