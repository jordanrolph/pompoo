import { db } from "~/server/db";

export function calculateMinutesSinceLastDump(
  endedAt: Date | null | undefined,
): number {
  return calculateTimeDifferenceInMinutes(endedAt ?? new Date(), new Date());
}

export function calculateTimeDifferenceInMinutes(
  startedAt: Date,
  endedAt: Date,
): number {
  // calculate time difference
  const differenceInMilliseconds = endedAt.getTime() - startedAt.getTime();
  // convert to minutes and round down to nearest integer
  const differenceInMinutes = Math.floor(
    differenceInMilliseconds / (1000 * 60),
  );
  return differenceInMinutes;
}

// Mar 2024: I can't remember why this function was needed. I think it's likely I did a large DB
// insert but forgot to add the durations, so I wrote this to add in durations afterwards?
async function addDumpDurationsToDB() {
  console.log("running addDumpDurationsToDB");
  try {
    const dumps = await db.dump.findMany({
      where: {
        dumpDurationMins: null,
        dumpEndedAt: {
          not: null,
        },
      },
      orderBy: {
        id: "asc",
      },
    });
    console.log(`fetched ${dumps.length} dumps from DB`);

    // Using for loop to run updates one at a time (sequentially)
    // instead of initiating multiple asynchronous operations
    // simultaneously, which hits the DB connection limits
    for (const dump of dumps) {
      console.log(`Updating dump: ${dump.id}`);
      await db.dump.update({
        where: {
          id: dump.id,
        },
        data: {
          dumpDurationMins: calculateTimeDifferenceInMinutes(
            dump.dumpStartedAt,
            dump.dumpEndedAt!,
          ),
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

// Uncomment to run this batch function
// addDumpDurationsToDB();
