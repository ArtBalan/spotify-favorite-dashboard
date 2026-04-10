import { useMemo, useState } from "react";
import { getDecades } from "../lib/Analytics";
import { loadTracks } from "../lib/parseCsv";
import SongsTable from "../components/SongsTable";

export default function DecadesPage() {
  const tracks = loadTracks();
  const decades = useMemo(() => getDecades(tracks), []);
  const [selectedDecade, setSelectedDecade] = useState(decades[0]?.decadeStart ?? 0);

  const decadeTracks = useMemo(
    () => tracks.filter((t) => {
      const year = parseInt(t.releaseDate.split("-")[0]);
      return Math.floor(year / 10) * 10 === selectedDecade;
    }),
    [tracks, selectedDecade]
  );

  const selected = decades.find((d) => d.decadeStart === selectedDecade);
  const maxCount = Math.max(...decades.map((d) => d.count));

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Decades 🕰️</h1>

      <div className="grid gap-6 lg:grid-cols-[480px_1fr]">

        {/* Left: decade list */}
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="p-4">Decade</th>
                <th className="p-4">Songs</th>
                <th className="p-4">Share</th>
                <th className="p-4">Avg pop.</th>
              </tr>
            </thead>
            <tbody>
              {decades.map((d) => (
                <tr
                  key={d.decade}
                  onClick={() => setSelectedDecade(d.decadeStart)}
                  className={`cursor-pointer border-t border-slate-800 transition hover:bg-slate-800 ${
                    selectedDecade === d.decadeStart ? "bg-slate-800" : ""
                  }`}
                >
                  <td className="p-4 font-semibold text-slate-100">{d.decade}</td>
                  <td className="p-4">{d.count}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${(d.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-slate-400">{d.share.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{d.avgPopularity.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: decade detail */}
        {selected && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-semibold">{selected.decade}</h2>

            {/* Top artists + top songs cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">
                  Top artists
                </p>
                <ol className="flex flex-col gap-2">
                  {selected.topArtists.map((a, i) => (
                    <li key={a.artist} className="flex items-center gap-3">
                      <span className="w-5 text-right text-sm tabular-nums text-slate-600">
                        {i + 1}
                      </span>
                      <span className="flex-1 truncate text-sm font-medium text-slate-200">
                        {a.artist}
                      </span>
                      <span className="text-sm text-slate-500">{a.count}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-slate-500">
                  Top songs
                </p>
                <ol className="flex flex-col gap-2">
                  {selected.topTracks.map((t, i) => (
                    <li key={t.title} className="flex items-center gap-3">
                      <span className="w-5 text-right text-sm tabular-nums text-slate-600">
                        {i + 1}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <a
                          href={t.spotifyURL}
                          target="_blank"
                          rel="noreferrer"
                          className="truncate text-sm font-medium text-emerald-400 hover:underline"
                        >
                          {t.title}
                        </a>
                        <span className="truncate text-xs text-slate-500">{t.artist}</span>
                      </div>
                      <span className="text-sm text-slate-500">{t.popularity}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* All songs in decade */}
            <SongsTable tracks={decadeTracks} />
          </div>
        )}
      </div>
    </div>
  );
}