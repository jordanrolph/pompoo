import Link from "next/link";

export default function Nav() {
  return (
    <nav className="pt-2 lg:pt-3">
      <ul>
        <li>
          <Link
            href="/"
            className="text-xl font-semibold uppercase tracking-[0.15em] text-white"
          >
            Pompoo
          </Link>
        </li>
      </ul>
    </nav>
  );
}
