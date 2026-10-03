import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Team = {
  id: string;
  name: string;
};

type Match = {
  id: string;
  round: string;
  match_number: number;
  team1_id: string | null;
  team2_id: string | null;
  team1_score: number;
  team2_score: number;
  team1_kills: number;
  team2_kills: number;
  winner_id: string | null;
  scheduled_at: string | null;
  status: "upcoming" | "live" | "completed";
};

const roundNames: Record<string, string> = {
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarterfinal: "Quarterfinal",
  semifinal: "Semifinal",
  third_place: "3rd Place",
  final: "Final",
};

const formatDate = (date: string | null) => {
  if (!date) return "Time TBA";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

export default async function MatchesPage() {
  const supabase = await createClient();

  const [{ data: matches }, { data: teams }] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .order("match_number"),

    supabase
      .from("teams")
      .select("id, name"),
  ]);

  const matchList = (matches ?? []) as Match[];
  const teamList = (teams ?? []) as Team[];

  const teamMap = new Map(
    teamList.map((team) => [team.id, team.name])
  );

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <Link
            href="/"
            className="text-sm font-bold text-zinc-500 transition hover:text-white"
          >
            ← Home
          </Link>

          <p className="mt-10 text-xs font-black uppercase tracking-[0.25em] text-[#ff6b00]">
            Tournament Schedule
          </p>

          <h1 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-7xl">
            Matches
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {matchList.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-[#0d0d0d] px-6 py-20 text-center">
            <h2 className="text-xl font-black uppercase">
              No matches scheduled
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Matchups will appear here once the tournament is set up.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {matchList.map((match) => {
              const team1 = match.team1_id
                ? teamMap.get(match.team1_id) ?? "TBD"
                : "TBD";

              const team2 = match.team2_id
                ? teamMap.get(match.team2_id) ?? "TBD"
                : "TBD";

              return (
                <article
                  key={match.id}
                  className="border border-white/10 bg-[#0d0d0d] p-5 transition hover:border-[#ff6b00]/40 sm:p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
                          {roundNames[match.round] ?? match.round}
                        </span>

                        <span className="text-xs text-zinc-600">
                          Match {match.match_number}
                        </span>

                        <span
                          className={`text-[10px] font-black uppercase tracking-wider ${
                            match.status === "live"
                              ? "text-red-500"
                              : match.status === "completed"
                                ? "text-zinc-500"
                                : "text-[#ffc400]"
                          }`}
                        >
                          {match.status}
                        </span>
                      </div>

                      <div className="mt-3 text-xs text-zinc-600">
                        {formatDate(match.scheduled_at)}
                      </div>
                    </div>

                    <div className="grid min-w-0 flex-1 gap-2 sm:max-w-xl sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <div className="bg-[#111111] p-4 text-center sm:text-right">
                        <div className="truncate font-black uppercase">
                          {team1}
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          {match.team1_kills} kills
                        </div>
                      </div>

                      <div className="px-2 text-center text-xl font-black">
                        {match.status === "upcoming"
                          ? "VS"
                          : `${match.team1_score} : ${match.team2_score}`}
                      </div>

                      <div className="bg-[#111111] p-4 text-center sm:text-left">
                        <div className="truncate font-black uppercase">
                          {team2}
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          {match.team2_kills} kills
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}