import Head from "next/head";
import Link from "next/link";
import { type GetStaticProps } from "next";
import getDateForDaysAgo from "~/utils/getDateForDaysAgo";
import { db } from "~/server/db";
import { minutesToPrettyFormat } from "~/utils/minutesToPrettyFormat";
import { IconFlag3 } from "@tabler/icons-react";
import Nav from "~/components/Nav";

interface HomeProps {
  stats: {
    prettyDurationToday: string;
    prettyDurationLastSevenDays: string;
    prettyDurationAllTime: string;
  };
}

export default function Home({ stats }: HomeProps) {
  return (
    <>
      <Head>
        <title>Pompoo</title>
        <meta
          name="description"
          content="Check Southern Water's sewage releases before you swim"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-[calc(100dvh)] min-h-[460px] flex-col items-center justify-between bg-gradient-to-br from-black to-zinc-950 p-4 text-center">
        <Nav />
        <header className="flex max-w-prose flex-col items-center gap-10 lg:gap-16">
          <h1 className="lg:leading-tighter text-center text-5xl font-semibold text-white sm:text-6xl lg:text-7xl">
            Check sewage
            <br /> releases before <br /> you swim
          </h1>

          <Link
            className="flex items-center gap-3 rounded-lg border border-amber-300 bg-gradient-to-br from-amber-400 via-amber-300 to-amber-400 py-2 pl-5 pr-4 outline-2 outline-offset-2 outline-amber-500 hover:from-amber-500 hover:via-amber-400 hover:to-amber-500 hover:shadow-inner focus:outline-dashed md:py-3 lg:gap-3.5 lg:pl-6 lg:pr-5"
            href="/beaches"
            disabled={true}
          >
            <span className="pt-0.5 text-lg font-semibold text-black md:pt-0 md:text-xl">
              Pick your beach
            </span>
            <IconFlag3
              stroke={2}
              className="h-6 w-6 text-amber-950  md:h-7 md:w-7"
            />
          </Link>
        </header>

        <h2 className="text-lg font-medium text-amber-400">Sorry, Pompoo is down for maintenance</h2>
        
        {/**
        <section className="flex flex-wrap gap-6 text-lg font-medium text-white lg:gap-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-amber-400">
              Releases Today
            </h2>
            <p>{stats.prettyDurationToday}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Last 7 days
            </h2>
            <p>{stats.prettyDurationLastSevenDays}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              All time total
            </h2>
            <p>{stats.prettyDurationAllTime}</p>
          </div>
        </section>
        **/}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
  // Query sum of release durations in the last 1 day for all sites.
  const sumReleaseMinsToday = await db.dump.aggregate({
    where: {
      dumpEndedAt: {
        gte: getDateForDaysAgo(1),
      },
    },
    _sum: {
      dumpDurationMins: true,
    },
  });

  // Query sum of release durations in the last 7 days for all sites.
  const sumReleaseMinsLastSevenDays = await db.dump.aggregate({
    where: {
      dumpEndedAt: {
        gte: getDateForDaysAgo(7),
      },
    },
    _sum: {
      dumpDurationMins: true,
    },
  });

  // Query sum of release durations for all time for all sites.
  const sumReleaseMinsAllTime = await db.dump.aggregate({
    _sum: {
      dumpDurationMins: true,
    },
  });

  // Format data for presentation.
  const prettyDurationToday = minutesToPrettyFormat(
    sumReleaseMinsToday._sum.dumpDurationMins ?? 0,
    false,
  );
  const prettyDurationLastSevenDays = minutesToPrettyFormat(
    sumReleaseMinsLastSevenDays._sum.dumpDurationMins ?? 0,
    false,
  );
  const prettyDurationAllTime = minutesToPrettyFormat(
    sumReleaseMinsAllTime._sum.dumpDurationMins ?? 0,
    false,
  );

  const homeProps: HomeProps = {
    stats: {
      prettyDurationToday,
      prettyDurationLastSevenDays,
      prettyDurationAllTime,
    },
  };

  return {
    props: homeProps,
  };
};
