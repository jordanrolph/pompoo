import { ScrapedHistoricSpill } from "types/types";
import { db } from "./db";
import placeNameToTitleCase from "~/utils/placeNameToTitleCase";
import { generateSlugFromName } from "~/utils/slug";
import { calculateTimeDifferenceInMinutes } from "~/utils/dumpDuration";

export const insertScrapedHistoricSpillsToDB = async (
  scrapedHistoricSpills: ScrapedHistoricSpill[],
) => {
  try {
    if (!scrapedHistoricSpills.length) {
      console.log("There are no historic spills to upsert");
      return;
    }

    console.log(`Upserting ${scrapedHistoricSpills.length} historic spills`);
    for (const scrapedHistoricSpill of scrapedHistoricSpills) {
      const placeNameInTitleCase = placeNameToTitleCase(
        scrapedHistoricSpill.bathingSite,
      );

      // Create a new bathing sites if it doesn't exist already
      const bathingSite = await db.bathingSite.upsert({
        create: {
          name: placeNameInTitleCase,
          slug: generateSlugFromName(placeNameInTitleCase),
          swBathingSiteName: scrapedHistoricSpill.bathingSite,
          swBathingSiteId: scrapedHistoricSpill.siteUnitNumber.toString(),
        },
        where: {
          swBathingSiteName: scrapedHistoricSpill.bathingSite,
        },
        update: {},
      });

      // Upserts a dump and creates the outfall if it doesn't exist already
      const startedAt = new Date(scrapedHistoricSpill.eventStart);
      // if no end date, assume it is ongoing
      const endedAt = scrapedHistoricSpill.eventStop
        ? new Date(scrapedHistoricSpill.eventStop)
        : new Date();

      console.log(
        `- Upserting dump ${scrapedHistoricSpill.eventId.toString()}`,
      );
      const dump = await db.dump.upsert({
        create: {
          dumpStartedAt: startedAt,
          dumpEndedAt: endedAt,
          dumpDurationMins: calculateTimeDifferenceInMinutes(
            startedAt,
            endedAt,
          ),
          swDumpId: scrapedHistoricSpill.eventId.toString(),
          outfall: {
            connectOrCreate: {
              where: {
                swOutfallName: scrapedHistoricSpill.outfallName,
              },
              create: {
                name: placeNameToTitleCase(scrapedHistoricSpill.outfallName),
                swOutfallId: scrapedHistoricSpill.associatedSiteId.toString(),
                swOutfallName: scrapedHistoricSpill.outfallName,
              },
            },
          },
        },
        where: {
          swDumpId: scrapedHistoricSpill.eventId.toString(),
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

      const rawImpactString = scrapedHistoricSpill.status ?? ""; // Status is sometimes missing (?)
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
      `Error inserting historic spills to DB: ${JSON.stringify(error)}`,
    );
  }
};
