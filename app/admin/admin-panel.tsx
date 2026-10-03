"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  Swords,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  Trophy,
  Save,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Admin = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  photo_url: string | null;
};

type Player = {
  id: string;
  fortnite_name: string;
  grade: string;
  section: string;
  roll_number: string;
  phone: string;
};

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
  status: string;
};

type Props = {
  admin: Admin;
  userEmail: string;
};

const rounds = [
  { value: "round_of_32", label: "Round of 32", firstTo: 3 },
  { value: "round_of_16", label: "Round of 16", firstTo: 3 },
  { value: "quarterfinal", label: "Quarterfinals", firstTo: 5 },
  { value: "semifinal", label: "Semifinals", firstTo: 5 },
  { value: "third_place", label: "3rd Place", firstTo: 10 },
  { value: "final", label: "Final", firstTo: 10 },
];

export default function AdminPanel({ admin, userEmail }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [tab, setTab] = useState<
    "dashboard" | "players" | "teams" | "matches" | "settings"
  >("dashboard");

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  const [showMatchForm, setShowMatchForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  const [message, setMessage] = useState("");

  async function loadData() {
    setLoadingData(true);

    const [
      { data: playerData },
      { data: teamData },
      { data: matchData },
    ] = await Promise.all([
      supabase.from("players").select("*").order("created_at"),
      supabase.from("teams").select("*").order("name"),
      supabase.from("matches").select("*").order("round").order("match_number"),
    ]);

    setPlayers(playerData ?? []);
    setTeams(teamData ?? []);
    setMatches(matchData ?? []);

    setLoadingData(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  async function deletePlayer(player: Player) {
    if (!confirm(`Delete ${player.fortnite_name}?`)) return;

    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", player.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Player deleted.");
    loadData();
  }

  async function deleteTeam(team: Team) {
    if (!confirm(`Delete ${team.name}?`)) return;

    const { error } = await supabase
      .from("teams")
      .delete()
      .eq("id", team.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Team deleted.");
    loadData();
  }

  async function deleteMatch(match: Match) {
    if (!confirm(`Delete match #${match.match_number}?`)) return;

    const { error } = await supabase
      .from("matches")
      .delete()
      .eq("id", match.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Match deleted.");
    loadData();
  }

  const stats = [
    {
      label: "Players",
      value: players.length,
      icon: Users,
    },
    {
      label: "Teams",
      value: teams.length,
      icon: Shield,
    },
    {
      label: "Matches",
      value: matches.length,
      icon: Swords,
    },
    {
      label: "Completed",
      value: matches.filter((m) => m.status === "completed").length,
      icon: Trophy,
    },
  ];

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090909]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-[#ff6b00] text-sm font-black italic text-black">
              FN
            </div>

            <div>
              <div className="text-sm font-black uppercase">
                Admin Portal
              </div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-600">
                NWIS Fortnite Tournament
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-zinc-500 sm:block">
              {admin.name}
            </span>

            <button
              onClick={logout}
              className="flex items-center gap-2 border border-white/10 px-3 py-2 text-xs font-bold uppercase text-zinc-400 transition hover:border-red-500/30 hover:text-red-400"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px] flex-col lg:flex-row">
        {/* SIDEBAR */}
        <aside className="border-b border-white/10 lg:min-h-[calc(100vh-64px)] lg:w-64 lg:border-b-0 lg:border-r">
          <nav className="flex gap-1 overflow-x-auto p-3 lg:block lg:space-y-1">
            <NavButton
              icon={LayoutDashboard}
              label="Dashboard"
              active={tab === "dashboard"}
              onClick={() => setTab("dashboard")}
            />

            <NavButton
              icon={Users}
              label="Players"
              active={tab === "players"}
              onClick={() => setTab("players")}
            />

            <NavButton
              icon={Shield}
              label="Teams"
              active={tab === "teams"}
              onClick={() => setTab("teams")}
            />

            <NavButton
              icon={Swords}
              label="Matches"
              active={tab === "matches"}
              onClick={() => setTab("matches")}
            />

            <NavButton
              icon={Settings}
              label="Admin Settings"
              active={tab === "settings"}
              onClick={() => setTab("settings")}
            />
          </nav>
        </aside>

        {/* CONTENT */}
        <section className="min-w-0 flex-1 p-5 sm:p-8">
          {message && (
            <div className="mb-6 flex items-center justify-between border border-[#ff6b00]/20 bg-[#ff6b00]/5 px-4 py-3 text-sm text-[#ff8a33]">
              <span>{message}</span>
              <button onClick={() => setMessage("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {tab === "dashboard" && (
            <Dashboard
              stats={stats}
              matches={matches}
              teams={teams}
              players={players}
            />
          )}

          {tab === "players" && (
            <PlayersSection
              players={players}
              onAdd={() => {
                setEditingPlayer(null);
                setShowPlayerForm(true);
              }}
              onEdit={(player) => {
                setEditingPlayer(player);
                setShowPlayerForm(true);
              }}
              onDelete={deletePlayer}
            />
          )}

          {tab === "teams" && (
            <TeamsSection
              teams={teams}
              players={players}
              onAdd={() => {
                setEditingTeam(null);
                setShowTeamForm(true);
              }}
              onEdit={(team) => {
                setEditingTeam(team);
                setShowTeamForm(true);
              }}
              onDelete={deleteTeam}
            />
          )}

          {tab === "matches" && (
            <MatchesSection
              matches={matches}
              teams={teams}
              players={players}
              onAdd={() => {
                setEditingMatch(null);
                setShowMatchForm(true);
              }}
              onEdit={(match) => {
                setEditingMatch(match);
                setShowMatchForm(true);
              }}
              onDelete={deleteMatch}
            />
          )}

          {tab === "settings" && (
            <SettingsSection
              admin={admin}
              userEmail={userEmail}
              onSaved={async () => {
                setMessage("Admin settings saved.");
                router.refresh();
              }}
            />
          )}
        </section>
      </div>

      {showPlayerForm && (
        <PlayerForm
          player={editingPlayer}
          onClose={() => setShowPlayerForm(false)}
          onSaved={() => {
            setShowPlayerForm(false);
            setMessage(editingPlayer ? "Player updated." : "Player added.");
            loadData();
          }}
        />
      )}

      {showTeamForm && (
        <TeamForm
          team={editingTeam}
          players={players}
          onClose={() => setShowTeamForm(false)}
          onSaved={() => {
            setShowTeamForm(false);
            setMessage(editingTeam ? "Team updated." : "Team created.");
            loadData();
          }}
        />
      )}

      {showMatchForm && (
        <MatchForm
          match={editingMatch}
          teams={teams}
          players={players}
          onClose={() => setShowMatchForm(false)}
          onSaved={() => {
            setShowMatchForm(false);
            setMessage(editingMatch ? "Match updated." : "Match created.");
            loadData();
          }}
        />
      )}
    </main>
  );
}

/* -------------------------------------------------- */
/* NAV */
/* -------------------------------------------------- */

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof LayoutDashboard;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wide transition lg:w-full ${
        active
          ? "bg-[#ff6b00]/10 text-[#ff6b00]"
          : "text-zinc-500 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

/* -------------------------------------------------- */
/* DASHBOARD */
/* -------------------------------------------------- */

function Dashboard({
  stats,
  matches,
  teams,
  players,
}: {
  stats: {
    label: string;
    value: number;
    icon: typeof Users;
  }[];
  matches: Match[];
  teams: Team[];
  players: Player[];
}) {
  return (
    <div>
      <PageHeading
        eyebrow="Overview"
        title="Dashboard"
        description="Tournament control center."
      />

      <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.label} className="bg-[#101010] p-6">
              <Icon size={18} className="text-[#ff6b00]" />

              <div className="mt-5 text-4xl font-black">{stat.value}</div>

              <div className="mt-1 text-xs font-bold uppercase tracking-wider text-zinc-600">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="border border-white/10 bg-[#101010] p-6">
          <h2 className="text-sm font-black uppercase">Tournament</h2>

          <div className="mt-5 space-y-3 text-sm">
            <InfoRow label="Teams" value={String(teams.length)} />
            <InfoRow label="Players" value={String(players.length)} />
            <InfoRow label="Matches" value={String(matches.length)} />
            <InfoRow
              label="Completed"
              value={String(
                matches.filter((m) => m.status === "completed").length,
              )}
            />
          </div>
        </div>

        <div className="border border-white/10 bg-[#101010] p-6">
          <h2 className="text-sm font-black uppercase">Quick actions</h2>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="border border-white/10 p-4 text-xs font-bold uppercase text-zinc-500">
              Add players from Players
            </div>

            <div className="border border-white/10 p-4 text-xs font-bold uppercase text-zinc-500">
              Build duos from Teams
            </div>

            <div className="border border-white/10 p-4 text-xs font-bold uppercase text-zinc-500">
              Create matchups
            </div>

            <div className="border border-white/10 p-4 text-xs font-bold uppercase text-zinc-500">
              Update results
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* PLAYERS */
/* -------------------------------------------------- */

function PlayersSection({
  players,
  onAdd,
  onEdit,
  onDelete,
}: {
  players: Player[];
  onAdd: () => void;
  onEdit: (player: Player) => void;
  onDelete: (player: Player) => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="Roster"
        title="Players"
        description="Add and manage tournament players."
        button="Add player"
        onClick={onAdd}
      />

      <div className="overflow-x-auto border border-white/10">
        <table className="w-full min-w-[850px] text-left">
          <thead className="border-b border-white/10 bg-[#101010]">
            <tr>
              <th className="px-5 py-4">Player</th>
              <th className="px-5 py-4">Grade</th>
              <th className="px-5 py-4">Section</th>
              <th className="px-5 py-4">Roll</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-white/[0.02]">
                <td className="px-5 py-4 font-bold">{player.fortnite_name}</td>
                <td className="px-5 py-4 text-sm text-zinc-400">
                  {player.grade}
                </td>
                <td className="px-5 py-4 text-sm text-zinc-400">
                  {player.section}
                </td>
                <td className="px-5 py-4 text-sm text-zinc-400">
                  {player.roll_number}
                </td>
                <td className="px-5 py-4 text-sm text-zinc-400">
                  {player.phone}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <ActionButton
                      icon={Pencil}
                      onClick={() => onEdit(player)}
                    />
                    <ActionButton
                      icon={Trash2}
                      danger
                      onClick={() => onDelete(player)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {players.length === 0 && (
          <EmptyState text="No players added yet." />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* TEAMS */
/* -------------------------------------------------- */

function TeamsSection({
  teams,
  players,
  onAdd,
  onEdit,
  onDelete,
}: {
  teams: Team[];
  players: Player[];
  onAdd: () => void;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}) {
  const [teamPlayers, setTeamPlayers] = useState<
    Record<string, Player[]>
  >({});

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data } = await supabase
        .from("team_players")
        .select("team_id, player_id");

      const map: Record<string, Player[]> = {};

      for (const row of data ?? []) {
        const player = players.find((p) => p.id === row.player_id);

        if (!player) continue;

        if (!map[row.team_id]) {
          map[row.team_id] = [];
        }

        map[row.team_id].push(player);
      }

      setTeamPlayers(map);
    }

    if (players.length) {
      load();
    }
  }, [teams, players]);

  return (
    <div>
      <SectionHeader
        eyebrow="Competition"
        title="Teams"
        description="Build your tournament duos."
        button="Create duo"
        onClick={onAdd}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="border border-white/10 bg-[#101010] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-[#ff6b00]">
                  Duo
                </div>
                <h3 className="mt-2 text-xl font-black uppercase">
                  {team.name}
                </h3>
              </div>

              <div className="flex gap-2">
                <ActionButton
                  icon={Pencil}
                  onClick={() => onEdit(team)}
                />

                <ActionButton
                  icon={Trash2}
                  danger
                  onClick={() => onDelete(team)}
                />
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {(teamPlayers[team.id] ?? []).map((player) => (
                <div
                  key={player.id}
                  className="border border-white/5 bg-black px-4 py-3 text-sm font-bold"
                >
                  {player.fortnite_name}
                </div>
              ))}

              {(teamPlayers[team.id] ?? []).length === 0 && (
                <div className="text-sm text-zinc-600">
                  No players assigned.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && <EmptyState text="No teams created yet." />}
    </div>
  );
}

/* -------------------------------------------------- */
/* MATCHES */
/* -------------------------------------------------- */

function MatchesSection({
  matches,
  teams,
  players,
  onAdd,
  onEdit,
  onDelete,
}: {
  matches: Match[];
  teams: Team[];
  players: Player[];
  onAdd: () => void;
  onEdit: (match: Match) => void;
  onDelete: (match: Match) => void;
}) {
  return (
    <div>
      <SectionHeader
        eyebrow="Competition"
        title="Matches"
        description="Create matchups and manage tournament results."
        button="Create matchup"
        onClick={onAdd}
      />

      <div className="space-y-3">
        {matches.map((match) => {
          const team1 = teams.find((t) => t.id === match.team1_id);
          const team2 = teams.find((t) => t.id === match.team2_id);
          const round = rounds.find((r) => r.value === match.round);

          return (
            <div
              key={match.id}
              className="border border-white/10 bg-[#101010] p-5"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff6b00]">
                    {round?.label ?? match.round} · Match{" "}
                    {match.match_number}
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <span className="font-black">
                      {team1?.name ?? "TBD"}
                    </span>

                    <span className="text-xs font-bold text-zinc-600">
                      VS
                    </span>

                    <span className="font-black">
                      {team2?.name ?? "TBD"}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-zinc-600">
                    {match.status.toUpperCase()}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-black">
                      {match.team1_score}
                    </div>
                    <div className="text-[10px] uppercase text-zinc-600">
                      {match.team1_kills} kills
                    </div>
                  </div>

                  <div className="text-zinc-700">—</div>

                  <div className="text-center">
                    <div className="text-3xl font-black">
                      {match.team2_score}
                    </div>
                    <div className="text-[10px] uppercase text-zinc-600">
                      {match.team2_kills} kills
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <ActionButton
                      icon={Pencil}
                      onClick={() => onEdit(match)}
                    />

                    <ActionButton
                      icon={Trash2}
                      danger
                      onClick={() => onDelete(match)}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {matches.length === 0 && (
        <EmptyState text="No matches created yet." />
      )}
    </div>
  );
}

/* -------------------------------------------------- */
/* PLAYER FORM */
/* -------------------------------------------------- */

function PlayerForm({
  player,
  onClose,
  onSaved,
}: {
  player: Player | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();

  const [fortniteName, setFortniteName] = useState(
    player?.fortnite_name ?? "",
  );
  const [grade, setGrade] = useState(player?.grade ?? "");
  const [section, setSection] = useState(player?.section ?? "");
  const [roll, setRoll] = useState(player?.roll_number ?? "");
  const [phone, setPhone] = useState(
    player?.phone.replace("+966", "") ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();

    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 9) {
      setError("Saudi phone number must contain exactly 9 digits.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      fortnite_name: fortniteName.trim(),
      grade: grade.trim(),
      section: section.trim(),
      roll_number: roll.trim(),
      phone: `+966${cleanPhone}`,
    };

    const result = player
      ? await supabase.from("players").update(payload).eq("id", player.id)
      : await supabase.from("players").insert(payload);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    onSaved();
  }

  return (
    <Modal title={player ? "Edit player" : "Add player"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <Input
          label="Fortnite name"
          value={fortniteName}
          onChange={setFortniteName}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Grade" value={grade} onChange={setGrade} required />
          <Input
            label="Section"
            value={section}
            onChange={setSection}
            required
          />
        </div>

        <Input
          label="Roll number"
          value={roll}
          onChange={setRoll}
          required
        />

        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
            Phone
          </label>

          <div className="flex">
            <div className="border border-r-0 border-white/10 bg-white/5 px-3 py-3 text-sm font-bold text-zinc-400">
              +966
            </div>

            <input
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
              }
              className="min-w-0 flex-1 border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-[#ff6b00]"
              placeholder="5XXXXXXXX"
              required
            />
          </div>
        </div>

        {error && <FormError text={error} />}

        <FormButtons
          loading={saving}
          onClose={onClose}
          label={player ? "Save changes" : "Add player"}
        />
      </form>
    </Modal>
  );
}

/* -------------------------------------------------- */
/* TEAM FORM */
/* -------------------------------------------------- */
function TeamForm({
  team,
  players,
  onClose,
  onSaved,
}: {
  team: Team | null;
  players: Player[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();

  const [name, setName] = useState(team?.name ?? "");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [assignedPlayerIds, setAssignedPlayerIds] = useState<string[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTeamPlayers() {
      setLoadingPlayers(true);

      const { data, error } = await supabase
        .from("team_players")
        .select("player_id, team_id");

      if (error) {
        setError(error.message);
        setLoadingPlayers(false);
        return;
      }

      const rows = data ?? [];

      // All players currently assigned to any team
      setAssignedPlayerIds(
        rows
          .filter((row) => row.team_id !== team?.id)
          .map((row) => row.player_id),
      );

      // If editing, load this team's existing players
      if (team) {
        const currentPlayers = rows
          .filter((row) => row.team_id === team.id)
          .map((row) => row.player_id);

        setPlayer1(currentPlayers[0] ?? "");
        setPlayer2(currentPlayers[1] ?? "");
      }

      setLoadingPlayers(false);
    }

    loadTeamPlayers();
  }, [team]);

  // Players available for Player 1.
  // Current team's players are allowed when editing.
  const player1Options = players.filter(
    (player) =>
      !assignedPlayerIds.includes(player.id) ||
      player.id === player1 ||
      player.id === player2,
  );

  // Players available for Player 2.
  // Player 1 is removed so the same player cannot be selected twice.
  const player2Options = players.filter(
  (player) =>
    (!assignedPlayerIds.includes(player.id) || player.id === player2) &&
    player.id !== player1,
);

  async function save(e: FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Enter a team name.");
      return;
    }

    if (!player1 || !player2) {
      setError("A duo must have exactly two players.");
      return;
    }

    if (player1 === player2) {
      setError("The two players must be different.");
      return;
    }

    setSaving(true);
    setError("");

    let teamId = team?.id;

    if (team) {
      const { error } = await supabase
        .from("teams")
        .update({ name: name.trim() })
        .eq("id", team.id);

      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }

      await supabase
        .from("team_players")
        .delete()
        .eq("team_id", team.id);
    } else {
      const { data, error } = await supabase
        .from("teams")
        .insert({ name: name.trim() })
        .select()
        .single();

      if (error || !data) {
        setError(error?.message ?? "Could not create team.");
        setSaving(false);
        return;
      }

      teamId = data.id;
    }

    const { error } = await supabase.from("team_players").insert([
      {
        team_id: teamId,
        player_id: player1,
      },
      {
        team_id: teamId,
        player_id: player2,
      },
    ]);

    if (error) {
      setError(
        error.code === "23505"
          ? "One of these players is already assigned to another duo."
          : error.message,
      );
      setSaving(false);
      return;
    }

    onSaved();
  }

  return (
    <Modal title={team ? "Edit duo" : "Create duo"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <Input
          label="Team name"
          value={name}
          onChange={setName}
          required
        />

        {loadingPlayers ? (
          <div className="border border-white/10 bg-black px-4 py-3 text-sm text-zinc-600">
            Loading available players...
          </div>
        ) : (
          <>
            <Select
              label="Player 1"
              value={player1}
              onChange={(value) => {
                setPlayer1(value);

                // If Player 1 was the same as Player 2,
                // clear Player 2 automatically.
                if (value === player2) {
                  setPlayer2("");
                }
              }}
              options={player1Options.map((p) => ({
                value: p.id,
                label: `${p.fortnite_name} · Grade ${p.grade}${p.section}`,
              }))}
            />

            <Select
              label="Player 2"
              value={player2}
              onChange={setPlayer2}
              options={player2Options.map((p) => ({
                value: p.id,
                label: `${p.fortnite_name} · Grade ${p.grade}${p.section}`,
              }))}
            />
          </>
        )}

        <div className="border border-white/10 bg-[#0b0b0b] p-4">
          <div className="text-xs font-black uppercase tracking-wider text-[#ff6b00]">
            Player availability
          </div>

          <p className="mt-2 text-xs leading-5 text-zinc-600">
            Players already assigned to another duo are automatically removed
            from these lists.
          </p>
        </div>

        {error && <FormError text={error} />}

        <FormButtons
          loading={saving || loadingPlayers}
          onClose={onClose}
          label={team ? "Save duo" : "Create duo"}
        />
      </form>
    </Modal>
  );
}

/* -------------------------------------------------- */
/* MATCH FORM */
/* -------------------------------------------------- */

function MatchForm({
  match,
  teams,
  players,
  onClose,
  onSaved,
}: {
  match: Match | null;
  teams: Team[];
  players: Player[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const supabase = createClient();

  const [round, setRound] = useState(match?.round ?? "round_of_32");
  const [matchNumber, setMatchNumber] = useState(
    String(match?.match_number ?? 1),
  );
  const [team1, setTeam1] = useState(match?.team1_id ?? "");
  const [team2, setTeam2] = useState(match?.team2_id ?? "");
  const [score1, setScore1] = useState(String(match?.team1_score ?? 0));
  const [score2, setScore2] = useState(String(match?.team2_score ?? 0));
  const [kills1, setKills1] = useState(String(match?.team1_kills ?? 0));
  const [kills2, setKills2] = useState(String(match?.team2_kills ?? 0));
  const [status, setStatus] = useState(match?.status ?? "upcoming");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const firstTo =
    rounds.find((r) => r.value === round)?.firstTo ?? 3;

  async function save(e: FormEvent) {
    e.preventDefault();

    setSaving(true);
    setError("");

    if (!team1 || !team2) {
      setError("Select both teams.");
      setSaving(false);
      return;
    }

    if (team1 === team2) {
      setError("A team cannot play itself.");
      setSaving(false);
      return;
    }

    const s1 = Number(score1);
    const s2 = Number(score2);

    if (s1 > firstTo || s2 > firstTo) {
      setError(`Scores cannot exceed first-to-${firstTo}.`);
      setSaving(false);
      return;
    }

    let winnerId: string | null = null;

    if (status === "completed") {
      if (s1 === s2) {
        setError("Completed matches cannot have a tied score.");
        setSaving(false);
        return;
      }

      winnerId = s1 > s2 ? team1 : team2;
    }

    const payload = {
      round,
      match_number: Number(matchNumber),
      team1_id: team1,
      team2_id: team2,
      team1_score: s1,
      team2_score: s2,
      team1_kills: Number(kills1),
      team2_kills: Number(kills2),
      winner_id: winnerId,
      status,
    };

    const result = match
      ? await supabase.from("matches").update(payload).eq("id", match.id)
      : await supabase.from("matches").insert(payload);

    if (result.error) {
      setError(
        result.error.code === "23505"
          ? "That round and match number already exists."
          : result.error.message,
      );
      setSaving(false);
      return;
    }

    onSaved();
  }

  return (
    <Modal title={match ? "Edit match" : "Create matchup"} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Round"
            value={round}
            onChange={setRound}
            options={rounds.map((r) => ({
              value: r.value,
              label: `${r.label} · First to ${r.firstTo}`,
            }))}
          />

          <Input
            label="Match number"
            type="number"
            value={matchNumber}
            onChange={setMatchNumber}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Team 1"
            value={team1}
            onChange={setTeam1}
            options={teams.map((t) => ({
              value: t.id,
              label: t.name,
            }))}
          />

          <Select
            label="Team 2"
            value={team2}
            onChange={setTeam2}
            options={teams.map((t) => ({
              value: t.id,
              label: t.name,
            }))}
          />
        </div>

        <div className="border border-white/10 bg-black p-4">
          <div className="mb-4 text-xs font-black uppercase tracking-wider text-[#ff6b00]">
            Match result
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Team 1 score"
              type="number"
              min="0"
              max={firstTo}
              value={score1}
              onChange={setScore1}
            />

            <Input
              label="Team 2 score"
              type="number"
              min="0"
              max={firstTo}
              value={score2}
              onChange={setScore2}
            />

            <Input
              label="Team 1 kills"
              type="number"
              min="0"
              value={kills1}
              onChange={setKills1}
            />

            <Input
              label="Team 2 kills"
              type="number"
              min="0"
              value={kills2}
              onChange={setKills2}
            />
          </div>
        </div>

        <Select
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "upcoming", label: "Upcoming" },
            { value: "live", label: "Live" },
            { value: "completed", label: "Completed" },
          ]}
        />

        <div className="border border-[#ff6b00]/20 bg-[#ff6b00]/5 p-4 text-xs text-zinc-400">
          First to <span className="font-black text-[#ff8a33]">{firstTo}</span>
          . Team kills are tournament team totals.
        </div>

        {error && <FormError text={error} />}

        <FormButtons
          loading={saving}
          onClose={onClose}
          label={match ? "Save match" : "Create matchup"}
        />
      </form>
    </Modal>
  );
}

/* -------------------------------------------------- */
/* SETTINGS */
/* -------------------------------------------------- */

function SettingsSection({
  admin,
  userEmail,
  onSaved,
}: {
  admin: Admin;
  userEmail: string;
  onSaved: () => void;
}) {
  const supabase = createClient();

  const [name, setName] = useState(admin.name);
  const [phone, setPhone] = useState(admin.phone.replace("+966", ""));
  const [photoUrl, setPhotoUrl] = useState(admin.photo_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();

    if (phone.replace(/\D/g, "").length !== 9) {
      setError("Phone number must contain 9 digits after +966.");
      return;
    }

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("admins")
      .update({
        name: name.trim(),
        phone: `+966${phone.replace(/\D/g, "")}`,
        photo_url: photoUrl.trim() || null,
      })
      .eq("id", admin.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    onSaved();
  }

  return (
    <div className="max-w-2xl">
      <PageHeading
        eyebrow="Account"
        title="Admin Settings"
        description="Manage the public tournament administrator profile."
      />

      <form
        onSubmit={save}
        className="border border-white/10 bg-[#101010] p-6"
      >
        <div className="space-y-5">
          <Input label="Admin name" value={name} onChange={setName} />

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Account email
            </label>

            <input
              value={userEmail}
              disabled
              className="w-full border border-white/10 bg-black px-4 py-3 text-sm text-zinc-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
              Phone
            </label>

            <div className="flex">
              <div className="border border-r-0 border-white/10 bg-white/5 px-3 py-3 text-sm font-bold text-zinc-400">
                +966
              </div>

              <input
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))
                }
                className="min-w-0 flex-1 border border-white/10 bg-black px-4 py-3 text-sm outline-none focus:border-[#ff6b00]"
              />
            </div>
          </div>

          <Input
            label="Profile photo URL"
            value={photoUrl}
            onChange={setPhotoUrl}
            placeholder="https://..."
          />

          {error && <FormError text={error} />}

          <button
            disabled={saving}
            className="flex items-center gap-2 bg-[#ff6b00] px-5 py-3 text-xs font-black uppercase text-black transition hover:bg-[#ff8126] disabled:opacity-50"
          >
            <Save size={15} />
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------------------------- */
/* UI COMPONENTS */
/* -------------------------------------------------- */

function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <div className="text-xs font-black uppercase tracking-[0.25em] text-[#ff6b00]">
        {eyebrow}
      </div>

      <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">
        {title}
      </h1>

      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  button,
  onClick,
}: {
  eyebrow: string;
  title: string;
  description: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <PageHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <button
        onClick={onClick}
        className="mb-8 flex items-center justify-center gap-2 bg-[#ff6b00] px-5 py-3 text-xs font-black uppercase text-black transition hover:bg-[#ff8126]"
      >
        <Plus size={15} />
        {button}
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-3">
      <span className="text-zinc-600">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  onClick,
  danger = false,
}: {
  icon: typeof Pencil;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center border transition ${
        danger
          ? "border-red-500/10 text-zinc-600 hover:border-red-500/30 hover:text-red-400"
          : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-white"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-white/10 py-16 text-center text-sm text-zinc-600">
      {text}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  max,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  max?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        min={min}
        max={max}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff6b00]"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-[#ff6b00]"
      >
        <option value="">Select...</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormError({ text }: { text: string }) {
  return (
    <div className="border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {text}
    </div>
  );
}

function FormButtons({
  loading,
  onClose,
  label,
}: {
  loading: boolean;
  onClose: () => void;
  label: string;
}) {
  return (
    <div className="flex gap-3 pt-3">
      <button
        type="button"
        onClick={onClose}
        className="flex-1 border border-white/10 px-4 py-3 text-xs font-black uppercase text-zinc-400 transition hover:bg-white/5 hover:text-white"
      >
        Cancel
      </button>

      <button
        disabled={loading}
        className="flex flex-1 items-center justify-center gap-2 bg-[#ff6b00] px-4 py-3 text-xs font-black uppercase text-black transition hover:bg-[#ff8126] disabled:opacity-50"
      >
        <Save size={14} />
        {loading ? "Saving..." : label}
      </button>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto border border-white/10 bg-[#101010]">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-[#101010] px-6 py-5">
          <h2 className="text-lg font-black uppercase">{title}</h2>

          <button
            onClick={onClose}
            className="text-zinc-500 transition hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}