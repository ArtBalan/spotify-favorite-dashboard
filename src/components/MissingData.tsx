export default function MissingData() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="text-5xl">🎵</div>
      <h2 className="text-2xl font-bold">No data found</h2>
      <p className="text-slate-400">Run the fetch script to generate your CSV:</p>
      <pre className="rounded-xl bg-slate-800 px-6 py-4 text-left text-sm text-emerald-400">
        npx ts-node src/scripts/fetchSpotify.ts
      </pre>
      <p className="text-xs text-slate-500">
        Then reload the page.
      </p>
    </div>
  );
}