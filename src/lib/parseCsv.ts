import Papa from "papaparse";
import csvFile from "../data/liked_songs_by_genre.csv?raw";
import type { Track } from "../types";

export function loadTracks(): Track[] {
  const result = Papa.parse<string[]>(csvFile, {
    skipEmptyLines: true,
  });

  const rows = result.data.slice(1);

  return rows.map((r) => ({
    genre: r[0] || "Unknown",
    allGenres: (r[1] || "").split(" | "),
    genreSource: r[2] || "",
    title: r[3] || "",
    artist: r[4] || "",
    album: r[5] || "",
    releaseDate: r[6] || "",
    duration: r[7] || "",
    popularity: Number(r[8]) || 0,
    explicit: r[9] === "Yes",
  }));
}