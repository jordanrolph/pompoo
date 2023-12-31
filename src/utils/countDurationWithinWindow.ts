import { Dump } from "@prisma/client";

function countDurationWithinWindow(
  dumpStartedAt: Dump["dumpStartedAt"],
  dumpEndedAt: Dump["dumpEndedAt"],
  windowStartTime: number,
  windowEndTime: number,
): number {
  // is this event even in the window?
  let durationInMinutes = 0;
  const today = new Date();
  const dumpStartedAtTime = dumpStartedAt.getTime();
  const dumpEndedAtTime = dumpEndedAt ? dumpEndedAt.getTime() : today.getTime();
  const dumpFinishedBeforeQueryWindowBegins = dumpEndedAtTime < windowStartTime;

  if (!dumpFinishedBeforeQueryWindowBegins) {
    const startOfMeasurement = Math.max(dumpStartedAtTime, windowStartTime);
    const endOfMeasurement = Math.min(dumpEndedAtTime, windowEndTime);

    const timeDifferenceInMiliseconds = endOfMeasurement - startOfMeasurement;
    const timeDifferenceInMinutes = timeDifferenceInMiliseconds / (1000 * 60);
    durationInMinutes = Math.floor(timeDifferenceInMinutes); // round down to whole number
  }

  return durationInMinutes;
}

// Calculate the total minutes of releases that fall within the given date range.
// This accounts for an event partially falling within the range by only counting
// the release minutes that were within the range.
export function sumDumpDurationsWithinWindow(
  dumps: Dump[],
  windowStart: Date,
  windowEnd: Date,
): number {
  let totalDurationInMinutes = 0;
  const windowStartTime = windowStart.getTime();
  const windowEndTime = windowEnd.getTime();

  dumps.forEach((dump) => {
    // is it even in the window?
    const durationInMinutes = countDurationWithinWindow(
      dump.dumpStartedAt,
      dump.dumpEndedAt,
      windowStartTime,
      windowEndTime,
    );
    totalDurationInMinutes = totalDurationInMinutes + durationInMinutes;
  });

  return totalDurationInMinutes;
}
