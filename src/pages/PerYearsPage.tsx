import { useMemo, useState } from "react";
import SongsTable from "../components/SongsTable";
import { getTopYears } from "../lib/analytics";
import { loadTracks } from "../lib/parseCsv";

export default function PerYearsPage() {
  const tracks = loadTracks();
  const years = getTopYears(tracks);

  const [selectedYear, setSelectedYear] = useState(
    years[0]?.year || ""
  );

  const yearTrack = useMemo(
    () => tracks.filter((t) => t.releaseDate.split('-')[0] === selectedYear),
    [tracks, selectedYear]
  );

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Years 📅</h1>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-4 text-lg font-semibold">Top Years</div>

          <div className="space-y-2 max-h-[80vh] overflow-auto pr-2">
            {years.map((year,i) => (
              <button
                key={year.year}
                onClick={() => setSelectedYear(year.year)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                  selectedYear === year.year
                    ? "bg-emerald-500 text-black"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                <div className="font-medium">{i+1} : {year.year}</div>
                <div className="text-sm opacity-70">{year.count} songs</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">
            {selectedYear} 🎤
          </h2>

<SongsTable
  key={selectedYear || "all-artists"}
  tracks={yearTrack}
/>
        </div>
      </div>
    </div>
  );
}