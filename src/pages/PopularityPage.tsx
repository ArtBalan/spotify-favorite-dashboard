import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { loadTracks } from "../lib/parseCsv";

export default function PopularityPage() {
  const tracks = loadTracks();

  const buckets = [
    {
      name: "Hits",
      value: tracks.filter((t) => t.popularity >= 80).length,
    },
    {
      name: "Popular",
      value: tracks.filter(
        (t) => t.popularity >= 60 && t.popularity < 80
      ).length,
    },
    {
      name: "Mid",
      value: tracks.filter(
        (t) => t.popularity >= 40 && t.popularity < 60
      ).length,
    },
    {
      name: "Niche",
      value: tracks.filter((t) => t.popularity < 40).length,
    },
  ];

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

        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buckets}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {buckets.map((_, index) => (
                  <Cell
                    key={index}
                    fill={[
                      "#10b981",
                      "#3b82f6",
                      "#f59e0b",
                      "#ef4444",
                    ][index]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}