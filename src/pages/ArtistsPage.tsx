import { useMemo, useState } from "react";
import SongsTable from "../components/SongsTable";
import { getTopArtists } from "../lib/analytics";
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

  const col = (key: SortKey, label: string) => (
    <th
      className="cursor-pointer p-4 select-none whitespace-nowrap group"
      onClick={() => sortBy(key)}
    >
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
            <table className=" text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  {col("rank", "#")}
                  {col("artist", "Artist")}
                  {col("count", "Songs")}
                </tr>
              </thead>

              <tbody>
                {filteredArtists.map((artist) => {
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">{selectedArtist} 🎤</h2>
          <SongsTable key={selectedArtist || "all-artists"} tracks={artistTracks} />
        </div>
      </div>
    </div>
  );
}