import Papa from "papaparse";
import csvFile from "../data/liked_songs_by_genre.csv?raw";
import type { Track } from "../types";

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