import { useMemo, useState } from "react";
import { loadTracks } from "../lib/parseCsv";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getCurrentStreak, getLongestStreak } from "../lib/Analytics";


type Granularity = "day" | "month" | "year";



export default function ActivityPage() {
  const tracks = loadTracks();
  const dayStreak  = getLongestStreak(tracks, "day");
  const weekStreak = getLongestStreak(tracks, "week");
  const currentDayStreak  = getCurrentStreak(tracks, "day");
  const currentWeekStreak = getCurrentStreak(tracks, "week");
  const [granularity, setGranularity] = useState<Granularity>("month");
  
  const data = useMemo(() => {
    const counts = new Map<string, number>();

    for (const track of tracks) {
      if (!track.addedAt) continue;
      const [datePart] = track.addedAt.split("T");
      const [year, month] = datePart.split("-");

      let key: string;
      if (granularity === "day") key = datePart;
      else if (granularity === "month") key = `${year}-${month}`;
      else key = year;

      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return [...counts.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [tracks, granularity]);

  const total = tracks.filter((t) => t.addedAt).length;
  const peak = data.reduce((a, b) => (b.count > a.count ? b : a), { date: "", count: 0 });
  const avg = Math.round(total / (data.length || 1));

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Listening Activity 📅</h1>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total liked", value: total },
          { label: "Peak period", value: `${peak.date} (${peak.count})` },
          { label: `Avg / ${granularity}`, value: avg },
          { label: "Longest day streak",  value: `${dayStreak.streak}d  (${dayStreak.from} → ${dayStreak.to})` },
          { label: "Longest week streak", value: `${weekStreak.streak}w (${weekStreak.from} → ${weekStreak.to})` },
          { label: "Current day streak",  value: `${currentDayStreak.streak}d` },
          { label: "Current week streak", value: `${currentWeekStreak.streak}w` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-medium">Songs added over time</span>
          <div className="flex gap-1 rounded-xl bg-slate-800 p-1 text-xs">
            {(["day", "month", "year"] as Granularity[]).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`rounded-lg px-3 py-1 transition capitalize ${granularity === g
                    ? "bg-emerald-500 text-black font-medium"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#e2e8f0" }}
              itemStyle={{ color: "#10b981" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorCount)"
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}