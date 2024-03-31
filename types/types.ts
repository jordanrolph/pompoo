import type { NextApiRequest, NextApiResponse } from "next";

export interface ScrapedEvent {
  id: number;
  eventId: number;
  siteUnitNumber: number;
  bathingSite: string;
  eventStart: string;
  eventStop: string;
  duration: number;
  activity?: string;
  status?: string;
  associatedSiteId: number;
  outfallName: string;
  isImpacting: false;
}

export interface ScrapedPage {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  items: ScrapedEvent[];
}

export interface Log {
  type: "Scrape";
  status: "OK" | "Failure";
  message: string;
}

export interface WebhookRequestBody {
  scrapedPages: ScrapedPage[];
  log: Log;
  secret: string;
}

export type WebhookResponseData = {
  message: string;
};

export interface GetNewReleasesWebhookRequest extends NextApiRequest {
  body: {
    secret: string;
  };
}

export interface GetNewReleasesWebhookResponse extends NextApiResponse {
  message: string;
}
