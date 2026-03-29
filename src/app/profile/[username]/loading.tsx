export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="glass-card rounded-2xl p-8 space-y-4">
        <div className="flex gap-4">
          <div className="h-24 w-24 rounded-full skeleton-shimmer shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-6 w-48 skeleton-shimmer rounded" />
            <div className="h-4 w-32 skeleton-shimmer rounded" />
            <div className="h-4 w-72 skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
