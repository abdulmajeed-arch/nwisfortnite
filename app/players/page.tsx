import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Player = {
  id: string;
  fortnite_name: string;
  grade: string;
  section: string;
  roll_number: string;
  phone: string;
};

type TeamPlayer = {
  player_id: string;
  team_id: string;
};

type Team = {
  id: string;
  name: string;
};

export default async function PlayersPage() {
  const supabase = await createClient();

  const [
    { data: players },
    { data: teamPlayers },
    { data: teams },
  ] = await Promise.all([
    supabase
      .from("players")
      .select(
        "id, fortnite_name, grade, section, roll_number, phone"
      )
      .order("fortnite_name"),

    supabase
      .from("team_players")
      .select("player_id, team_id"),

    supabase
      .from("teams")
      .select("id, name")
      .order("name"),
  ]);

  const playerList = (players ?? []) as Player[];
  const teamPlayerList = (teamPlayers ?? []) as TeamPlayer[];
  const teamList = (teams ?? []) as Team[];

  const teamMap = new Map(
    teamList.map((team) => [team.id, team.name])
  );

  const playerTeamMap = new Map(
    teamPlayerList.map((item) => [
      item.player_id,
      teamMap.get(item.team_id) ?? null,
    ])
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
            Tournament Roster
          </p>

          <h1 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-7xl">
            Players
          </h1>

          <p className="mt-5 max-w-2xl text-zinc-400">
            Every player competing in the NWIS Fortnite Zone Wars
            tournament.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {playerList.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-[#0d0d0d] px-6 py-20 text-center">
            <h2 className="text-xl font-black uppercase">
              No players yet
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Players added through the admin dashboard will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playerList.map((player) => {
              const teamName = playerTeamMap.get(player.id);

              return (
                <article
                  key={player.id}
                  className="group border border-white/10 bg-[#0d0d0d] p-6 transition hover:-translate-y-1 hover:border-[#ff6b00]/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b00]">
                        {teamName ?? "No team"}
                      </p>

                      <h2 className="mt-2 break-words text-2xl font-black uppercase">
                        {player.fortnite_name}
                      </h2>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white/5 text-sm font-black text-zinc-500">
                      FN
                    </div>
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden border border-white/10 bg-white/10">
                    <div className="bg-[#111111] p-3">
                      <div className="text-[10px] font-bold uppercase text-zinc-600">
                        Grade
                      </div>

                      <div className="mt-1 font-bold">
                        {player.grade}
                      </div>
                    </div>

                    <div className="bg-[#111111] p-3">
                      <div className="text-[10px] font-bold uppercase text-zinc-600">
                        Section
                      </div>

                      <div className="mt-1 font-bold">
                        {player.section}
                      </div>
                    </div>

                    <div className="bg-[#111111] p-3">
                      <div className="text-[10px] font-bold uppercase text-zinc-600">
                        Roll Number
                      </div>

                      <div className="mt-1 font-bold">
                        {player.roll_number}
                      </div>
                    </div>

                    <div className="bg-[#111111] p-3">
                      <div className="text-[10px] font-bold uppercase text-zinc-600">
                        Phone
                      </div>

                      <div className="mt-1 break-all text-sm font-bold">
                        {player.phone}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`tel:${player.phone}`}
                    className="mt-4 block w-full border border-[#ff6b00]/30 bg-[#ff6b00]/10 px-4 py-3 text-center text-xs font-black uppercase tracking-wider text-[#ff8a33] transition hover:bg-[#ff6b00] hover:text-black"
                  >
                    Contact Player
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}