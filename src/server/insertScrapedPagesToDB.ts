import { ScrapedEvent, ScrapedPage } from "types/types";
import { db } from "./db";
import placeNameToTitleCase from "~/utils/placeNameToTitleCase";
import { generateSlugFromName } from "~/utils/slug";
import { calculateTimeDifferenceInMinutes } from "~/utils/dumpDuration";

export const insertScrapedPagesToDB = async (scrapedPages: ScrapedPage[]) => {
  try {
    console.log("Inserting scraped pages to DB");

    if (!scrapedPages.length) {
      console.log("There are no pages to insert");
      return;
    }

    const scrapedEvents: ScrapedEvent[] = scrapedPages.flatMap(
      (page) => page.items,
    );

    console.log(
      "insertScrapedPagesToDB called with ",
      scrapedEvents.length,
      " scrapedEvents",
    );
    for (const scrapedEvent of scrapedEvents) {
      const placeNameInTitleCase = placeNameToTitleCase(
        scrapedEvent.bathingSite,
      );

      // Create a new bathing sites if it doesn't exist already
      const bathingSite = await db.bathingSite.upsert({
        create: {
          name: placeNameInTitleCase,
          slug: generateSlugFromName(placeNameInTitleCase),
          swBathingSiteName: scrapedEvent.bathingSite,
          swBathingSiteId: scrapedEvent.siteUnitNumber.toString(),
        },
        where: {
          swBathingSiteName: scrapedEvent.bathingSite,
        },
        update: {},
      });

      // Upserts a dump and creates the outfall if it doesn't exist already
      const startedAt = new Date(scrapedEvent.eventStart);
      // if no end date, assume it is ongoing
      const endedAt = scrapedEvent.eventStop
        ? new Date(scrapedEvent.eventStop)
        : new Date();

      const dump = await db.dump.upsert({
        create: {
          dumpStartedAt: startedAt,
          dumpEndedAt: endedAt,
          dumpDurationMins: calculateTimeDifferenceInMinutes(
            startedAt,
            endedAt,
          ),
          swDumpId: scrapedEvent.eventId.toString(),
          outfall: {
            connectOrCreate: {
              where: {
                swOutfallName: scrapedEvent.outfallName,
              },
              create: {
                name: placeNameToTitleCase(scrapedEvent.outfallName),
                swOutfallId: scrapedEvent.associatedSiteId.toString(),
                swOutfallName: scrapedEvent.outfallName,
              },
            },
          },
        },
        where: {
          swDumpId: scrapedEvent.eventId.toString(),
        },
        update: {
          // Update the timing if it has changed
          dumpStartedAt: startedAt,
          dumpEndedAt: endedAt,
          dumpDurationMins: calculateTimeDifferenceInMinutes(
            startedAt,
            endedAt,
          ),
          updatedAt: new Date(),
        },
      });

      const rawImpactString =
        scrapedEvent.activity ?? scrapedEvent.status ?? ""; // SW changed this key name, need to support both
      const trimmedImpactClassification = rawImpactString.trim();
      // Insert relations connecting a dump to a bathing site (1-n)
      await db.dumpsOnBathingSite.upsert({
        create: {
          impactClassification: trimmedImpactClassification,
          dumpId: dump.id,
          bathingSiteId: bathingSite.id,
        },
        update: {
          impactClassification: trimmedImpactClassification,
        },
        where: {
          dumpId_bathingSiteId: {
            dumpId: dump.id,
            bathingSiteId: bathingSite.id,
          },
        },
      });
    }
  } catch (error) {
    throw new Error(
      `Error inserting scraped events to DB: ${JSON.stringify(error)}`,
    );
  }
};
