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
import type { Track } from "../types";

type Granularity = "day" | "month" | "year";

function Modal({ date, tracks, onClose }: { date: string; tracks: Track[]; onClose: () => void }) {
  const genreCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tracks) {
      counts.set(t.genre, (counts.get(t.genre) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [tracks]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <div className="font-semibold text-white">{date}</div>
            <div className="text-xs text-slate-400">{tracks.length} song{tracks.length !== 1 ? "s" : ""} added</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-700 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-[1fr_180px] h-[60vh] ">
          {/* Track list */}
          <div className="overflow-y-auto border-r border-slate-800">
            {tracks.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-500 text-sm">No songs added on this date.</div>
            ) : (
              tracks.map((t, i) => (
                <div
                  key={`${t.artist}-${t.title}-${i}`}
                  className="flex items-center gap-3 border-t border-slate-800 px-4 py-3"
                >
                  <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={t.spotifyURL}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate block font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
                    >
                      {t.title}
                    </a>
                    <div className="truncate text-xs text-slate-400">{t.artist}</div>
                    <div className="truncate text-xs text-slate-500">{t.genre}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                    {t.popularity}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Genre counts */}
          <div className="overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-400 border-b border-slate-800">
              Genres
            </div>
            {genreCounts.map(([genre, count]) => (
              <div
                key={genre}
                className="flex items-center justify-between border-t border-slate-800 px-4 py-2 gap-2"
              >
                <span className="truncate text-xs text-slate-300">{genre}</span>
                <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityPage() {
  const tracks = loadTracks();
  const dayStreak = getLongestStreak(tracks, "day");
  const weekStreak = getLongestStreak(tracks, "week");
  const currentDayStreak = getCurrentStreak(tracks, "day");
  const currentWeekStreak = getCurrentStreak(tracks, "week");

  const [granularity, setGranularity] = useState<Granularity>("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState("");

  function toKey(datePart: string): string {
    const [year, month] = datePart.split("-");
    if (granularity === "day") return datePart;
    if (granularity === "month") return `${year}-${month}`;
    return year;
  }

  function getKeyFromInput(input: string): string {
    if (!input) return "";
    if (granularity === "year") return input;
    if (granularity === "month") return input; // already "YYYY-MM"
    return input; // already "YYYY-MM-DD"
  }

  const tracksByKey = useMemo(() => {
    const map = new Map<string, Track[]>();
    for (const track of tracks) {
      if (!track.addedAt) continue;
      const [datePart] = track.addedAt.split("T");
      const key = toKey(datePart);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(track);
    }
    return map;
  }, [tracks, granularity]);

  const data = useMemo(() =>
    [...tracksByKey.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, t]) => ({ date, count: t.length })),
    [tracksByKey]
  );

  const total = tracks.filter((t) => t.addedAt).length;
  const peak = data.reduce((a, b) => (b.count > a.count ? b : a), { date: "", count: 0 });
  const avg = Math.round(total / (data.length || 1));

  const modalTracks = selectedDate ? (tracksByKey.get(selectedDate) ?? []) : [];

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Listening Activity 📅</h1>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: "Total liked", value: total },
          { label: "Peak period", value: `${peak.date} (${peak.count})` },
          { label: `Avg / ${granularity}`, value: avg },
          { label: "Longest day streak", value: `${dayStreak.streak}d (${dayStreak.from} → ${dayStreak.to})` },
          { label: "Longest week streak", value: `${weekStreak.streak}w (${weekStreak.from} → ${weekStreak.to})` },
          { label: "Current day streak", value: `${currentDayStreak.streak}d` },
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
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="font-medium">
            Songs added over time
            <span className="ml-2 text-xs text-slate-500">click a point to see tracks</span>
          </span>

          <div className="flex items-center gap-2">
            {/* Manual date picker */}
            <div className="flex items-center gap-1">
              <input
                type={granularity === "year" ? "number" : granularity === "month" ? "month" : "date"}
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  const key = getKeyFromInput(e.target.value);
                  if (key) setSelectedDate(key);
                }}
                className="rounded-xl bg-slate-800 px-3 py-1 text-xs text-slate-300 outline-none transition focus:ring-1 focus:ring-emerald-500"
              />
              {filterDate && (
                <button
                  onClick={() => { setFilterDate(""); setSelectedDate(null); }}
                  className="rounded-xl bg-slate-800 px-2 py-1 text-xs text-slate-400 transition hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Granularity switcher */}
            <div className="flex gap-1 rounded-xl bg-slate-800 p-1 text-xs">
              {(["day", "month", "year"] as Granularity[]).map((g) => (
                <button
                  key={g}
                  onClick={() => { setGranularity(g); setFilterDate(""); setSelectedDate(null); }}
                  className={`rounded-lg px-3 py-1 transition capitalize ${
                    granularity === g ? "bg-emerald-500 text-black font-medium" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={340}>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            onClick={(e) => { if (e?.activeLabel) setSelectedDate(e.activeLabel); }}
            style={{ cursor: "pointer" }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px" }}
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
              activeDot={{ r: 5, fill: "#10b981", cursor: "pointer" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {selectedDate && (
        <Modal
          date={selectedDate}
          tracks={modalTracks}
          onClose={() => { setSelectedDate(null); setFilterDate(""); }}
        />
      )}
    </div>
  );
}