import Papa from "papaparse";
import type { Track } from "../types";

// src/lib/parseCsv.ts
const modules = import.meta.glob("../data/liked_songs_by_genre.csv", {
  query: "?raw",
  eager: true,
}) as Record<string, { default: string }>;

const csvFile = modules["../data/liked_songs_by_genre.csv"]?.default ?? "";

export function hasData(): boolean {
  return csvFile.trim().length > 0;
}

export function loadTracks(): Track[] {
  const result = Papa.parse<string[]>(csvFile, {
    skipEmptyLines: true,
  });

  const rows = result.data.slice(1);

  return rows.map((r: any) => ({
    genre: r[0] || "Unknown",
    allGenres: (r[1] || "").split(" | "),
    genreSource: r[2] || "",
    title: r[3] || "",
    artist: r[4] || "",
    artistURL: r[5] || "",
    album: r[6] || "",
    albumURL: r[7] || "",
    releaseDate: r[8] || "",
    duration: r[9] || "",
    popularity: Number(r[10]) || 0,
    explicit: r[11] === "Yes",
    trackNbr: Number(r[12]) || 0,
    ISRC: r[13] || "",
    addedAt: r[14] || "",
    spotifyURL: r[15] || "",
    previewURL: r[16] || "",
  }));
}