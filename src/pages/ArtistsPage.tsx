import { useMemo, useState } from "react";
import SongsTable from "../components/SongsTable";
import { getTopArtists } from "../lib/analytics";
import { loadTracks } from "../lib/parseCsv";

export default function ArtistsPage() {
  const tracks = loadTracks();
  const artists = getTopArtists(tracks);

  const [selectedArtist, setSelectedArtist] = useState(
    artists[0]?.artist || ""
  );

  const artistTracks = useMemo(
    () => tracks.filter((t) => t.artist === selectedArtist),
    [tracks, selectedArtist]
  );

  return (
    <div>
      <h1 className="mb-6 text-4xl font-bold">Artists</h1>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-4 text-lg font-semibold">Top Artists</div>

          <div className="space-y-2 max-h-[80vh] overflow-auto pr-2">
            {artists.map((artist) => (
              <button
                key={artist.artist}
                onClick={() => setSelectedArtist(artist.artist)}
                className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                  selectedArtist === artist.artist
                    ? "bg-emerald-500 text-black"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >
                <div className="font-medium">{artist.artist}</div>
                <div className="text-sm opacity-70">{artist.count} songs</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold">
            {selectedArtist} 🎤
          </h2>

<SongsTable
  key={selectedArtist || "all-artists"}
  tracks={artistTracks}
/>
        </div>
      </div>
    </div>
  );
}