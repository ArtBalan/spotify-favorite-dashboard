import { useMemo, useState } from "react";
import SongsTable from "../components/SongsTable";
import { getGenres } from "../lib/Analytics";
import { loadTracks } from "../lib/parseCsv";

type SortKey = "genre" | "count" | "avgPopularity" | "explicitRate" | "share";

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

export default function GenresPage() {
  const tracks = loadTracks();
  const genres = getGenres(tracks);
  const total = tracks.length;

  const [selectedGenre, setSelectedGenre] = useState(genres[0]?.genre || "");
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  function sortBy(key: SortKey) {
    if (sortKey === key) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  }

  const sortedGenres = useMemo(() => {
    const modifier = direction === "asc" ? 1 : -1;
    return [...genres].sort((a, b) => {
      if (sortKey === "genre") return a.genre.localeCompare(b.genre) * modifier;
      // "share" sorts the same as "count" since share ∝ count
      if (sortKey === "share") return (a.count - b.count) * modifier;
      return (a[sortKey] - b[sortKey]) * modifier;
    });
  }, [genres, sortKey, direction]);

  const genreTracks = tracks.filter((t) => t.genre === selectedGenre);

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
      <h1 className="mb-6 text-4xl font-bold">Genres</h1>

      <div className="grid gap-6 lg:grid-cols-[580px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-4 text-slate-600">#</th>  {/* ← add */}
                {col("genre", "Genre")}
                {col("count", "Songs")}
                {col("share", "Share")}
                {col("avgPopularity", "Popularity")}
                {col("explicitRate", "Explicit %")}
              </tr>
            </thead>

            <tbody>
              {sortedGenres.map((genre,index) => {
                const share = (genre.count / total) * 100;
                return (
                  <tr
                    key={genre.genre}
                    onClick={() => setSelectedGenre(genre.genre)}
                    className={`cursor-pointer border-t border-slate-800 transition hover:bg-slate-800 ${
                      selectedGenre === genre.genre ? "bg-slate-800" : ""
                    }`}
                  >
                    <td className="p-4 text-slate-500 tabular-nums">{index + 1}</td>
                    <td className="p-4">{genre.genre}</td>
                    <td className="p-4">{genre.count}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                        <span className="text-slate-400">{share.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-4">{genre.avgPopularity.toFixed(1)}</td>
                    <td className="p-4">{genre.explicitRate.toFixed(0)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">{selectedGenre} 🎸</h2>
          <SongsTable key={selectedGenre || "all-genres"} tracks={genreTracks} />
        </div>
      </div>
    </div>
  );
}