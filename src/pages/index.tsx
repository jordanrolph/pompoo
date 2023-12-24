import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

import { api } from "~/utils/api";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });

  const stats = {
    today: "9h 30m",
    sevenDays: "40h",
    allTime: "12,300h",
  };

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

      <main className="flex h-screen min-h-[460px] flex-col items-center justify-between bg-black p-4 text-center">
        <Image
          src="/pompoo-logo.png"
          alt="Pompoo Logo"
          width={98}
          height={25}
        />
        <div className="flex max-w-[400px] flex-col items-center gap-8 md:max-w-[500px] lg:max-w-[640px] lg:gap-10">
          <h1 className="text-center text-4xl font-medium text-white md:text-5xl lg:text-6xl">
            Check sewage releases before you swim
          </h1>
          <Link
            className="flex items-center gap-3 rounded-lg bg-amber-400 px-3 py-2 text-black hover:bg-amber-300"
            href="/beaches"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 18 18"
              fill="none"
              className="h-6 w-6"
            >
              <path
                d="M7.25 3L2.75 5.25V15L7.25 12.75M7.25 3L11.75 5.25M7.25 3V12.75M11.75 5.25L16.25 3V12.75L11.75 15M11.75 5.25V15M11.75 15L7.25 12.75"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-lg font-medium">Pick your beach</p>
          </Link>
        </div>
        <section className="flex flex-wrap gap-6 text-lg font-medium text-white lg:gap-10">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm text-amber-300">Releases Today</h2>
            <p>{stats.today}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-sm text-zinc-400">Last 7 days</h2>
            <p>{stats.sevenDays}</p>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-sm text-zinc-400">All time total</h2>
            <p>{stats.allTime}</p>
          </div>
        </section>
      </main>
    </>
  );
}
