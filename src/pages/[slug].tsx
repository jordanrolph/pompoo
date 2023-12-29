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
        <title>{`"Pompoo - "${bathingSite.name}`}</title>
        <meta
          name="description"
          content={`Check Southern Water's sewage releases to ${bathingSite.name}`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-[calc(100dvh)] min-h-[600px] flex-col items-center justify-between bg-black p-4 text-center">
        <Link
          className="mt-2 inline-flex items-center gap-3 rounded-lg border border-zinc-400 px-3 py-1 text-white hover:border-white"
          href="/beaches"
        >
          {/* Hamburger SVG */}
          <svg
            className="h-5 w-5"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 5.5H15M3 10H15M3 14.5H15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <Image
              src="/pompoo-logo.png"
              alt="Pompoo Logo"
              width={59}
              height={15}
            />
            <p className="-mt-1 text-xl font-medium lg:text-2xl">
              {bathingSite.name}
            </p>
          </div>
        </Link>

        <div className="my-4 flex max-w-96 grow flex-col items-center justify-center">
          <Image
            src={statusImages[bathingSite.status.code].src}
            alt={statusImages[bathingSite.status.code].alt}
            height={120}
            width={120}
            placeholder="blur"
            blurDataURL={statusImages[bathingSite.status.code].blurDataUrl}
          />
          <h1 className="mt-4 text-3xl font-medium text-white lg:text-5xl">
            {bathingSite.status.title}
          </h1>
          <p className="mt-6 text-left text-amber-100 lg:text-lg">
            {bathingSite.status.message}
          </p>
        </div>
        <section className="flex flex-wrap gap-6 text-lg  text-white lg:gap-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">
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

  // Query sum of release durations in the last 7 days for this site.
  const sumReleaseMinsLastSevenDays = await db.dump.aggregate({
    where: {
      dumpEndedAt: {
        gte: getDateForDaysAgo(7),
      },
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

  // Query sum of release durations in the last 30 days for this site.
  const sumReleaseMinsLastThirtyDays = await db.dump.aggregate({
    where: {
      dumpEndedAt: {
        gte: getDateForDaysAgo(30),
      },
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

  // Query sum of release durations for all time for this site.
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
      dumpStartedAt: "desc",
    },
  });

  const minutesSinceLastDump = calculateMinutesSinceLastDump(
    mostRecentDump?.dumpEndedAt,
  );

  console.log("Most recent: ", mostRecentDump);
  console.log("Time since", minutesSinceLastDump);

  // If the end time is not set, calculate from the current time
  const ongoingDumpMinutesDuration =
    mostRecentDump?.dumpEndedAt && mostRecentDump.dumpDurationMins
      ? mostRecentDump.dumpDurationMins
      : calculateTimeDifferenceInMinutes(
          mostRecentDump!.dumpStartedAt,
          new Date(),
        );

  // Last dump is still ongoing or last 30 minutes = bad
  let statusCode: keyof StatusLabel = "bad";
  // Last dump ended more than 30 mins ago = good
  if (minutesSinceLastDump > 30) {
    statusCode = "meh";
  }
  // Last dump ended more than 24 hours ago = good
  if (minutesSinceLastDump > 1440) {
    statusCode = "good";
  }

  // Format data for presentation.
  const prettyDurationLastSevenDays = minutesToPrettyFormat(
    sumReleaseMinsLastSevenDays._sum.dumpDurationMins ?? 0,
    false,
  );
  const prettyDurationLastThirtyDays = minutesToPrettyFormat(
    sumReleaseMinsLastThirtyDays._sum.dumpDurationMins ?? 0,
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
