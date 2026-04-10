import { useMemo, useState } from "react";
import { loadTracks } from "../lib/parseCsv";
import FavoritesSongsTable from "../components/FavoritesSongsTable";

const PAGE_SIZE = 50;
export default function FavoritesPage() {
  const [page, setPage] = useState(1);
  const sorted = useMemo(() => {
    return loadTracks().sort(
      (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    );
  }, []);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <div>
      <h1 className="mb-2 text-4xl font-bold">Favorites</h1>
      <p className="mb-6 text-slate-400 text-sm">
        {sorted.length} songs · sorted by most recently added
      </p>
      <FavoritesSongsTable tracks={paginated} />
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-xl px-4 py-2 text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition">
            ← Prev
          </button>
          <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-xl px-4 py-2 text-sm bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}