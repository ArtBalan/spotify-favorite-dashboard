import type { Track } from "../types";

export default function SongsTable({ tracks }: { tracks: Track[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-950 text-slate-400">
          <tr>
            <th className="p-4">Title</th>
            <th className="p-4">Album</th>
            <th className="p-4">Artist</th> 
            <th className="p-4">Release</th>
            <th className="p-4">Popularity</th>
            <th className="p-4">Duration</th>
          </tr>
        </thead>

        <tbody>
          {tracks.map((track) => (
            <tr
              key={`${track.artist}-${track.title}`}
              className="border-t border-slate-800 hover:bg-slate-800/50"
            >
              <td className="px-4 py-3">
  <a
    href={track.spotifyUrl}
    target="_blank"
    rel="noreferrer"
    className="font-medium text-emerald-400 transition hover:text-emerald-300 hover:underline"
  >
    {track.title}
  </a>
</td>
              <td className="px-4 py-3">
  <a
    href={`https://open.spotify.com/search/${encodeURIComponent(track.album)}`}
    target="_blank"
    rel="noreferrer"
    className="text-slate-300 transition hover:text-white hover:underline"
  >
    {track.album}
  </a>
</td>
              <td className="p-4">{track.artist}</td>
              <td className="p-4 text-slate-400">{track.releaseDate}</td>
              <td className="p-4">{track.popularity}</td>
              <td className="p-4">{track.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}