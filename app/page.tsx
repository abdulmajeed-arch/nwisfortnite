import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Teams", href: "/teams" },
  { label: "Players", href: "/players" },
  { label: "Matches", href: "/matches" },
  { label: "Brackets", href: "/brackets" },
  { label: "Stats", href: "/stats" },
  { label: "Contact", href: "/contact" },
];

const rounds = [
  { name: "Round of 32", format: "First to 3" },
  { name: "Round of 16", format: "First to 3" },
  { name: "Quarterfinals", format: "First to 5" },
  { name: "Semifinals", format: "First to 5" },
  { name: "3rd Place", format: "First to 10" },
  { name: "Final", format: "First to 10" },
];

export default async function Home() {
  const supabase = await createClient();

  const [
    { count: teamCount },
    { count: playerCount },
    { count: matchCount },
  ] = await Promise.all([
    supabase
      .from("teams")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("players")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("matches")
      .select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    {
      value: teamCount ?? 0,
      label: "Teams",
    },
    {
      value: playerCount ?? 0,
      label: "Players",
    },
    {
      value: matchCount ?? 0,
      label: "Matches",
    },
    {
      value: 1,
      label: "Champion",
    },
  ];

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#ff6b00]/10 blur-[140px]" />

        <div className="pointer-events-none absolute right-[-200px] top-0 h-[500px] w-[500px] rounded-full bg-[#ffc400]/5 blur-[140px]" />

        <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-center px-5 py-24 lg:px-8">
          <div className="max-w-5xl">
            <div className="mb-7 inline-flex items-center gap-3 border border-[#ff6b00]/30 bg-[#ff6b00]/10 px-4 py-2">
              <span className="h-2 w-2 bg-[#ff6b00]" />

              <span className="text-xs font-black uppercase tracking-[0.22em] text-[#ff8a33]">
                Zone Wars · Duos Tournament
              </span>
            </div>

            <h1 className="text-6xl font-black uppercase leading-[0.82] tracking-[-0.06em] sm:text-7xl md:text-8xl lg:text-[110px]">
              DROP IN.
              <br />

              <span className="text-[#ff6b00]">FIGHT.</span>
              <br />

              ADVANCE.
            </h1>

            <p className="mt-9 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
              NWIS Fortnite Zone Wars. Teams of two compete through a
              single-elimination bracket until one duo takes the championship.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/brackets"
                className="bg-[#ff6b00] px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:bg-[#ff8126]"
              >
                View Brackets
              </Link>

              <Link
                href="/teams"
                className="border border-white/15 bg-white/5 px-7 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:border-white/25 hover:bg-white/10"
              >
                View Teams
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE DATABASE STATS */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="px-5 py-8 lg:px-8"
            >
              <div
                className={`text-3xl font-black ${
                  stat.label === "Champion"
                    ? "text-[#ff6b00]"
                    : "text-white"
                }`}
              >
                {stat.value}
              </div>

              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TOURNAMENT FORMAT */}
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-[#ff6b00]">
              Tournament Format
            </p>

            <h2 className="text-4xl font-black uppercase tracking-tight sm:text-5xl">
              One bracket.
              <br />

              <span className="text-zinc-500">
                No second chances.
              </span>
            </h2>
          </div>

          <Link
            href="/brackets"
            className="text-sm font-bold text-zinc-400 transition hover:text-white"
          >
            Open full bracket →
          </Link>
        </div>

        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {rounds.map((round, index) => (
            <div
              key={round.name}
              className="group bg-[#0d0d0d] p-6 transition hover:bg-[#121212]"
            >
              <div className="mb-10 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-600">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-[10px] font-black uppercase tracking-wider text-[#ff6b00]">
                  {round.format}
                </span>
              </div>

              <h3 className="text-xl font-black uppercase">
                {round.name}
              </h3>

              <div className="mt-5 h-px w-full bg-white/10">
                <div className="h-px w-0 bg-[#ff6b00] transition-all duration-500 group-hover:w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="relative overflow-hidden border border-[#ff6b00]/20 bg-[#101010] p-8 sm:p-12">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-[#ff6b00]/5" />

            <div className="relative max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff6b00]">
                Ready?
              </p>

              <h2 className="mt-4 text-4xl font-black uppercase tracking-tight sm:text-5xl">
                Follow every match.
              </h2>

              <p className="mt-4 leading-7 text-zinc-400">
                Check the live bracket, see upcoming matchups, and keep track
                of the tournament&apos;s top fraggers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/matches"
                  className="bg-[#ff6b00] px-6 py-3 text-sm font-black uppercase text-black transition hover:bg-[#ff8126]"
                >
                  Matches
                </Link>

                <Link
                  href="/stats"
                  className="border border-white/10 px-6 py-3 text-sm font-black uppercase text-white transition hover:bg-white/5"
                >
                  Player Stats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="font-bold uppercase tracking-wider">
            NWIS Fortnite Tournament
          </div>

          <div>Zone Wars · Duos</div>
        </div>
      </footer>
    </main>
  );
}