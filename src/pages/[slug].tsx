import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import { db } from "~/server/db";

export default function BathingSite({
  bathingSite,
}: InferGetStaticPropsType<typeof getStaticProps>) {
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
            alt="Poo emoji"
            height={120}
            width={120}
            src="/emoji-bad.png"
          />
          <h1 className="mt-4 text-3xl font-medium text-white lg:text-5xl">
            {bathingSite.status.title}
          </h1>
          <p className="mt-6 text-amber-100 lg:text-lg">
            {bathingSite.status.message}
          </p>
        </div>
        <section className="flex flex-wrap gap-6 text-lg  text-white lg:gap-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Last Week
            </h2>
            <p className="font-medium">{bathingSite.stats.days7}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Last Month
            </h2>
            <p className="font-medium">{bathingSite.stats.days30}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              All time
            </h2>
            <p className="font-medium">{bathingSite.stats.allTime}</p>
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
      slug: `${context.params!.slug}`,
    },
  });

  const bathingSiteData = {
    name: bathingSite.name,
    slug: bathingSite.slug,
    status: {
      title: "Try not to get it in your teeth.",
      message:
        "They’ve been firing out pure non-stop jobbies for the last 12 hours 18 mins",
    },
    stats: {
      days7: "9h 30m",
      days30: "40h",
      allTime: "12,300h",
    },
  };

  return {
    props: {
      bathingSite: bathingSiteData,
    },
  };
};
