import Head from "next/head";
import Link from "next/link";
import {
  type InferGetStaticPropsType,
  type GetStaticProps,
  type GetStaticPropsContext,
} from "next";

import { db } from "~/server/db";
import { calculateMinutesSinceLastDump } from "~/utils/dumpDuration";
import Nav from "../components/nav";
import { IconAsterisk } from "@tabler/icons-react";

type BathingSite = {
  id: number;
  name: string;
  slug: string;
  siteHasOngoingDumpRightNow: boolean;
};

export default function Beaches({
  bathingSites,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Head>
        <title>Pompoo</title>
        <meta name="description" content="Choose your beach" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className=" mx-auto flex min-h-screen max-w-prose flex-col items-center bg-black">
        <Nav />

        <div className="w-full">
          <h1 className="ml-6 mt-8 text-lg font-light text-zinc-500">
            Choose a beach to check
          </h1>
          <ul className="mb-12 mt-3 rounded-xl border-zinc-900 px-6 pb-5 pt-1 lg:border lg:bg-zinc-950 lg:pt-3">
            {bathingSites.map((bathingSite) => (
              <li className="my-4">
                <Link
                  key={bathingSite.slug}
                  href={bathingSite.slug}
                  className={`inline-flex items-center gap-2.5 py-2 text-xl font-medium  underline decoration-zinc-700 decoration-dotted decoration-2 underline-offset-8 hover:text-white hover:decoration-white hover:decoration-solid focus:decoration-white lg:text-2xl ${
                    bathingSite.siteHasOngoingDumpRightNow
                      ? "text-amber-400"
                      : "text-zinc-300"
                  }`}
                >
                  <span className="">{bathingSite.name}</span>
                  {bathingSite.siteHasOngoingDumpRightNow && (
                    <IconAsterisk
                      stroke={2}
                      className="w-4 text-zinc-400 lg:w-5"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}

export const getStaticProps = (async (context) => {
  const bathingSites = await db.bathingSite.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      dumps: {
        take: 1,
        select: {
          dump: {
            select: {
              dumpEndedAt: true,
            },
          },
        },
        orderBy: {
          dump: {
            dumpStartedAt: "desc",
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const bathingSitesWithCurrentStatus = bathingSites.map((bathingSite) => {
    const minutesSinceLastDump = calculateMinutesSinceLastDump(
      bathingSite.dumps[0]?.dump.dumpEndedAt,
    );
    const siteHasOngoingDumpRightNow = minutesSinceLastDump < 120; // has a dump in last 120 min

    // const statusIsBad = minutesSinceLastDump <= 120;
    // const statusIsMeh = minutesSinceLastDump > 120 && minutesSinceLastDump < 1400;
    // const statusIsOK = minutesSinceLastDump >= 1440;
    return {
      id: bathingSite.id,
      name: bathingSite.name,
      slug: bathingSite.slug,
      siteHasOngoingDumpRightNow,
    };
  });

  return {
    props: { bathingSites: bathingSitesWithCurrentStatus },
  };
}) satisfies GetStaticProps<{
  bathingSites: BathingSite[];
}>;
