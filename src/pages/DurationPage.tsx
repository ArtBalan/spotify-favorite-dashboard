import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { loadTracks } from "../lib/parseCsv";
import { parseDuration } from "../lib/analytics";

export default function DurationPage() {
  const tracks = loadTracks();

  const durationBuckets = [
    {
      name: "< 2 min",
      value: tracks.filter((t) => parseDuration(t.duration) < 120).length,
    },
    {
      name: "2–3 min",
      value: tracks.filter((t) => {
        const d = parseDuration(t.duration);
        return d >= 120 && d < 180;
      }).length,
    },
    {
      name: "3–4 min",
      value: tracks.filter((t) => {
        const d = parseDuration(t.duration);
        return d >= 180 && d < 240;
      }).length,
    },
    {
      name: "4–5 min",
      value: tracks.filter((t) => {
        const d = parseDuration(t.duration);
        return d >= 240 && d < 300;
      }).length,
    },
    {
      name: "5–10 min",
      value: tracks.filter((t) => {
        const d = parseDuration(t.duration);
        return d >= 300 && d < 600;
      }).length,
    },
    {
      name: "> 10 min",
      value: tracks.filter((t) => parseDuration(t.duration) >= 600).length,
    },
  ];

  const totalSeconds = tracks
    .map((t) => parseDuration(t.duration))
    .reduce((a, b) => a + b, 0);

  const averageMinutes = (totalSeconds / tracks.length / 60).toFixed(2);
  const validTracks = tracks.filter(
    (t) => t.title && t.duration && t.duration.includes(":")
  );
  const shortestSong = [...validTracks].sort(
    (a, b) => parseDuration(a.duration) - parseDuration(b.duration)
  )[0];

  const longestSong = [...tracks].sort(
    (a, b) => parseDuration(b.duration) - parseDuration(a.duration)
  )[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Duration ⏱️</h1>
        <p className="mt-2 text-slate-400">
          Average duration and distribution of your liked songs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="text-slate-400">Average Song Length</div>
          <div className="mt-2 text-5xl font-bold">{averageMinutes} min</div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="text-slate-400">Total Listening Time</div>
          <div className="mt-2 text-5xl font-bold">
            {(totalSeconds / 3600).toFixed(1)} h
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="text-slate-400">Shortest Song</div>

          {shortestSong ? (
            <>
              <div className="mt-2 text-xl font-bold">
                <a
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
                  href={shortestSong.spotifyURL}>
                  {shortestSong.title}
                </a>
              </div>
              <div className="mt-1 text-slate-400">
                {shortestSong.artist} • {shortestSong.duration}
              </div>
            </>
          ) : (
            <div className="mt-2 text-slate-500">No song found</div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="text-slate-400">Longest Song</div>
          <div className="mt-2 text-xl font-bold">
            <a
              target="_blank"
              rel="noreferrer"
              className="font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
              href={longestSong.spotifyURL}>
              {longestSong.title}
            </a>
          </div>
          <div className="mt-1 text-slate-400">
            {longestSong.artist} • {longestSong.duration}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 text-xl font-semibold">Song Length Distribution</div>

        <div className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={durationBuckets}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px" }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[12, 12, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}