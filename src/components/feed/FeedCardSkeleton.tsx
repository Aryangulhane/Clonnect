import { Skeleton } from "@/components/ui/skeleton";

export function FeedCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full skeleton-shimmer" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28 skeleton-shimmer" />
          <Skeleton className="h-3 w-40 skeleton-shimmer" />
        </div>
      </div>
      <Skeleton className="h-5 w-3/4 skeleton-shimmer" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full skeleton-shimmer" />
        <Skeleton className="h-3 w-5/6 skeleton-shimmer" />
        <Skeleton className="h-3 w-2/3 skeleton-shimmer" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full skeleton-shimmer" />
        <Skeleton className="h-6 w-14 rounded-full skeleton-shimmer" />
        <Skeleton className="h-6 w-20 rounded-full skeleton-shimmer" />
      </div>
      <div className="flex justify-between pt-3 border-t border-border/20">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-16 skeleton-shimmer" />
          <Skeleton className="h-8 w-16 skeleton-shimmer" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 skeleton-shimmer" />
          <Skeleton className="h-8 w-8 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
