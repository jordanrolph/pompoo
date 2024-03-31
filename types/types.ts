import type { NextApiRequest, NextApiResponse } from "next";

// This type is where the actual useful scraped data is held. ScrapedHistoricSpill is wrapped
// by ScrapedItem, but the other values in ScrapedItem object are just from the 0th element of
// the historicSpillsList array, with an incorrect overFlowSiteId value (the value is always 0).
export interface ScrapedHistoricSpill {
  id: number;
  eventId: number;
  siteUnitNumber: number;
  bathingSite: string;
  eventStart: string;
  eventStop: string;
  duration: number;
  status?: string;
  associatedSiteId: number;
  outfallName: string;
  isImpacting: boolean;
  overFlowSiteId: number;
  historicSpillsList?: []; // Ignore: this value is either missing or empty on the ScrapedHistoricSpill children
}

// Ignore the all data in this ScrapedItem except the historicSpillsList.
export interface ScrapedItem {
  id: number;
  eventId: number;
  siteUnitNumber: number;
  bathingSite: string;
  eventStart: string;
  eventStop: string;
  duration: number;
  status?: string;
  associatedSiteId: number;
  outfallName: string;
  isImpacting: boolean;
  overFlowSiteId: number; // Ignore: this value is always 0 in the ScrapedItem parent
  historicSpillsList: ScrapedHistoricSpill[];
}

export interface ScrapedPage {
  currentPage: number;
  totalItems: number;
  totalPages: number;
  items: ScrapedItem[];
}

export interface Log {
  type: "Scrape";
  status: "OK" | "Failure";
  message: string;
}

export interface GetNewReleasesWebhookRequest extends NextApiRequest {
  body: {
    secret: string;
  };
}

export interface GetNewReleasesWebhookResponse extends NextApiResponse {
  message: string;
}
