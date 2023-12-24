import Head from "next/head";
import Link from "next/link";
import Image from "next/image";

// import { api } from "~/utils/api";

export default function Beaches() {
  //   const hello = api.post.hello.useQuery({ text: "from tRPC" });

  const beaches = [
    { name: "Ramsgate Western Undercliffe", slug: "some-beach" },
    { name: "Gurnard", slug: "some-beach" },
    { name: "Lee-On-Solent", slug: "lee-on-solent" },
  ];

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
          {beaches.map((beach) => (
            <Link
              href={beach.slug}
              className="block pt-4 text-lg font-medium text-white underline"
            >
              {beach.name}
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
