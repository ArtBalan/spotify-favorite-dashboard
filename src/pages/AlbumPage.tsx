import { useMemo, useState } from "react";
import SongsTable from "../components/SongsTable";
import { loadTracks } from "../lib/parseCsv";

type SortKey = "rank" | "album" | "count" | "year";

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

export default function AlbumsPage() {
  const tracks = loadTracks();

  const albums = useMemo(() => {
    const map = new Map<string, { album: string; artist: string; year: string; albumURL: string; count: number }>();
    for (const t of tracks) {
      if (!map.has(t.album)) {
        map.set(t.album, {
          album: t.album,
          artist: t.artist,
          year: t.releaseDate?.slice(0, 4) ?? "—",
          albumURL: t.albumURL ?? "",
          count: 0,
        });
      }
      map.get(t.album)!.count++;
    }
    return [...map.values()]
      .sort((a, b) => b.count - a.count)
      .map((a, i) => ({ ...a, rank: i + 1 }));
  }, [tracks]);

  const [selectedAlbum, setSelectedAlbum] = useState(albums[0]?.album ?? "");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

  function sortBy(key: SortKey) {
    if (sortKey === key) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDirection(key === "rank" ? "asc" : "desc");
    }
  }

  const sortedAlbums = useMemo(() => {
    const modifier = direction === "asc" ? 1 : -1;
    return [...albums].sort((a, b) => {
      if (sortKey === "album") return a.album.localeCompare(b.album) * modifier;
      if (sortKey === "year")  return a.year.localeCompare(b.year) * modifier;
      return (a[sortKey] - b[sortKey]) * modifier;
    });
  }, [albums, sortKey, direction]);

  const albumTracks = useMemo(
    () => tracks.filter((t) => t.album === selectedAlbum),
    [tracks, selectedAlbum]
  );

  const selected = albums.find((a) => a.album === selectedAlbum);

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
      <h1 className="mb-6 text-4xl font-bold">Albums 💿</h1>

      <div className="grid gap-6 lg:grid-cols-[480px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                {col("rank", "#")}
                {col("album", "Album")}
                {col("year", "Year")}
                {col("count", "Songs")}
              </tr>
            </thead>
            <tbody>
              {sortedAlbums.map((a) => (
                <tr
                  key={a.album}
                  onClick={() => setSelectedAlbum(a.album)}
                  className={`cursor-pointer border-t border-slate-800 transition hover:bg-slate-800 ${
                    selectedAlbum === a.album ? "bg-slate-800" : ""
                  }`}
                >
                  <td className="p-4 text-slate-500 tabular-nums">{a.rank}</td>
                  <td className="p-4">
                    <div className="font-medium">{a.album}</div>
                    <div className="text-xs text-slate-400">{a.artist}</div>
                  </td>
                  <td className="p-4 text-slate-400">{a.year}</td>
                  <td className="p-4">{a.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">
              {selected ? (
                <a
                  href={selected.albumURL}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-emerald-400 hover:underline"
                >
                  {selectedAlbum}
                </a>
              ) : selectedAlbum}
            </h2>
            {selected && (
              <div className="mt-1 text-sm text-slate-400">
                {selected.artist} · {selected.year} · {selected.count} track{selected.count !== 1 ? "s" : ""}
              </div>
            )}
          </div>
          <SongsTable key={selectedAlbum} tracks={albumTracks} />
        </div>
      </div>
    </div>
  );
}