import { useMemo } from "react";
import { loadTracks } from "../lib/parseCsv";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

export default function ExplicitPage() {
  const tracks = loadTracks();

  const explicitTracks = tracks.filter((t) => t.explicit);
  const cleanTracks    = tracks.filter((t) => !t.explicit);
  const explicitPct    = ((explicitTracks.length / tracks.length) * 100).toFixed(1);

  // Top explicit artists
  const topExplicitArtists = useMemo(() => {
    const map = new Map<string, { total: number; explicit: number }>();
    for (const t of tracks) {
      const cur = map.get(t.artist) ?? { total: 0, explicit: 0 };
      cur.total++;
      if (t.explicit) cur.explicit++;
      map.set(t.artist, cur);
    }
    return [...map.entries()]
      .filter(([, v]) => v.explicit > 0)
      .map(([artist, v]) => ({ artist, ...v, rate: (v.explicit / v.total) * 100 }))
      .sort((a, b) => b.explicit - a.explicit)
      .slice(0, 10);
  }, [tracks]);

  // Top explicit genres
  const topExplicitGenres = useMemo(() => {
    const map = new Map<string, { total: number; explicit: number }>();
    for (const t of tracks) {
      const cur = map.get(t.genre) ?? { total: 0, explicit: 0 };
      cur.total++;
      if (t.explicit) cur.explicit++;
      map.set(t.genre, cur);
    }
    return [...map.entries()]
      .filter(([, v]) => v.explicit > 0)
      .map(([genre, v]) => ({ genre, ...v, rate: (v.explicit / v.total) * 100 }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 10);
  }, [tracks]);

  // Explicit over time (by month)
  const overTime = useMemo(() => {
    const map = new Map<string, { explicit: number; clean: number }>();
    for (const t of tracks) {
      if (!t.addedAt) continue;
      const [datePart] = t.addedAt.split("T");
      const [year, month] = datePart.split("-");
      const key = `${year}-${month}`;
      const cur = map.get(key) ?? { explicit: 0, clean: 0 };
      if (t.explicit) cur.explicit++;
      else cur.clean++;
      map.set(key, cur);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));
  }, [tracks]);

  // Top explicit tracks by popularity
  const topExplicitTracks = useMemo(() =>
    [...explicitTracks].sort((a, b) => b.popularity - a.popularity).slice(0, 10),
    [explicitTracks]
  );

const tooltipStyle = {
  contentStyle: { backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px" },
  labelStyle: { color: "#e2e8f0" },
  itemStyle: { color: "#e2e8f0" },
};

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Explicit Content 🔞</h1>

      {/* Overview stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total tracks",    value: tracks.length },
          { label: "Explicit",        value: `${explicitTracks.length} (${explicitPct}%)` },
          { label: "Clean",           value: cleanTracks.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top explicit artists */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 font-semibold">🎤 Most Explicit Artists</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topExplicitArtists} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="artist" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} width={110} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="explicit" name="Explicit songs" radius={[0, 6, 6, 0]}>
                {topExplicitArtists.map((_, i) => (
                  <Cell key={i} fill="#ef4444" fillOpacity={1 - i * 0.07} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top explicit genres by rate */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 font-semibold">🎸 Most Explicit Genres <span className="text-xs font-normal text-slate-500">(by % of genre)</span></div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topExplicitGenres} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="genre" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} width={110} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => `${v.toFixed(1)}%`} />
              <Bar dataKey="rate" name="Explicit rate" radius={[0, 6, 6, 0]}>
                {topExplicitGenres.map((_, i) => (
                  <Cell key={i} fill="#f59e0b" fillOpacity={1 - i * 0.07} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Explicit over time */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 font-semibold">📅 Explicit vs Clean Over Time</div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={overTime} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gradExplicit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradClean" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="clean"    name="Clean"    stroke="#10b981" strokeWidth={2} fill="url(#gradClean)"    dot={false} />
            <Area type="monotone" dataKey="explicit" name="Explicit" stroke="#ef4444" strokeWidth={2} fill="url(#gradExplicit)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top explicit tracks */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 font-semibold border-b border-slate-800">🔥 Top Explicit Tracks by Popularity</div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="p-4">#</th>
              <th className="p-4">Title</th>
              <th className="p-4">Artist</th>
              <th className="p-4">Genre</th>
              <th className="p-4">Popularity</th>
            </tr>
          </thead>
          <tbody>
            {topExplicitTracks.map((t, i) => (
              <tr key={`${t.artist}-${t.title}`} className="border-t border-slate-800 hover:bg-slate-800/50">
                <td className="p-4 text-slate-500 tabular-nums">{i + 1}</td>
                <td className="p-4">
                <a
                    href={t.spotifyURL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
                  >
                    {t.title}
                  </a>
                </td>
                <td className="p-4">{t.artist}</td>
                <td className="p-4 text-slate-400">{t.genre}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-700">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${t.popularity}%` }} />
                    </div>
                    <span>{t.popularity}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}