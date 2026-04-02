import "dotenv/config";
import SpotifyWebApi from "spotify-web-api-node";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as url from "url";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPES = ["user-library-read"];
const OUTPUT_FILE = path.join(process.cwd(), "./src/data/liked_songs_by_genre.csv");

const spotify = new SpotifyWebApi({ clientId: CLIENT_ID, clientSecret: CLIENT_SECRET, redirectUri: REDIRECT_URI });

const FETCH_PLAYLISTS = false; // true = all playlists + liked, false = liked only

async function authenticate(): Promise<void> {
  const authUrl = spotify.createAuthorizeURL(SCOPES, "state");
  console.log("\n🎵 Open this URL in your browser:\n");
  console.log(authUrl);
  console.log("\nWaiting for authorization...\n");
  const code = await waitForCode();
  const data = await spotify.authorizationCodeGrant(code);
  spotify.setAccessToken(data.body.access_token);
  spotify.setRefreshToken(data.body.refresh_token);
  console.log("✅ Authenticated!\n");
}

function waitForCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsed = url.parse(req.url || "", true);
      if (parsed.pathname === "/callback" && parsed.query.code) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end("<h1>✅ Done! You can close this tab.</h1>");
        server.close();
        resolve(parsed.query.code as string);
      } else { res.writeHead(400); res.end("Bad request"); reject(new Error("No code")); }
    });
    server.listen(8888, () => {});
    server.on("error", reject);
  });
}

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
  genreSource: string;
}

async function fetchAllPlaylistSongs(): Promise<TrackInfo[]> {
  const tracks: TrackInfo[] = [];
  // Get all playlists
  let offset = 0;
  const playlists: SpotifyApi.PlaylistObjectSimplified[] = [];
  while (true) {
    const res = await spotify.getUserPlaylists({ limit: 50, offset });
    playlists.push(...res.body.items);
    if (res.body.items.length < 50) break;
    offset += 50;
    await sleep(100);
  }
  console.log(`📂 Found ${playlists.length} playlists\n`);

  for (const playlist of playlists) {
    process.stdout.write(`📥 Fetching: ${playlist.name}`);
    let pOffset = 0;
    while (true) {
      const res = await spotify.getPlaylistTracks(playlist.id, { limit: 100, offset: pOffset });
      for (const item of res.body.items) {
        const t = item.track as SpotifyApi.TrackObjectFull;
        if (!t || t.type !== "track") continue;
        tracks.push({
          title: t.name,
          artist: t.artists.map((a) => a.name).join(", "),
          artistId: t.artists[0]?.id ?? "",
          artistUrl: t.artists[0]?.external_urls?.spotify ?? "",
          album: t.album.name,
          albumId: t.album.id,
          albumUrl: t.album.external_urls?.spotify ?? "",
          releaseDate: t.album.release_date ?? "",
          durationMs: t.duration_ms,
          popularity: t.popularity,
          explicit: t.explicit,
          trackNumber: t.track_number,
          isrc: (t.external_ids as any)?.isrc ?? "",
          spotifyUrl: t.external_urls?.spotify ?? "",
          previewUrl: t.preview_url ?? "",
          addedAt: item.added_at ?? "",
          genres: [],
          genreSource: "",
        });
      }
      if (res.body.items.length < 100) break;
      pOffset += 100;
      await sleep(100);
    }
    console.log(` (${tracks.length} total so far)`);
  }

  return tracks;
}


async function fetchAllLikedSongs(): Promise<TrackInfo[]> {
  const tracks: TrackInfo[] = [];
  let offset = 0;
  const first = await spotify.getMySavedTracks({ limit: 1, offset: 0 });
  const total = first.body.total;
  process.stdout.write(`📥 Fetching liked songs (0 / ${total})`);
  while (true) {
    const res = await spotify.getMySavedTracks({ limit: 50, offset });
    const items = res.body.items;
    if (items.length === 0) break;
    for (const item of items) {
      const t = item.track;
      tracks.push({
        title: t.name,
        artist: t.artists.map(a => a.name).join(", "),
        artistId: t.artists[0]?.id ?? "",
        artistUrl: t.artists[0]?.external_urls?.spotify ?? "",
        album: t.album.name,
        albumId: t.album.id,
        albumUrl: t.album.external_urls?.spotify ?? "",
        releaseDate: t.album.release_date ?? "",
        durationMs: t.duration_ms,
        popularity: t.popularity,
        explicit: t.explicit,
        trackNumber: t.track_number,
        isrc: (t.external_ids as any)?.isrc ?? "",
        spotifyUrl: t.external_urls?.spotify ?? "",
        previewUrl: t.preview_url ?? "",
        addedAt: item.added_at,
        genres: [],
        genreSource: "",
      });
    }
    offset += 50;
    process.stdout.write(`\r📥 Fetching liked songs (${tracks.length} / ${total})`);
    if (items.length < 50) break;
    await sleep(100);
  }
  console.log(`\r📥 Fetching liked songs (${tracks.length} / ${total}) ✅\n`);
  return tracks;
}

async function enrichWithGenres(tracks: TrackInfo[]): Promise<void> {
  // Step 1: artist genres
  const artistIds = [...new Set(tracks.map(t => t.artistId).filter(Boolean))];
  const artistGenres = new Map<string, string[]>();
  console.log(`🎸 Step 1/3 — Artist genres (${artistIds.length} artists)...`);
  for (let i = 0; i < artistIds.length; i += 50) {
    const res = await spotify.getArtists(artistIds.slice(i, i + 50));
    for (const a of res.body.artists) { if (a) artistGenres.set(a.id, a.genres); }
    process.stdout.write(`\r  ${Math.min(i + 50, artistIds.length)} / ${artistIds.length}`);
    await sleep(100);
  }
  console.log(" ✅\n");
  for (const t of tracks) {
    const g = artistGenres.get(t.artistId) ?? [];
    if (g.length > 0) { t.genres = g; t.genreSource = "artist"; }
  }

  // Step 2: album genres fallback
  const unknown2 = tracks.filter(t => t.genres.length === 0);
  const albumIds = [...new Set(unknown2.map(t => t.albumId).filter(Boolean))];
  const albumGenres = new Map<string, string[]>();
  if (albumIds.length > 0) {
    console.log(`🎸 Step 2/3 — Album genres (${unknown2.length} unclassified songs)...`);
    for (let i = 0; i < albumIds.length; i += 20) {
      const res = await spotify.getAlbums(albumIds.slice(i, i + 20));
      for (const a of res.body.albums) { if (a?.genres?.length) albumGenres.set(a.id, a.genres); }
      process.stdout.write(`\r  ${Math.min(i + 20, albumIds.length)} / ${albumIds.length}`);
      await sleep(100);
    }
    console.log(" ✅\n");
    for (const t of tracks) {
      if (t.genres.length === 0) {
        const g = albumGenres.get(t.albumId) ?? [];
        if (g.length > 0) { t.genres = g; t.genreSource = "album"; }
      }
    }
  } else { console.log("🎸 Step 2/3 — Skipped ✅\n"); }

  // Step 3: related artists fallback
  const unknown3 = tracks.filter(t => t.genres.length === 0);
  const relatedArtistIds = [...new Set(unknown3.map(t => t.artistId).filter(Boolean))];
  if (relatedArtistIds.length > 0) {
    console.log(`🎸 Step 3/3 — Related artists inference (${unknown3.length} songs remaining)...`);
    const relatedGenres = new Map<string, string[]>();
    let done = 0;
    for (const artistId of relatedArtistIds) {
      try {
        const res = await spotify.getArtistRelatedArtists(artistId);
        const freq = new Map<string, number>();
        for (const g of res.body.artists.flatMap(a => a.genres))
          freq.set(g, (freq.get(g) ?? 0) + 1);
        const top = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([g]) => g);
        if (top.length > 0) relatedGenres.set(artistId, top);
      } catch { /* ignore */ }
      done++;
      process.stdout.write(`\r  ${done} / ${relatedArtistIds.length}`);
      await sleep(120);
    }
    console.log(" ✅\n");
    for (const t of tracks) {
      if (t.genres.length === 0) {
        const g = relatedGenres.get(t.artistId) ?? [];
        t.genres = g.length > 0 ? g : ["Unknown"];
        t.genreSource = g.length > 0 ? "related_artists" : "none";
      }
    }
  } else {
    console.log("🎸 Step 3/3 — Skipped ✅\n");
    for (const t of tracks) if (t.genres.length === 0) { t.genres = ["Unknown"]; t.genreSource = "none"; }
  }
}

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function escapeCsv(v: string): string {
  const s = String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCSV(tracks: TrackInfo[]): void {
  const sorted = [...tracks].sort((a, b) => {
    const ga = (a.genres[0] ?? "").toLowerCase(), gb = (b.genres[0] ?? "").toLowerCase();
    return ga !== gb ? ga.localeCompare(gb) : a.artist.localeCompare(b.artist);
  });

  const header =
  "Genre,All Genres,Genre Source,Title,Artist,Artist URL,Album,Album URL,Release Date,Duration,Popularity,Explicit,Track #,ISRC,Added At,Spotify URL,Preview URL";
const rows = sorted.map(t => [
  escapeCsv(t.genres[0] ?? "Unknown"),
  escapeCsv(t.genres.join(" | ")),
  escapeCsv(t.genreSource),
  escapeCsv(t.title),
  escapeCsv(t.artist),
  escapeCsv(t.artistUrl),
  escapeCsv(t.album),
  escapeCsv(t.albumUrl),
  escapeCsv(t.releaseDate),
  escapeCsv(formatDuration(t.durationMs)),
  escapeCsv(String(t.popularity)),
  escapeCsv(t.explicit ? "Yes" : "No"),
  escapeCsv(String(t.trackNumber)),
  escapeCsv(t.isrc),
  escapeCsv(t.addedAt),
  escapeCsv(t.spotifyUrl),
  escapeCsv(t.previewUrl),
].join(","));

  fs.writeFileSync(OUTPUT_FILE, [header, ...rows].join("\n"), "utf-8");

  const counts = new Map<string, number>();
  for (const t of tracks) counts.set(t.genres[0], (counts.get(t.genres[0]) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const max = top[0]?.[1] ?? 1;

  console.log("📊 Top 10 genres:");
  for (const [g, c] of top)
    console.log(`  ${g.padEnd(32)} ${String(c).padStart(4)}  ${"█".repeat(Math.round((c / max) * 20))}`);

  const src = { artist: 0, album: 0, related_artists: 0, none: 0 } as Record<string, number>;
  for (const t of tracks) src[t.genreSource] = (src[t.genreSource] ?? 0) + 1;
  console.log("\n📌 Genre source breakdown:");
  console.log(`  Artist           : ${src.artist}`);
  console.log(`  Album            : ${src.album}`);
  console.log(`  Related artists  : ${src.related_artists}`);
  console.log(`  Unknown          : ${src.none}`);
  console.log(`\n✅ CSV saved to: ${OUTPUT_FILE}`);
  console.log(`   Songs: ${tracks.length} | Genres: ${counts.size}\n`);
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log("🎵 Spotify Liked Songs → CSV\n");
  if (!CLIENT_ID || !CLIENT_SECRET) { console.error("❌ Missing credentials in .env"); process.exit(1); }
  await authenticate();

  let tracks: TrackInfo[];
  if (FETCH_PLAYLISTS) {
    const [liked, playlists] = await Promise.all([
      fetchAllLikedSongs(),
      fetchAllPlaylistSongs(),
    ]);
    // Deduplicate by spotifyUrl
    const seen = new Set<string>();
    tracks = [...liked, ...playlists].filter((t) => {
      if (seen.has(t.spotifyUrl)) return false;
      seen.add(t.spotifyUrl);
      return true;
    });
    console.log(`\n🔀 Merged & deduplicated: ${tracks.length} unique tracks\n`);
  } else {
    tracks = await fetchAllLikedSongs();
  }

  await enrichWithGenres(tracks);
  writeCSV(tracks);
}

main().catch(err => { console.error("❌", err.message ?? err); process.exit(1); });