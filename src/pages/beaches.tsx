import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import {
  type InferGetStaticPropsType,
  type GetStaticProps,
  type GetStaticPropsContext,
} from "next";

import { db } from "~/server/db";
import { calculateMinutesSinceLastDump } from "~/utils/dumpDuration";

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

      <main className="flex min-h-screen flex-col items-center bg-black p-4">
        <Link href="/">
          <Image
            src="/pompoo-logo.png"
            alt="Pompoo Logo"
            width={98}
            height={25}
          />
        </Link>

        <div className="min-w-80">
          <h1 className="mt-8 text-sm text-zinc-400">
            Choose a beach to check
          </h1>
          {bathingSites.map((bathingSite) => (
            <Link
              href={bathingSite.slug}
              className="block pt-4 text-lg font-medium text-white"
            >
              <span className="underline">{bathingSite.name}</span>
              {bathingSite.siteHasOngoingDumpRightNow ? " 💩" : ""}
            </Link>
          ))}
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
    const siteHasOngoingDumpRightNow = minutesSinceLastDump < 30; // has a dump in last 30 min

    // const statusIsBad = minutesSinceLastDump <= 30;
    // const statusIsMeh = minutesSinceLastDump > 30 && minutesSinceLastDump < 1400;
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
    revalidate: 300, // 5 min in seconds
  };
}) satisfies GetStaticProps<{
  bathingSites: BathingSite[];
}>;
