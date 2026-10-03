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
  winner_id: string | null;
  status: string;
};

const rounds = [
  {
    key: "round_of_32",
    name: "Round of 32",
    format: "First to 3",
  },
  {
    key: "round_of_16",
    name: "Round of 16",
    format: "First to 3",
  },
  {
    key: "quarterfinal",
    name: "Quarterfinals",
    format: "First to 5",
  },
  {
    key: "semifinal",
    name: "Semifinals",
    format: "First to 5",
  },
  {
    key: "final",
    name: "Final",
    format: "First to 10",
  },
];

function MatchCard({
  match,
  teamMap,
}: {
  match: Match | undefined;
  teamMap: Map<string, string>;
}) {
  if (!match) {
    return (
      <div className="w-64 border border-dashed border-white/10 bg-[#0c0c0c] p-4">
        <div className="text-xs font-bold uppercase text-zinc-700">
          Waiting for matchup
        </div>
      </div>
    );
  }

  const team1 = match.team1_id
    ? teamMap.get(match.team1_id) ?? "TBD"
    : "TBD";

  const team2 = match.team2_id
    ? teamMap.get(match.team2_id) ?? "TBD"
    : "TBD";

  return (
    <div className="w-64 overflow-hidden border border-white/10 bg-[#0d0d0d]">
      <div
        className={`flex items-center justify-between border-b border-white/10 px-4 py-3 ${
          match.winner_id === match.team1_id
            ? "bg-[#ff6b00]/10"
            : ""
        }`}
      >
        <span className="truncate pr-3 text-sm font-black uppercase">
          {team1}
        </span>

        <span className="font-black">
          {match.status === "upcoming" ? "-" : match.team1_score}
        </span>
      </div>

      <div
        className={`flex items-center justify-between px-4 py-3 ${
          match.winner_id === match.team2_id
            ? "bg-[#ff6b00]/10"
            : ""
        }`}
      >
        <span className="truncate pr-3 text-sm font-black uppercase">
          {team2}
        </span>

        <span className="font-black">
          {match.status === "upcoming" ? "-" : match.team2_score}
        </span>
      </div>
    </div>
  );
}

export default async function BracketsPage() {
  const supabase = await createClient();

  const [{ data: matches }, { data: teams }] = await Promise.all([
    supabase
      .from("matches")
      .select("*")
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
            Knockout Stage
          </p>

          <h1 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-7xl">
            Brackets
          </h1>

          <p className="mt-5 text-zinc-400">
            Follow every duo from the Round of 32 to the Final.
          </p>
        </div>
      </header>

      <section className="overflow-x-auto">
        <div className="mx-auto flex min-w-max gap-10 px-5 py-16 lg:px-8">
          {rounds.map((round) => {
            const roundMatches = matchList
              .filter((match) => match.round === round.key)
              .sort((a, b) => a.match_number - b.match_number);

            return (
              <div
                key={round.key}
                className="flex w-64 flex-col"
              >
                <div className="mb-6 border-b border-white/10 pb-4">
                  <div className="text-sm font-black uppercase">
                    {round.name}
                  </div>

                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#ff6b00]">
                    {round.format}
                  </div>
                </div>

                <div
                  className={`flex flex-1 flex-col justify-around gap-5 ${
                    round.key === "round_of_32"
                      ? "min-h-[1200px]"
                      : round.key === "round_of_16"
                        ? "min-h-[850px]"
                        : round.key === "quarterfinal"
                          ? "min-h-[600px]"
                          : round.key === "semifinal"
                            ? "min-h-[350px]"
                            : "min-h-[180px]"
                  }`}
                >
                  {roundMatches.length > 0 ? (
                    roundMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        teamMap={teamMap}
                      />
                    ))
                  ) : (
                    <MatchCard
                      match={undefined}
                      teamMap={teamMap}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
          <div className="border border-[#ff6b00]/20 bg-[#ff6b00]/5 p-6">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b00]">
              Final
            </div>

            <div className="mt-2 text-2xl font-black uppercase">
              First to 10
            </div>

            <p className="mt-2 text-sm text-zinc-500">
              The first duo to reach ten wins the championship.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}