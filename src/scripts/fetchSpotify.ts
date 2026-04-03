import "dotenv/config";
import SpotifyWebApi from "spotify-web-api-node";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as url from "url";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPES = ["user-library-read", "playlist-read-private"];
const FETCH_PLAYLISTS = false; // true = all playlists + liked, false = liked only


const OUTPUT_FILE = path.join(
  process.cwd(),
  "src/data/liked_songs_by_genre.csv"
);

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌ Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET in .env");
  process.exit(1);
}

const spotify = new SpotifyWebApi({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
});

interface TrackInfo {
  title: string;
  artist: string;
  artistId: string;
  artistUrl: string;
  album: string;
  albumId: string;
  albumUrl: string;
  releaseDate: string;
  durationMs: number;
  popularity: number;
  explicit: boolean;
  trackNumber: number;
  isrc: string;
  spotifyUrl: string;
  previewUrl: string;
  addedAt: string;
  genres: string[];
  genreSource: "artist" | "album" | "related_artists" | "artist_search" | "none";
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeCsv(value: unknown): string {
  const text = String(value ?? "");

  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

async function authenticate(): Promise<void> {
  const authUrl = spotify.createAuthorizeURL(SCOPES, "spotify-export-state");

  console.log("\n🎵 Open this URL in your browser:\n");
  console.log(authUrl);
  console.log("\nWaiting for authorization...\n");

  const code = await waitForCode();
  const auth = await spotify.authorizationCodeGrant(code);

  spotify.setAccessToken(auth.body.access_token);
  spotify.setRefreshToken(auth.body.refresh_token);

  console.log("✅ Authenticated\n");
}

function waitForCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsed = url.parse(req.url ?? "", true);

      if (parsed.pathname === "/callback" && typeof parsed.query.code === "string") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h1>Authorization successful. You may close this tab.</h1>");

        server.close();
        resolve(parsed.query.code);
        return;
      }

      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Missing authorization code");
    });

    server.listen(8888, "127.0.0.1");
    server.on("error", reject);
  });
}

function buildTrackInfo(
  track: SpotifyApi.TrackObjectFull,
  addedAt: string
): TrackInfo {
  return {
    title: track.name,
    artist: track.artists.map(artist => artist.name).join(", "),
    artistId: track.artists[0]?.id ?? "",
    artistUrl: track.artists[0]?.external_urls?.spotify ?? "",
    album: track.album.name,
    albumId: track.album.id ?? "",
    albumUrl: track.album.external_urls?.spotify ?? "",
    releaseDate: track.album.release_date ?? "",
    durationMs: track.duration_ms,
    popularity: track.popularity,
    explicit: track.explicit,
    trackNumber: track.track_number,
    isrc: track.external_ids?.isrc ?? "",
    spotifyUrl: track.external_urls?.spotify ?? "",
    previewUrl: track.preview_url ?? "",
    addedAt,
    genres: [],
    genreSource: "none",
  };
}

async function fetchLikedSongs(): Promise<TrackInfo[]> {
  const tracks: TrackInfo[] = [];
  let offset = 0;

  const firstPage = await spotify.getMySavedTracks({ limit: 1 });
  const total = firstPage.body.total;

  while (true) {
    const response = await spotify.getMySavedTracks({
      limit: 50,
      offset,
    });

    if (response.body.items.length === 0) {
      break;
    }

    for (const item of response.body.items) {
      tracks.push(buildTrackInfo(item.track, item.added_at ?? ""));
    }

    process.stdout.write(`\r📥 Liked songs: ${tracks.length}/${total}`);

    offset += 50;

    if (response.body.items.length < 50) {
      break;
    }

    await sleep(100);
  }

  console.log(" ✅\n");
  return tracks;
}

async function fetchPlaylistSongs(): Promise<TrackInfo[]> {
  const tracks: TrackInfo[] = [];
  const playlists: SpotifyApi.PlaylistObjectSimplified[] = [];

  let playlistOffset = 0;

  while (true) {
    const response = await spotify.getUserPlaylists({
      limit: 50,
      offset: playlistOffset,
    });

    playlists.push(...response.body.items);

    if (response.body.items.length < 50) {
      break;
    }

    playlistOffset += 50;
    await sleep(100);
  }

  console.log(`📂 Found ${playlists.length} playlists\n`);

  for (const playlist of playlists) {
    if (!playlist.id) continue;

    console.log(`📥 Fetching playlist: ${playlist.name}`);

    let trackOffset = 0;

    while (true) {
      const response = await spotify.getPlaylistTracks(playlist.id, {
        limit: 100,
        offset: trackOffset,
      });

      for (const item of response.body.items) {
        const track = item.track;

        if (!track || track.type !== "track") {
          continue;
        }

        tracks.push(
          buildTrackInfo(track as SpotifyApi.TrackObjectFull, item.added_at ?? "")
        );
      }

      if (response.body.items.length < 100) {
        break;
      }

      trackOffset += 100;
      await sleep(100);
    }
  }

  return tracks;
}

async function enrichWithGenres(tracks: TrackInfo[]): Promise<void> {
  const artistIds = [...new Set(tracks.map(track => track.artistId).filter(Boolean))];

  console.log(`🎸 Step 1/4 — Artist genres (${artistIds.length} artists)`);

  const artistGenres = new Map<string, string[]>();

  for (let i = 0; i < artistIds.length; i += 50) {
    const batch = artistIds.slice(i, i + 50);
    const response = await spotify.getArtists(batch);

    for (const artist of response.body.artists) {
      if (artist) {
        artistGenres.set(artist.id, artist.genres ?? []);
      }
    }

    process.stdout.write(`\r  ${Math.min(i + 50, artistIds.length)}/${artistIds.length}`);
    await sleep(100);
  }

  console.log(" ✅\n");

  for (const track of tracks) {
    const genres = artistGenres.get(track.artistId) ?? [];

    if (genres.length > 0) {
      track.genres = genres;
      track.genreSource = "artist";
    }
  }

  const missingAfterArtist = tracks.filter(track => track.genres.length === 0);
  const albumIds = [...new Set(missingAfterArtist.map(track => track.albumId).filter(Boolean))];

  console.log(`🎸 Step 2/4 — Album genres (${albumIds.length} albums)`);

  const albumGenres = new Map<string, string[]>();

  for (let i = 0; i < albumIds.length; i += 20) {
    const batch = albumIds.slice(i, i + 20);
    const response = await spotify.getAlbums(batch);

    for (const album of response.body.albums) {
      if (album?.id && album.genres?.length) {
        albumGenres.set(album.id, album.genres);
      }
    }

    process.stdout.write(`\r  ${Math.min(i + 20, albumIds.length)}/${albumIds.length}`);
    await sleep(100);
  }

  console.log(" ✅\n");

  for (const track of tracks) {
    if (track.genres.length > 0) continue;

    const genres = albumGenres.get(track.albumId) ?? [];

    if (genres.length > 0) {
      track.genres = genres;
      track.genreSource = "album";
    }
  }

  const missingAfterAlbum = tracks.filter(track => track.genres.length === 0);

  console.log(
    `🎸 Step 3/4 — Related artist inference (${missingAfterAlbum.length} tracks)`
  );

  const inferredGenres = new Map<string, string[]>();

  for (let i = 0; i < missingAfterAlbum.length; i++) {
    const track = missingAfterAlbum[i];

    if (!track.artistId || inferredGenres.has(track.artistId)) {
      continue;
    }

    try {
      const response = await spotify.getArtistRelatedArtists(track.artistId);
      const counts = new Map<string, number>();

      for (const related of response.body.artists) {
        for (const genre of related.genres) {
          counts.set(genre, (counts.get(genre) ?? 0) + 1);
        }
      }

      const topGenres = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);

      inferredGenres.set(track.artistId, topGenres);
    } catch {
      inferredGenres.set(track.artistId, []);
    }

    process.stdout.write(`\r  ${i + 1}/${missingAfterAlbum.length}`);
    await sleep(120);
  }

  console.log(" ✅\n");

  for (const track of tracks) {
    if (track.genres.length > 0) continue;

    const genres = inferredGenres.get(track.artistId) ?? [];

    if (genres.length > 0) {
      track.genres = genres;
      track.genreSource = "related_artists";
    }
  }

  const missingAfterRelated = tracks.filter(track => track.genres.length === 0);

  console.log(`🎸 Step 4/4 — Artist search fallback (${missingAfterRelated.length} tracks)`);

  for (let i = 0; i < missingAfterRelated.length; i++) {
    const track = missingAfterRelated[i];

    try {
      const response = await spotify.searchArtists(track.artist, { limit: 1 });
      const genres = response.body.artists?.items?.[0]?.genres ?? [];

      if (genres.length > 0) {
        track.genres = genres;
        track.genreSource = "artist_search";
      } else {
        track.genres = ["Unknown"];
        track.genreSource = "none";
      }
    } catch {
      track.genres = ["Unknown"];
      track.genreSource = "none";
    }

    process.stdout.write(`\r  ${i + 1}/${missingAfterRelated.length}`);
    await sleep(120);
  }

  console.log(" ✅\n");
}

function writeCsv(tracks: TrackInfo[]): void {
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

  const sorted = [...tracks].sort((a, b) => {
    const genreA = (a.genres[0] ?? "Unknown").toLowerCase();
    const genreB = (b.genres[0] ?? "Unknown").toLowerCase();

    if (genreA !== genreB) {
      return genreA.localeCompare(genreB);
    }

    return a.artist.localeCompare(b.artist);
  });

  const header = [
    "Genre",
    "All Genres",
    "Genre Source",
    "Title",
    "Artist",
    "Artist URL",
    "Album",
    "Album URL",
    "Release Date",
    "Duration",
    "Popularity",
    "Explicit",
    "Track Number",
    "ISRC",
    "Added At",
    "Spotify URL",
    "Preview URL",
  ].join(",");

  const rows = sorted.map(track => {
    return [
      escapeCsv(track.genres[0] ?? "Unknown"),
      escapeCsv(track.genres.join(" | ")),
      escapeCsv(track.genreSource),
      escapeCsv(track.title),
      escapeCsv(track.artist),
      escapeCsv(track.artistUrl),
      escapeCsv(track.album),
      escapeCsv(track.albumUrl),
      escapeCsv(track.releaseDate),
      escapeCsv(formatDuration(track.durationMs)),
      escapeCsv(track.popularity),
      escapeCsv(track.explicit ? "Yes" : "No"),
      escapeCsv(track.trackNumber),
      escapeCsv(track.isrc),
      escapeCsv(track.addedAt),
      escapeCsv(track.spotifyUrl),
      escapeCsv(track.previewUrl),
    ].join(",");
  });

  fs.writeFileSync(OUTPUT_FILE, [header, ...rows].join("\n"), "utf8");

  const genreCounts = new Map<string, number>();

  for (const track of tracks) {
    const genre = track.genres[0] ?? "Unknown";
    genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
  }

  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log("📊 Top 10 Genres:\n");

  for (const [genre, count] of topGenres) {
    console.log(`${genre.padEnd(30)} ${String(count).padStart(4)}`);
  }

  console.log(`\n✅ CSV written to ${OUTPUT_FILE}`);
}

async function main(): Promise<void> {
  console.log("🎵 Spotify liked songs exporter\n");

  await authenticate();

  let tracks = await fetchLikedSongs();

  if (FETCH_PLAYLISTS) {
    const playlistTracks = await fetchPlaylistSongs();

    const seen = new Set<string>();

    tracks = [...tracks, ...playlistTracks].filter(track => {
      if (seen.has(track.spotifyUrl)) {
        return false;
      }

      seen.add(track.spotifyUrl);
      return true;
    });

    console.log(`🔀 Deduplicated to ${tracks.length} tracks\n`);
  }

  await enrichWithGenres(tracks);
  writeCsv(tracks);
}

main().catch(error => {
  console.error("\n❌ Fatal error:\n");
  console.error(error);
  process.exit(1);
});