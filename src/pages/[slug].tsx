import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { type GetStaticPaths, type GetStaticProps } from "next";
import { db } from "~/server/db";
import getDateForDaysAgo from "~/utils/getDateForDaysAgo";
import { minutesToPrettyFormat } from "~/utils/minutesToPrettyFormat";
import {
  type StatusLabel,
  getPrettyStatusMessage,
  getRandomStatusLabel,
} from "~/utils/statusLabels";
import {
  calculateMinutesSinceLastDump,
  calculateTimeDifferenceInMinutes,
} from "~/utils/dumpDuration";
import { sumDumpDurationsWithinWindow } from "~/utils/countDurationWithinWindow";
import { IconMenu2 } from "@tabler/icons-react";

const statusImages = {
  good: {
    src: "/emoji-good.png",
    blurDataUrl: "/emoji-good-blur.png",
    alt: "OK hand emoji",
  },
  bad: {
    src: "/emoji-bad.png",
    blurDataUrl: "/emoji-good-bad.png",
    alt: "Poo emoji",
  },
  meh: {
    src: "/emoji-meh.png",
    blurDataUrl: "/emoji-good-meh.png",
    alt: "Shrug emoji",
  },
};

interface BathingSiteProps {
  bathingSite: {
    name: string;
    slug: string;
    status: {
      code: keyof StatusLabel;
      title: string;
      message: string;
    };
    stats: {
      prettyDurationLastSevenDays: string;
      prettyDurationLastThirtyDays: string;
      prettyDurationAllTime: string;
    };
  };
}

export default function BathingSite({ bathingSite }: BathingSiteProps) {
  return (
    <>
      <Head>
        <title>{`Pompoo - ${bathingSite.name}`}</title>
        <meta
          name="description"
          content={`Check Southern Water's sewage releases to ${bathingSite.name}`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-[calc(100dvh)] min-h-[600px] flex-col items-center justify-between bg-black p-4 text-center">
        <nav>
          <Link
            className="mt-2 inline-flex items-center gap-4 rounded-lg border border-zinc-600 bg-gradient-to-br from-black via-zinc-950 to-black py-1 pl-3 pr-4 text-white hover:border-white lg:gap-6 lg:px-5 lg:pl-4"
            href="/beaches"
          >
            <IconMenu2 />
            <div className="flex flex-col items-start justify-start">
              <p>
                <Link
                  href="/"
                  className="text-left text-xs font-semibold uppercase tracking-[0.15em] text-zinc-100 lg:text-sm"
                >
                  Pompoo
                </Link>
              </p>
              <h1 className="-mt-1 text-xl font-medium lg:text-2xl">
                {bathingSite.name}
              </h1>
            </div>
          </Link>
        </nav>

        <div className="my-4 flex max-w-prose grow flex-col items-center justify-center lg:max-w-lg">
          <Image
            src={statusImages[bathingSite.status.code].src}
            alt={statusImages[bathingSite.status.code].alt}
            height={130}
            width={130}
            placeholder="blur"
            blurDataURL={statusImages[bathingSite.status.code].blurDataUrl}
          />
          <h2 className="mt-6 text-center text-4xl font-medium text-white md:text-5xl lg:text-6xl">
            {bathingSite.status.title}
          </h2>
          <p className="mt-6 max-w-md text-center text-lg text-zinc-400 lg:text-2xl lg:font-light lg:leading-relaxed">
            {bathingSite.status.message}
          </p>
        </div>
        <section className="flex flex-wrap gap-6 text-lg  text-white lg:gap-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-amber-400">
              7 days
            </h2>
            <p className="font-medium">
              {bathingSite.stats.prettyDurationLastSevenDays}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              30 days
            </h2>
            <p className="font-medium">
              {bathingSite.stats.prettyDurationLastThirtyDays}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              All time
            </h2>
            <p className="font-medium">
              {bathingSite.stats.prettyDurationAllTime}
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = (async (context) => {
  const bathingSites = await db.bathingSite.findMany({});

  return {
    paths: bathingSites.map((bathingSite) => ({
      params: {
        slug: bathingSite.slug,
      },
    })),
    fallback: false,
  };
}) satisfies GetStaticPaths;

export const getStaticProps: GetStaticProps = async (context) => {
  const bathingSite = await db.bathingSite.findUniqueOrThrow({
    where: {
      slug: context.params!.slug as string,
    },
  });

  const today = new Date();
  const thirtyDaysAgo = getDateForDaysAgo(30);
  const sevenDaysAgo = getDateForDaysAgo(7);

  const releasesInLastThirtyDays = await db.dump.findMany({
    where: {
      dumpEndedAt: {
        gte: thirtyDaysAgo,
      },
      bathingSites: {
        some: {
          bathingSite: {
            id: bathingSite.id,
          },
        },
      },
    },
    orderBy: {
      dumpStartedAt: "desc",
    },
  });

  // Calculate the minutes of releases that fall within the given date range.
  // This accounts for an event partially falling within the range by only counting
  // the release minutes that were within the range.
  const dumpDurationMinutesWithinLastSevenDays = sumDumpDurationsWithinWindow(
    releasesInLastThirtyDays,
    sevenDaysAgo,
    today,
  );
  const dumpDurationMinutesWithinLastThirtyDays = sumDumpDurationsWithinWindow(
    releasesInLastThirtyDays,
    thirtyDaysAgo,
    today,
  );

  // Query sum of release durations for all time for this site.
  // Because it is for all time, this query can be naive because it
  // doesn't need to worry about parts of a release event's dates
  // overlapping with a query range.
  const sumReleaseMinsAllTime = await db.dump.aggregate({
    where: {
      bathingSites: {
        some: {
          bathingSite: {
            id: bathingSite.id,
          },
        },
      },
    },
    _sum: {
      dumpDurationMins: true,
    },
  });

  // This may not be the same as `releasesInLastThirtyDays[0]` becuase
  // some sites last released a long time ago.
  const mostRecentDump = await db.dump.findFirst({
    where: {
      bathingSites: {
        some: {
          bathingSite: {
            id: bathingSite.id,
          },
        },
      },
    },
    orderBy: {
      dumpEndedAt: "desc",
    },
  });

  const minutesSinceLastDump = calculateMinutesSinceLastDump(
    mostRecentDump?.dumpEndedAt,
  );

  // If the end time is not set, calculate from the current time
  const ongoingDumpMinutesDuration =
    mostRecentDump?.dumpEndedAt && mostRecentDump.dumpDurationMins
      ? mostRecentDump.dumpDurationMins
      : calculateTimeDifferenceInMinutes(
          mostRecentDump!.dumpStartedAt,
          new Date(),
        );

  // Last dump is still ongoing or last 120 minutes = bad
  let statusCode: keyof StatusLabel = "bad";
  // Last dump ended more than 120 mins ago =  meh
  if (minutesSinceLastDump > 120) {
    statusCode = "meh";
  }
  // Last dump ended more than 24 hours ago = good
  if (minutesSinceLastDump > 1440) {
    statusCode = "good";
  }

  // Format data for presentation.
  const prettyDurationLastSevenDays = minutesToPrettyFormat(
    dumpDurationMinutesWithinLastSevenDays,
    false,
  );
  const prettyDurationLastThirtyDays = minutesToPrettyFormat(
    dumpDurationMinutesWithinLastThirtyDays,
    false,
  );
  const prettyDurationAllTime = minutesToPrettyFormat(
    sumReleaseMinsAllTime._sum.dumpDurationMins ?? 0,
    false,
  );
  const randomStatusTitle = getRandomStatusLabel(statusCode);
  const prettyStatusMessage = getPrettyStatusMessage(
    statusCode,
    minutesSinceLastDump,
    ongoingDumpMinutesDuration,
  );

  const bathingSiteProps: BathingSiteProps["bathingSite"] = {
    name: bathingSite.name,
    slug: bathingSite.slug,
    status: {
      code: statusCode,
      title: randomStatusTitle,
      message: prettyStatusMessage,
    },
    stats: {
      prettyDurationLastSevenDays,
      prettyDurationLastThirtyDays,
      prettyDurationAllTime,
    },
  };

  return {
    props: {
      bathingSite: bathingSiteProps,
    },
    revalidate: 300, // 5 min in seconds
  };
};
