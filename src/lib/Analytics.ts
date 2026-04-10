import type { Track } from "../types";

export function parseDuration(duration: string) {
  const [m, s] = duration.split(":").map(Number);
  return m * 60 + s;
}

export function getLongestStreak(tracks: Track[], unit: "day" | "week"): {
  streak: number;
  from: string;
  to: string;
} {
  const dates = [...new Set(
    tracks
      .filter((t) => t.addedAt)
      .map((t) => {
        const [datePart] = t.addedAt.split("T");
        if (unit === "day") return datePart;
        const [year, month, day] = datePart.split("-").map(Number);
        const d = new Date(year, month - 1, day);
        const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() - (dayOfWeek - 1));
        return monday.toISOString().slice(0, 10);
      })
  )].sort();

  if (dates.length === 0) return { streak: 0, from: "", to: "" };

  let best = 1, bestStart = 0, bestEnd = 0;
  let current = 1, currentStart = 0;

  const msPerUnit = unit === "day" ? 86400_000 : 7 * 86400_000;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]).getTime();
    const curr = new Date(dates[i]).getTime();
    if (curr - prev === msPerUnit) {
      current++;
      if (current > best) {
        best = current;
        bestStart = currentStart;
        bestEnd = i;
      }
    } else {
      current = 1;
      currentStart = i;
    }
  }

  return { streak: best, from: dates[bestStart], to: dates[bestEnd] };
}

export function getCurrentStreak(tracks: Track[], unit: "day" | "week"): {
  streak: number;
  from: string;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toUnitKey = (datePart: string): string => {
    if (unit === "day") return datePart;
    const [year, month, day] = datePart.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (dayOfWeek - 1));
    return monday.toISOString().slice(0, 10);
  };

  const todayKey = toUnitKey(today.toISOString().slice(0, 10));

  const dates = [...new Set(
    tracks
      .filter((t) => t.addedAt)
      .map((t) => toUnitKey(t.addedAt.split("T")[0]))
  )].sort().reverse();

  if (dates.length === 0 || dates[0] !== todayKey) return { streak: 0, from: "" };

  const msPerUnit = unit === "day" ? 86400_000 : 7 * 86400_000;
  let streak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]).getTime();
    const curr = new Date(dates[i]).getTime();
    if (prev - curr === msPerUnit) streak++;
    else break;
  }

  return { streak, from: dates[streak - 1] };
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

export function getTopYears(tracks: Track[]) {
  const counts = new Map<string, number>();

  tracks.forEach((track) => {
    counts.set(track.releaseDate.split("-")[0], (counts.get(track.releaseDate.split("-")[0]) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.count - a.count || parseInt(b.year) - parseInt(a.year))
    .sort((a, b) => b.count - a.count)
    .map((g, index) => ({ ...g, rank: index + 1 }));
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

  return [...map.values()]
    .map((g) => ({
      ...g,
      avgPopularity: g.avgPopularity / g.count,
      explicitRate: (g.explicitRate / g.count) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .map((g, index) => ({ ...g, rank: index + 1 }));
}

// ── NEW: Decades ────────────────────────────────────────────────────────────

export interface DecadeStat {
  decade: string;        // e.g. "1980s"
  decadeStart: number;   // e.g. 1980
  count: number;
  share: number;         // 0-100
  avgPopularity: number;
  topArtists: { artist: string; count: number }[];
  topTracks: { title: string; artist: string; popularity: number; spotifyURL: string }[];
}

export function getDecades(tracks: Track[]): DecadeStat[] {
  const map = new Map<number, Track[]>();

  tracks.forEach((t) => {
    const year = parseInt(t.releaseDate.split("-")[0]);
    if (isNaN(year)) return;
    const decade = Math.floor(year / 10) * 10;
    if (!map.has(decade)) map.set(decade, []);
    map.get(decade)!.push(t);
  });

  const total = tracks.length;

  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([decadeStart, ts]) => {
      const artistCounts = new Map<string, number>();
      ts.forEach((t) => artistCounts.set(t.artist, (artistCounts.get(t.artist) ?? 0) + 1));
      const topArtists = [...artistCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([artist, count]) => ({ artist, count }));

      const topTracks = [...ts]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 3)
        .map((t) => ({ title: t.title, artist: t.artist, popularity: t.popularity, spotifyURL: t.spotifyURL }));

      const avgPopularity =
        ts.reduce((sum, t) => sum + t.popularity, 0) / ts.length;

      return {
        decade: `${decadeStart}s`,
        decadeStart,
        count: ts.length,
        share: (ts.length / total) * 100,
        avgPopularity,
        topArtists,
        topTracks,
      };
    });
}

// ── NEW: Artist sparkline ────────────────────────────────────────────────────

/** Returns monthly add counts for a given artist, sorted chronologically. */
export function getArtistSparkline(
  tracks: Track[],
  artist: string
): { month: string; count: number }[] {
  const map = new Map<string, number>();

  tracks
    .filter((t) => t.artist === artist && t.addedAt)
    .forEach((t) => {
      const month = t.addedAt.slice(0, 7); // "YYYY-MM"
      map.set(month, (map.get(month) ?? 0) + 1);
    });

  if (map.size === 0) return [];

  // Fill in missing months between first and last
  const keys = [...map.keys()].sort();
  const [firstYear, firstMonth] = keys[0].split("-").map(Number);
  const [lastYear, lastMonth] = keys[keys.length - 1].split("-").map(Number);

  const result: { month: string; count: number }[] = [];
  let y = firstYear, m = firstMonth;
  while (y < lastYear || (y === lastYear && m <= lastMonth)) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    result.push({ month: key, count: map.get(key) ?? 0 });
    m++;
    if (m > 12) { m = 1; y++; }
  }

  return result;
}