import { useMemo, useState } from "react";
import SongsTable from "../components/SongsTable";
import { getTopYears } from "../lib/analytics";
import { loadTracks } from "../lib/parseCsv";

type SortKey = "rank" | "year" | "count" | "share";

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

export default function PerYearsPage() {
  const tracks = loadTracks();
  const years = getTopYears(tracks);
  const total = tracks.length;

  const [selectedYear, setSelectedYear] = useState(years[0]?.year || "");
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

  const sortedYears = useMemo(() => {
    const modifier = direction === "asc" ? 1 : -1;
    return [...years].map((y, i) => ({ ...y, rank: i + 1 })).sort((a, b) => {
      if (sortKey === "year") return a.year.localeCompare(b.year) * modifier;
      if (sortKey === "share") return (a.count - b.count) * modifier;
      return (a[sortKey] - b[sortKey]) * modifier;
    });
  }, [years, sortKey, direction]);

  const yearTrack = useMemo(
    () => tracks.filter((t) => t.releaseDate.split("-")[0] === selectedYear),
    [tracks, selectedYear]
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
      <h1 className="mb-6 text-4xl font-bold">Years 📅</h1>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                {col("rank", "#")}
                {col("year", "Year")}
                {col("count", "Songs")}
                {col("share", "Share")}
              </tr>
            </thead>

            <tbody>
              {sortedYears.map((year) => {
                const share = (year.count / total) * 100;
                return (
                  <tr
                    key={year.year}
                    onClick={() => setSelectedYear(year.year)}
                    className={`cursor-pointer border-t border-slate-800 transition hover:bg-slate-800 ${
                      selectedYear === year.year ? "bg-slate-800" : ""
                    }`}
                  >
                    <td className="p-4 text-slate-500 tabular-nums">{year.rank}</td>
                    <td className="p-4 font-medium">{year.year}</td>
                    <td className="p-4">{year.count}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">{selectedYear} 🎤</h2>
          <SongsTable key={selectedYear || "all-years"} tracks={yearTrack} />
        </div>
      </div>
    </div>
  );
}