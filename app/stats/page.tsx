import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Player = {
  id: string;
  fortnite_name: string;
  grade: string;
  section: string;
};

type PlayerStat = {
  player_id: string;
  kills: number;
};

export default async function StatsPage() {
  const supabase = await createClient();

  const [
    { data: players },
    { data: stats },
  ] = await Promise.all([
    supabase
      .from("players")
      .select("id, fortnite_name, grade, section"),

    supabase
      .from("match_player_stats")
      .select("player_id, kills"),
  ]);

  const playerList = (players ?? []) as Player[];
  const statList = (stats ?? []) as PlayerStat[];

  const playerMap = new Map(
    playerList.map((player) => [player.id, player])
  );

  const totals = new Map<string, number>();

  for (const stat of statList) {
    totals.set(
      stat.player_id,
      (totals.get(stat.player_id) ?? 0) + stat.kills
    );
  }

  const leaderboard = [...totals.entries()]
    .map(([playerId, kills]) => ({
      player: playerMap.get(playerId),
      kills,
    }))
    .filter((item) => item.player)
    .sort((a, b) => b.kills - a.kills);

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
            Player Performance
          </p>

          <h1 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-7xl">
            Stats
          </h1>

          <p className="mt-5 text-zinc-400">
            Individual elimination totals across completed tournament matches.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
        {leaderboard.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-[#0d0d0d] px-6 py-20 text-center">
            <h2 className="text-xl font-black uppercase">
              No stats yet
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Player kill statistics will appear once match results are
              entered.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-white/10">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.player!.id}
                className="grid grid-cols-[55px_1fr_auto] items-center border-b border-white/10 bg-[#0d0d0d] px-5 py-5 last:border-b-0 sm:grid-cols-[70px_1fr_120px]"
              >
                <div
                  className={`text-2xl font-black ${
                    index === 0
                      ? "text-[#ff6b00]"
                      : "text-zinc-700"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>
                  <div className="font-black uppercase">
                    {entry.player!.fortnite_name}
                  </div>

                  <div className="mt-1 text-xs text-zinc-600">
                    Grade {entry.player!.grade} ·{" "}
                    {entry.player!.section}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black">
                    {entry.kills}
                  </div>

                  <div className="text-[9px] font-black uppercase tracking-wider text-zinc-600">
                    Kills
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}