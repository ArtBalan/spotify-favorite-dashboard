import { useMemo, useState } from "react";
import { loadTracks } from "../lib/parseCsv";
import FavoritesSongsTable from "../components/FavoritesSongsTable";

const PAGE_SIZE = 50;

export default function FavoritesPage() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const sorted = useMemo(() => {
    return loadTracks().sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return sorted;
    return sorted.filter((t) =>
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      t.album.toLowerCase().includes(q) ||
      t.genre.toLowerCase().includes(q)
    );
  }, [sorted, query]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <h1 className="mb-2 text-4xl font-bold">Favorites</h1>
      <p className="mb-4 text-slate-400 text-sm">
        {filtered.length} / {sorted.length} songs · sorted by most recently added
      </p>

      <input
        type="text"
        placeholder="Search by title, artist, album or genre…"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(1); }}
        className="mb-6 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
      />

      <FavoritesSongsTable tracks={paginated} />

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl px-4 py-2 text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ← Prev
          </button>

          <span className="text-sm text-slate-400">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-xl px-4 py-2 text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}