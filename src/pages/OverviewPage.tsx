import StatCard from "../components/StatCard";
import { loadTracks } from "../lib/parseCsv";
import { getOverviewStats } from "../lib/Analytics";

export default function OverviewPage() {
  const stats = getOverviewStats(loadTracks());

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Songs" value={stats.totalSongs} />
        <StatCard title="Artists" value={stats.uniqueArtists} />
        <StatCard title="Avg Popularity" value={stats.avgPopularity} />
        <StatCard title="Explicit Songs" value={stats.explicitCount} />
        <StatCard title="Total Hours" value={stats.totalHours} />
      </div>
    </div>
  );
}