import Head from "next/head";
import Link from "next/link";
import {
  type InferGetStaticPropsType,
  type GetStaticProps,
  type GetStaticPropsContext,
} from "next";

import { db } from "~/server/db";
import { calculateMinutesSinceLastDump } from "~/utils/dumpDuration";
import Nav from "~/components/Nav";
import { IconAsterisk } from "@tabler/icons-react";

type BathingSite = {
  id: number;
  name: string;
  slug: string;
  siteHasDumpInLast24Hours: boolean;
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
                    bathingSite.siteHasDumpInLast24Hours
                      ? "text-amber-400"
                      : "text-zinc-300"
                  }`}
                >
                  <span className="">{bathingSite.name}</span>
                  {bathingSite.siteHasDumpInLast24Hours && (
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

export const getStaticProps = (async (context: GetStaticPropsContext) => {
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
    const siteHasDumpInLast24Hours = minutesSinceLastDump < 1440; // 24 hours in minutes

    return {
      id: bathingSite.id,
      name: bathingSite.name,
      slug: bathingSite.slug,
      siteHasDumpInLast24Hours,
    };
  });

  return {
    props: { bathingSites: bathingSitesWithCurrentStatus },
  };
}) satisfies GetStaticProps<{
  bathingSites: BathingSite[];
}>;
