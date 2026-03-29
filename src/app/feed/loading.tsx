import { FeedCardSkeleton } from "@/components/feed/FeedCardSkeleton";

export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <FeedCardSkeleton key={i} />
      ))}
    </div>
  );
}
