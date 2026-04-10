import { useMemo, useState } from "react";
import SongsTable from "../components/SongsTable";
import { getTopArtists, getArtistSparkline } from "../lib/Analytics";
import { loadTracks } from "../lib/parseCsv";

type SortKey = "rank" | "artist" | "count";

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span className={`ml-1.5 inline-flex flex-col gap-[2px] transition-opacity ${active ? "opacity-100" : "opacity-30"}`}>
      <svg width="8" height="5" viewBox="0 0 8 5" className={`transition-colors ${active && dir === "asc" ? "text-emerald-400" : "text-slate-500"}`}>
        <path d="M4 0L8 5H0L4 0Z" fill="currentColor" />
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5" className={`transition-colors ${active && dir === "desc" ? "text-emerald-400" : "text-slate-500"}`}>
        <path d="M4 5L0 0H8L4 5Z" fill="currentColor" />
      </svg>
    </span>
  );
}

/** Tiny inline sparkline shown in each table row */
function Sparkline({ data }: { data: { month: string; count: number }[] }) {
  if (data.length < 2) return null;

  const W = 64, H = 20;
  const max = Math.max(...data.map((d) => d.count), 1);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.count / max) * H;
    return `${x},${y}`;
  });

  const fillPts = [`0,${H}`, ...pts, `${W},${H}`].join(" ");

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="shrink-0" aria-hidden>
      <polygon points={fillPts} fill="rgb(52 211 153 / 0.15)" />
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="rgb(52 211 153)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Larger sparkline shown in the detail panel */
function SparklineExpanded({ data }: { data: { month: string; count: number }[] }) {
  const W = 600, H = 60;
  const max = Math.max(...data.map((d) => d.count), 1);

  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (d.count / max) * (H - 8),
    ...d,
  }));

  const polyPts = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const fillPts = [`0,${H}`, ...pts.map((p) => `${p.x},${p.y}`), `${W},${H}`].join(" ");
  const yearLabels = pts.filter((p) => p.month.endsWith("-01"));

  return (
    <div className="overflow-x-auto">
      <svg width="100%" viewBox={`0 0 ${W} ${H + 18}`} preserveAspectRatio="none" style={{ minWidth: "300px" }}>
        <polygon points={fillPts} fill="rgb(52 211 153 / 0.12)" />
        <polyline
          points={polyPts}
          fill="none"
          stroke="rgb(52 211 153)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.filter((p) => p.count > 0).map((p) => (
          <circle key={p.month} cx={p.x} cy={p.y} r="2.5" fill="rgb(52 211 153)" />
        ))}
        {yearLabels.map((p) => (
          <text key={p.month} x={p.x} y={H + 14} textAnchor="middle" fontSize="10" fill="rgb(100 116 139)">
            {p.month.slice(0, 4)}
          </text>
        ))}
      </svg>
    </div>
  );
}

export default function ArtistsPage() {
  const tracks = loadTracks();
  const artists = getTopArtists(tracks);

  const [selectedArtist, setSelectedArtist] = useState(artists[0]?.artist || "");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [query, setQuery] = useState("");

  function sortBy(key: SortKey) {
    if (sortKey === key) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDirection(key === "rank" ? "asc" : "desc");
    }
  }

  const sortedArtists = useMemo(() => {
    const modifier = direction === "asc" ? 1 : -1;
    return [...artists].map((a, i) => ({ ...a, rank: i + 1 })).sort((a, b) => {
      if (sortKey === "artist") return a.artist.localeCompare(b.artist) * modifier;
      return (a[sortKey] - b[sortKey]) * modifier;
    });
  }, [artists, sortKey, direction]);

  const filteredArtists = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return sortedArtists;
    return sortedArtists.filter((a) => a.artist.toLowerCase().includes(q));
  }, [sortedArtists, query]);

  const artistTracks = useMemo(
    () => tracks.filter((t) => t.artist === selectedArtist),
    [tracks, selectedArtist]
  );

  const sparklineData = useMemo(
    () => getArtistSparkline(tracks, selectedArtist),
    [tracks, selectedArtist]
  );

  const addedRange = useMemo(() => {
    const dates = artistTracks.filter((t) => t.addedAt).map((t) => t.addedAt).sort();
    if (dates.length === 0) return null;
    const fmt = (iso: string) =>
      new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    return dates.length === 1
      ? fmt(dates[0])
      : `${fmt(dates[0])} – ${fmt(dates[dates.length - 1])}`;
  }, [artistTracks]);

  const col = (key: SortKey, label: string) => (
    <th className="cursor-pointer p-4 select-none whitespace-nowrap group" onClick={() => sortBy(key)}>
      <span className="inline-flex items-center gap-0.5 transition-colors group-hover:text-slate-200">
        {label}
        <SortIcon active={sortKey === key} dir={direction} />
      </span>
    </th>
  );

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Artists</h1>

      <div className="grid gap-6 lg:grid-cols-[435px_1fr]">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search artists…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <table className="text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  {col("rank", "#")}
                  {col("artist", "Artist")}
                  {col("count", "Songs")}
                  <th className="p-4 text-slate-600 select-none">Added</th>
                </tr>
              </thead>
              <tbody>
                {filteredArtists.map((artist) => {
                  const sparkline = getArtistSparkline(tracks, artist.artist);
                  return (
                    <tr
                      key={artist.artist}
                      onClick={() => setSelectedArtist(artist.artist)}
                      className={`cursor-pointer border-t border-slate-800 transition hover:bg-slate-800 ${
                        selectedArtist === artist.artist ? "bg-slate-800" : ""
                      }`}
                    >
                      <td className="p-4 text-slate-500 tabular-nums">{artist.rank}</td>
                      <td className="p-4 font-medium">{artist.artist}</td>
                      <td className="p-4">{artist.count}</td>
                      <td className="p-4"><Sparkline data={sparkline} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-4">
            <h2 className="text-2xl font-semibold">{selectedArtist} 🎤</h2>
            {addedRange && (
              <span className="mb-0.5 text-sm text-slate-500">added {addedRange}</span>
            )}
          </div>

          {sparklineData.length >= 2 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">
                Songs added over time
              </p>
              <SparklineExpanded data={sparklineData} />
            </div>
          )}

          <SongsTable key={selectedArtist || "all-artists"} tracks={artistTracks} />
        </div>
      </div>
    </div>
  );
}