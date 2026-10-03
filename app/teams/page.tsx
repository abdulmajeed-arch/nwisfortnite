import { createClient } from "@/lib/supabase/server";

type Team = {
  id: string;
  name: string;
};

type Player = {
  id: string;
  fortnite_name: string;
  grade: string;
  section: string;
};

type TeamPlayer = {
  team_id: string;
  player_id: string;
};

export default async function TeamsPage() {
  const supabase = await createClient();

  const [
    { data: teams },
    { data: players },
    { data: teamPlayers },
  ] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name"),

    supabase
      .from("players")
      .select("id, fortnite_name, grade, section")
      .order("fortnite_name"),

    supabase
      .from("team_players")
      .select("team_id, player_id"),
  ]);

  const teamList = ((teams ?? []) as Team[]).sort((a, b) => {
    const aNumber = Number(a.name.match(/\d+/)?.[0] ?? 0);
    const bNumber = Number(b.name.match(/\d+/)?.[0] ?? 0);

    return aNumber - bNumber;
  });

  const playerList = (players ?? []) as Player[];
  const teamPlayerList = (teamPlayers ?? []) as TeamPlayer[];

  const playerMap = new Map(
    playerList.map((player) => [player.id, player]),
  );

  const membersMap = new Map<string, Player[]>();

  for (const relation of teamPlayerList) {
    const player = playerMap.get(relation.player_id);

    if (!player) continue;

    const current = membersMap.get(relation.team_id) ?? [];

    current.push(player);

    membersMap.set(relation.team_id, current);
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff6b00]">
            Duos
          </p>

          <h1 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-7xl">
            Teams
          </h1>

          <p className="mt-5 max-w-2xl text-zinc-400">
            The duos competing for the Zone Wars championship.
          </p>
        </div>
      </header>

      {/* TEAMS */}
      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        {teamList.length === 0 ? (
          <div className="border border-dashed border-white/10 bg-[#0d0d0d] px-6 py-20 text-center">
            <h2 className="text-xl font-black uppercase">
              No teams yet
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Teams created through the admin dashboard will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {teamList.map((team) => {
              const members = membersMap.get(team.id) ?? [];

              const teamNumber =
                team.name.match(/\d+/)?.[0] ?? "?";

              return (
                <article
                  key={team.id}
                  className="group border border-white/10 bg-[#0d0d0d] p-6 transition duration-200 hover:border-[#ff6b00]/40"
                >
                  {/* TEAM HEADER */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                        Duo
                      </p>

                      <h2 className="mt-2 text-3xl font-black uppercase tracking-tight">
                        {team.name}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center bg-[#ff6b00] text-lg font-black italic text-black transition group-hover:bg-[#ffc400]">
                      {teamNumber.padStart(2, "0")}
                    </div>
                  </div>

                  {/* PLAYERS */}
                  <div className="mt-5 space-y-3">
                    {members.length === 0 ? (
                      <div className="border border-dashed border-white/10 p-5 text-sm text-zinc-600">
                        No players assigned
                      </div>
                    ) : (
                      members.map((player, playerIndex) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between bg-[#111111] p-4"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-black uppercase">
                              {player.fortnite_name}
                            </div>

                            <div className="mt-1 text-xs text-zinc-500">
                              Grade {player.grade} · {player.section}
                            </div>
                          </div>

                          <div className="ml-4 shrink-0 text-xs font-black text-[#ff6b00]">
                            0{playerIndex + 1}
                          </div>
                        </div>
                      ))
                    )}
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