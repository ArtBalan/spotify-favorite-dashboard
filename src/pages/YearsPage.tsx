import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { loadTracks } from "../lib/parseCsv";

export default function YearsPage() {
  const tracks = loadTracks();

  const yearMap = new Map<number, number>();

  tracks.forEach((track) => {
    const year = Number(track.releaseDate?.slice(0, 4));

    if (!year || Number.isNaN(year)) return;

    yearMap.set(year, (yearMap.get(year) || 0) + 1);
  });

  const yearData = [...yearMap.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);

  const oldest = yearData[0]?.year;
  const newest = yearData[yearData.length - 1]?.year;

  const oldestSong = tracks.find(
    (track) => Number(track.releaseDate?.slice(0, 4)) === oldest
  );

  const newestSong = tracks.find(
    (track) => Number(track.releaseDate?.slice(0, 4)) === newest
  );

  const mostCommon = [...yearData].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Years 📅</h1>
        <p className="mt-2 text-slate-400">
          Release year distribution of your liked songs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="text-slate-400">Oldest Song Year</div>
          <div className="mt-2 text-5xl font-bold">{oldest}</div>
          {oldestSong && (
            <div className="mt-3 text-sm text-slate-400">
              <div className="font-medium text-white">{oldestSong.title}</div>
              <div>{oldestSong.artist}</div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="text-slate-400">Newest Song Year</div>
          <div className="mt-2 text-5xl font-bold">{newest}</div>
          {newestSong && (
            <div className="mt-3 text-sm text-slate-400">
              <div className="font-medium text-white">{newestSong.title}</div>
              <div>{newestSong.artist}</div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <div className="text-slate-400">Most Common Year</div>
          <div className="mt-2 text-5xl font-bold">{mostCommon?.year}</div>
          <div className="mt-2 text-slate-400">
            {mostCommon?.count} songs
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 text-xl font-semibold">Songs by Release Year</div>

        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearData}>
              <XAxis
                dataKey="year"
                stroke="#94a3b8"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px", fontSize: "12px" }}
                labelStyle={{ color: "#e2e8f0" }}
                itemStyle={{ color: "#e2e8f0" }}
              />
              <Bar
                dataKey="count"
                fill="#8b5cf6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}