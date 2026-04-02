import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { loadTracks } from "../lib/parseCsv";

export default function PopularityPage() {
  const tracks = loadTracks();

  const buckets = [
    { name: "Hits",    value: tracks.filter((t) => t.popularity >= 80).length },
    { name: "Popular", value: tracks.filter((t) => t.popularity >= 60 && t.popularity < 80).length },
    { name: "Mid",     value: tracks.filter((t) => t.popularity >= 40 && t.popularity < 60).length },
    { name: "Niche",   value: tracks.filter((t) => t.popularity < 40).length },
  ];

  const sorted = [...tracks].sort((a, b) => b.popularity - a.popularity);
  const top10    = sorted.slice(0, 10);
  const bottom10 = sorted.slice(-10).reverse();

  const TrackList = ({ items, color }: { items: typeof tracks; color: string }) => (
    <div className="space-y-2">
      {items.map((t, i) => (
        <div key={`${t.artist}-${t.title}`} className="flex items-center gap-3">
          <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-500">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <a
              href={t.spotifyURL}
              target="_blank"
              rel="noreferrer"
              className="truncate font-medium transition hover:underline"
              style={{ color }}
            >
              {t.title}
            </a>
            <div className="truncate text-xs text-slate-400">{t.artist}</div>
          </div>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: `${color}20`, color }}
          >
            {t.popularity}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Popularity 📈</h1>
        <p className="mt-2 text-slate-400">
          Distribution of your liked songs by Spotify popularity score.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 text-xl font-semibold">Popularity Buckets</div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {buckets.map((_, index) => (
                  <Cell key={index} fill={["#10b981", "#3b82f6", "#f59e0b", "#ef4444"][index]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 text-lg font-semibold">🌍 Most Mainstream</div>
          <TrackList items={top10} color="#10b981" />
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 text-lg font-semibold">💎 Most Niche</div>
          <TrackList items={bottom10} color="#a78bfa" />
        </div>
      </div>
    </div>
  );
}