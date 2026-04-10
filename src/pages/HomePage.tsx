import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { loadTracks } from "../lib/parseCsv";
import {
  getOverviewStats,
  getTopArtists,
  getGenres,
  getDecades,
  getLongestStreak,
} from "../lib/Analytics";

function StatCard({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function SectionLink({
  to,
  emoji,
  label,
  description,
}: {
  to: string;
  emoji: string;
  label: string;
  description: string;
}) {
  return (
    <NavLink
      to={to}
      className="group flex flex-col gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-emerald-500/50 hover:bg-slate-800"
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <span className="font-medium text-slate-100 group-hover:text-emerald-400 transition">
          {label}
        </span>
      </div>
      <p className="text-sm text-slate-500">{description}</p>
    </NavLink>
  );
}

export default function HomePage() {
  const tracks = useMemo(() => loadTracks(), []);
  const stats = useMemo(() => getOverviewStats(tracks), [tracks]);
  const topArtists = useMemo(() => getTopArtists(tracks).slice(0, 5), [tracks]);
  const topGenres = useMemo(() => getGenres(tracks).slice(0, 5), [tracks]);
  const decades = useMemo(() => getDecades(tracks), [tracks]);
  const longestStreak = useMemo(() => getLongestStreak(tracks, "day"), [tracks]);

  const mostRecentTrack = useMemo(() =>
    [...tracks].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())[0],
    [tracks]
  );

  const topDecade = decades[0];

  return (
    <div className="flex flex-col gap-10 pb-10">

      {/* Hero */}
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold">🎵 Your Music, Visualized</h1>
        <p className="text-slate-400 text-lg">
          {stats.totalSongs} songs · {stats.uniqueArtists} artists · {stats.totalHours} hours of music
        </p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Songs" value={stats.totalSongs} />
        <StatCard title="Artists" value={stats.uniqueArtists} sub={`${(Number(stats.totalSongs) / Number(stats.uniqueArtists)).toFixed(1)} songs per artist`} />
        <StatCard title="Avg popularity" value={`${stats.avgPopularity}/100`} />
        <StatCard title="Explicit" value={`${((stats.explicitCount / Number(stats.totalSongs)) * 100).toFixed(1)}%`} sub={`${stats.explicitCount} songs`} />
        <StatCard title="Longest streak" value={`${longestStreak.streak} days`} sub={longestStreak.from ? `${longestStreak.from} → ${longestStreak.to}` : undefined} />
      </div>

      {/* Top artists + top genres */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top artists</h2>
            <NavLink to="/artists" className="text-xs text-emerald-400 hover:underline">
              See all →
            </NavLink>
          </div>
          <ol className="flex flex-col gap-3">
            {topArtists.map((a, i) => (
              <li key={a.artist} className="flex items-center gap-3">
                <span className="w-5 text-right text-sm tabular-nums text-slate-600">{i + 1}</span>
                <span className="flex-1 truncate text-sm font-medium text-slate-200">{a.artist}</span>
                <span className="text-sm text-slate-500">{a.count} songs</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top genres</h2>
            <NavLink to="/genres" className="text-xs text-emerald-400 hover:underline">
              See all →
            </NavLink>
          </div>
          <ol className="flex flex-col gap-3">
            {topGenres.map((g, i) => {
              const pct = (g.count / Number(stats.totalSongs)) * 100;
              return (
                <li key={g.genre} className="flex items-center gap-3">
                  <span className="w-5 text-right text-sm tabular-nums text-slate-600">{i + 1}</span>
                  <span className="flex-1 truncate text-sm font-medium text-slate-200">{g.genre}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-700">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{pct.toFixed(1)}%</span>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Fun facts row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {topDecade && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-1">Favourite decade</p>
            <p className="text-2xl font-bold">{topDecade.decade}</p>
            <p className="text-sm text-slate-400 mt-1">{topDecade.count} songs · {topDecade.share.toFixed(1)}% of library</p>
          </div>
        )}
        {mostRecentTrack && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-1">Last added</p>
            <a
              href={mostRecentTrack.spotifyURL}
              target="_blank"
              rel="noreferrer"
              className="text-base font-semibold text-emerald-400 hover:underline line-clamp-1"
            >
              {mostRecentTrack.title}
            </a>
            <p className="text-sm text-slate-400 mt-1">{mostRecentTrack.artist}</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {new Date(mostRecentTrack.addedAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
        )}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500 mb-1">Library size</p>
          <p className="text-2xl font-bold">{stats.totalHours}h</p>
          <p className="text-sm text-slate-400 mt-1">
            {Math.floor(Number(stats.totalHours) / 24)} days of non-stop music
          </p>
        </div>
      </div>

      {/* Quick navigation */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-300">Explore</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SectionLink to="/favorites"  emoji="❤️"  label="Favorites"   description="All your liked songs, sorted by most recently added" />
          <SectionLink to="/artists"    emoji="🎤"  label="Artists"     description="Ranked artists with add-over-time sparklines" />
          <SectionLink to="/genres"     emoji="🎸"  label="Genres"      description="Genre breakdown with popularity and explicit stats" />
          <SectionLink to="/albums"     emoji="💿"  label="Albums"      description="Albums you have the most songs from" />
          <SectionLink to="/popularity" emoji="📈"  label="Popularity"  description="Hits, mid-tier, and niche tracks in your library" />
          <SectionLink to="/discovery"  emoji="🔭"  label="Discovery"   description="How long it took you to find each song" />
          <SectionLink to="/activity"   emoji="📅"  label="Activity"    description="When you added songs, streaks, and peak days" />
          <SectionLink to="/decades"    emoji="🕰️"  label="Decades"     description="Your library bucketed by decade with top artists and songs" />
        </div>
      </div>

    </div>
  );
}