export default function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3 text-ink-soft">
        <div
          className="w-8 h-8 rounded-full border-2 border-rose-soft border-t-rose animate-spin"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}
