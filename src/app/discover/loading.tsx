export default function DiscoverLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="h-8 w-48 skeleton-shimmer rounded mb-6" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-full skeleton-shimmer" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 skeleton-shimmer rounded" />
                <div className="h-3 w-48 skeleton-shimmer rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
