import { useMemo } from "react";
import { loadTracks } from "../lib/parseCsv";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

export default function DiscoveryPage() {
  const tracks = loadTracks();

  const enriched = useMemo(() => {
    return tracks
      .filter((t) => t.releaseDate && t.addedAt)
      .map((t) => {
        const releaseDate = new Date(t.releaseDate);
        const addedDate = new Date(t.addedAt);

        const releaseYear = releaseDate.getFullYear();
        const addedYear = addedDate.getFullYear();
        const ageAtAdd = addedYear - releaseYear;

        return {
          ...t,
          releaseDateObj: releaseDate,
          addedDateObj: addedDate,
          releaseYear,
          addedYear,
          ageAtAdd,
        };
      })
      .filter((t) => !isNaN(t.ageAtAdd));
  }, [tracks]);

  const avgAge = Math.round(
    enriched.reduce((sum, t) => sum + t.ageAtAdd, 0) / (enriched.length || 1)
  );

  const immediate = enriched.filter((t) => t.ageAtAdd <= 0);

  const lateDisc = enriched
    .filter((t) => t.ageAtAdd >= 5)
    .sort((a, b) => b.ageAtAdd - a.ageAtAdd);

  const top10Late = lateDisc.slice(0, 10);

  const top10Recent = [...enriched]
    .sort((a, b) => b.releaseDateObj.getTime() - a.releaseDateObj.getTime())
    .slice(0, 10);

  const scatterData = enriched.map((t) => ({
    x:
      t.releaseDateObj.getFullYear() +
      t.releaseDateObj.getMonth() / 12,
    y:
      t.addedDateObj.getFullYear() +
      t.addedDateObj.getMonth() / 12,
    age: t.ageAtAdd,
    title: t.title,
    artist: t.artist,
  }));

  function dotColor(age: number): string {
    if (age <= 0) return "#10b981";
    if (age <= 2) return "#3b82f6";
    if (age <= 5) return "#f59e0b";
    return "#ef4444";
  }

  function formatMonthTick(value: number) {
    const year = Math.floor(value);
    const month = Math.round((value - year) * 12);
    return `${year}-${String(month + 1).padStart(2, "0")}`;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const d = payload[0].payload;

    return (
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-xs shadow-xl">
        <div className="font-semibold text-white">{d.title}</div>
        <div className="text-slate-400">{d.artist}</div>
        <div className="mt-1 text-slate-300">
          Released: {formatMonthTick(d.x)} · Added: {formatMonthTick(d.y)}
        </div>
        <div className="mt-0.5" style={{ color: dotColor(d.age) }}>
          {d.age <= 0
            ? "Added immediately"
            : `${d.age} year${d.age !== 1 ? "s" : ""} later`}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">Discovery Timeline 🔍</h1>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Avg age when added",
            value: `${avgAge} year${avgAge !== 1 ? "s" : ""}`,
          },
          {
            label: "Added immediately (≤0y)",
            value: `${immediate.length} songs`,
          },
          {
            label: "Late discoveries (5y+)",
            value: `${lateDisc.length} songs`,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
          >
            <div className="text-xs text-slate-400">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-2 font-semibold">📊 Release Month vs Added Month</div>

        <div className="mb-4 flex items-center gap-4 text-xs text-slate-400">
          {[
            { color: "#10b981", label: "Just released (0y)" },
            { color: "#3b82f6", label: "Recent (1–2y)" },
            { color: "#f59e0b", label: "Moderate (3–5y)" },
            { color: "#ef4444", label: "Late discovery (5y+)" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

            <XAxis
              type="number"
              dataKey="x"
              domain={[2021, 2027]}
              tickCount={3}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatMonthTick}
              label={{
                value: "Release Month",
                position: "insideBottom",
                offset: -4,
                fill: "#64748b",
                fontSize: 11,
              }}
            />

            <YAxis
              type="number"
              dataKey="y"
              domain={[2021, 2027]}
              tickCount={3}
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatMonthTick}
              label={{
                value: "Added Month",
                angle: -90,
                position: "insideLeft",
                fill: "#64748b",
                fontSize: 11,
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Scatter data={scatterData} fillOpacity={0.7}>
              {scatterData.map((d, i) => (
                <Cell key={i} fill={dotColor(d.age)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 font-semibold border-b border-slate-800">
          ⏳ Top Late Discoveries
        </div>

        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="w-12 p-4">#</th>
              <th className="w-[40%] p-4">Title</th>
              <th className="w-[30%] p-4">Artist</th>
              <th className="w-24 p-4">Released</th>
              <th className="w-24 p-4">Added</th>
              <th className="w-20 p-4">Gap</th>
            </tr>
          </thead>

          <tbody>
            {top10Late.map((t, i) => (
              <tr
                key={`${t.artist}-${t.title}`}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >
                <td className="p-4 text-slate-500 tabular-nums">{i + 1}</td>
                <td className="p-4 truncate">
                  <a
                    href={t.spotifyURL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
                  >
                    {t.title}
                  </a>
                </td>
                <td className="p-4 truncate">{t.artist}</td>
                <td className="p-4 text-slate-400">{t.releaseYear}</td>
                <td className="p-4 text-slate-400">{t.addedYear}</td>
                <td className="p-4">
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                    +{t.ageAtAdd}y
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 font-semibold border-b border-slate-800">
          🆕 Top Most Recent Discoveries
        </div>

        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="w-12 p-4">#</th>
              <th className="w-[40%] p-4">Title</th>
              <th className="w-[30%] p-4">Artist</th>
              <th className="w-24 p-4">Released</th>
              <th className="w-24 p-4">Added</th>
              <th className="w-20 p-4">Gap</th>
            </tr>
          </thead>

          <tbody>
            {top10Recent.map((t, i) => (
              <tr
                key={`${t.artist}-${t.title}-recent`}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >
                <td className="p-4 text-slate-500 tabular-nums">{i + 1}</td>
                <td className="p-4 truncate">
                  <a
                    href={t.spotifyURL}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
                  >
                    {t.title}
                  </a>
                </td>
                <td className="p-4 truncate">{t.artist}</td>
                <td className="p-4 text-slate-400">{t.releaseYear}</td>
                <td className="p-4 text-slate-400">{t.addedYear}</td>
                <td className="p-4">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    {t.ageAtAdd <= 0 ? "New" : `+${t.ageAtAdd}y`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}