import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import type {
  InferGetStaticPropsType,
  GetStaticProps,
  GetStaticPropsContext,
} from "next";

import { db } from "~/server/db";

type BathingSite = {
  name: string;
  slug: string;
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
              className="block pt-4 text-lg font-medium text-white underline"
            >
              {bathingSite.name}
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps = (async (context: GetStaticPropsContext<{}>) => {
  const bathingSites = await db.bathingSite.findMany({
    select: {
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  });

  return { props: { bathingSites } };
}) satisfies GetStaticProps<{
  bathingSites: BathingSite[];
}>;
