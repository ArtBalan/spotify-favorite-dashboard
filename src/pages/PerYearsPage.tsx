import { useMemo, useState } from "react";
import SongsTable from "../components/SongsTable";
import { getTopYears } from "../lib/analytics";
import { loadTracks } from "../lib/parseCsv";

export default function PerYearsPage() {
  const tracks = loadTracks();
  const years = getTopYears(tracks);
  const total = tracks.length;

  const [selectedYear, setSelectedYear] = useState(years[0]?.year || "");

  const yearTrack = useMemo(
    () => tracks.filter((t) => t.releaseDate.split("-")[0] === selectedYear),
    [tracks, selectedYear]
  );

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Years 📅</h1>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-4 text-slate-600">#</th>
                <th className="p-4">Year</th>
                <th className="p-4">Songs</th>
                <th className="p-4">Share</th>
              </tr>
            </thead>

            <tbody>
              {years.map((year, i) => {
                const share = (year.count / total) * 100;
                return (
                  <tr
                    key={year.year}
                    onClick={() => setSelectedYear(year.year)}
                    className={`cursor-pointer border-t border-slate-800 transition hover:bg-slate-800 ${
                      selectedYear === year.year ? "bg-slate-800" : ""
                    }`}
                  >
                    <td className="p-4 text-slate-500 tabular-nums">{i + 1}</td>
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