import type { Track } from "../types";

export function parseDuration(duration: string) {
  const [m, s] = duration.split(":").map(Number);
  return m * 60 + s;
}

export function getOverviewStats(tracks: Track[]) {
  const totalSongs = tracks.length;
  const uniqueArtists = new Set(tracks.map((t) => t.artist)).size;

  const popularity = tracks.map((t) => t.popularity);
  const avgPopularity =
    popularity.reduce((a, b) => a + b, 0) / popularity.length;

  const explicitCount = tracks.filter((t) => t.explicit).length;

  const totalDuration = tracks
    .map((t) => parseDuration(t.duration))
    .reduce((a, b) => a + b, 0);

  return {
    totalSongs,
    uniqueArtists,
    avgPopularity: avgPopularity.toFixed(1),
    explicitCount,
    totalHours: (totalDuration / 3600).toFixed(1),
  };
}

export function getTopArtists(tracks: Track[]) {
  const counts = new Map<string, number>();

  tracks.forEach((track) => {
    counts.set(track.artist, (counts.get(track.artist) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTopYears(tracks: Track[]){
  const counts = new Map<string, number>();

  tracks.forEach((track) => {
    counts.set(track.releaseDate.split('-')[0], (counts.get(track.releaseDate.split('-')[0]) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.count - a.count || parseInt(b.year) - parseInt(a.year));
}

export function getGenres(tracks: Track[]) {
  const map = new Map<
    string,
    {
      genre: string;
      count: number;
      avgPopularity: number;
      explicitRate: number;
    }
  >();

  tracks.forEach((track) => {
    const current = map.get(track.genre) || {
      genre: track.genre,
      count: 0,
      avgPopularity: 0,
      explicitRate: 0,
    };

    current.count += 1;
    current.avgPopularity += track.popularity;
    if (track.explicit) current.explicitRate += 1;

    map.set(track.genre, current);
  });

  return [...map.values()].map((g) => ({
    ...g,
    avgPopularity: g.avgPopularity / g.count,
    explicitRate: (g.explicitRate / g.count) * 100,
  }));
}