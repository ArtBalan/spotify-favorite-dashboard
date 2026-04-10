import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Papa from "papaparse";

// Node 18+ has fetch built in.
dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
let REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN || "";

const CSV_FILE =  path.join(
  process.cwd(),
  "src/data/liked_songs_by_genre.csv"
);
const PLAYLIST_NAME = "Black Metal Tracks";
const PLAYLIST_DESCRIPTION = "Tracks from the CSV tagged as black metal";

async function getRefreshToken(): Promise<string> {
  if (REFRESH_TOKEN) {
    return REFRESH_TOKEN;
  }

  const redirectUri = "http://127.0.0.1:8888/callback";
  const scopes = ["playlist-modify-private", "user-read-private"];

  const authUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: scopes.join(" "),
    }).toString();

  console.log("Open this URL in your browser and authorize the app:");
  console.log(authUrl);

  const readline = await import("node:readline/promises");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const redirectedUrl = await rl.question(
    "http://127.0.0.1:8888/callback"
  );

  rl.close();

  const code = new URL(redirectedUrl).searchParams.get("code");

  if (!code) {
    throw new Error("No authorization code found in callback URL");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get refresh token: ${await response.text()}`);
  }

  const data = await response.json();

  REFRESH_TOKEN = data.refresh_token;

  console.log("Add this to your .env:");
  console.log(`SPOTIFY_REFRESH_TOKEN=${REFRESH_TOKEN}
`);

  return REFRESH_TOKEN;
}

async function getAccessToken(): Promise<string> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: await getRefreshToken(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

function isBlackMetal(row: any): boolean {
  const fields = [
    row["Genre"] || "",
    row["All Genres"] || "",
    row["Genre Source"] || "",
  ];

  return fields.some((value) =>
    value.toLowerCase().includes("black metal")
  );
}

function extractTrackUrisFromCsv(): string[] {
  const csv = fs.readFileSync(path.resolve(CSV_FILE), "utf-8");

  const parsed = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  const uris: string[] = [];

  for (const row of parsed.data as any[]) {
    if (!isBlackMetal(row)) continue;

    const spotifyUrl = (row["Spotify URL"] || "").trim();

    if (spotifyUrl.includes("/track/")) {
      const trackId = spotifyUrl
        .split("/track/")[1]
        .split("?")[0]
        .split("/")[0];

      uris.push(`spotify:track:${trackId}`);
    }
  }

  // Deduplicate while preserving order
  return [...new Set(uris)];
}

async function getCurrentUserId(headers: HeadersInit): Promise<string> {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${await response.text()}`);
  }

  const user = await response.json();
  return user.id;
}

async function createPlaylist(
  userId: string,
  headers: HeadersInit
): Promise<{ id: string; url: string }> {
  const response = await fetch(
    `https://api.spotify.com/v1/users/${userId}/playlists`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: PLAYLIST_NAME,
        description: PLAYLIST_DESCRIPTION,
        public: false,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to create playlist: ${await response.text()}`);
  }

  const playlist = await response.json();

  return {
    id: playlist.id,
    url: playlist.external_urls.spotify,
  };
}

async function getExistingTrackUris(
  playlistId: string,
  headers: HeadersInit
): Promise<Set<string>> {
  const existing = new Set<string>();
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

  while (url) {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch playlist tracks: ${await response.text()}`
      );
    }

    const data = await response.json();

    for (const item of data.items) {
      const uri = item?.track?.uri;
      if (uri) existing.add(uri);
    }

    url = data.next;
  }

  return existing;
}

async function addTracks(
  playlistId: string,
  uris: string[],
  headers: HeadersInit
) {
  for (let i = 0; i < uris.length; i += 100) {
    const chunk = uris.slice(i, i + 100);

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ uris: chunk }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add tracks: ${await response.text()}`);
    }
  }
}

async function main() {
  const accessToken = await getAccessToken();

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const csvTrackUris = extractTrackUrisFromCsv();
  console.log(`Found ${csvTrackUris.length} matching tracks in CSV`);

  const userId = await getCurrentUserId(headers);
  const playlist = await createPlaylist(userId, headers);

  console.log(`Created playlist: ${playlist.url}`);

  const existingTrackUris = await getExistingTrackUris(
    playlist.id,
    headers
  );

  const newTrackUris = csvTrackUris.filter(
    (uri) => !existingTrackUris.has(uri)
  );

  console.log(
    `Skipping ${csvTrackUris.length - newTrackUris.length} tracks already in playlist`
  );

  await addTracks(playlist.id, newTrackUris, headers);

  console.log(`Added ${newTrackUris.length} tracks`);
  console.log(`Playlist URL: ${playlist.url}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
