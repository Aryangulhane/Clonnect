"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  TrendingUp, Hash, Sparkles, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PostComposer } from "@/components/feed/PostComposer";
import { FeedCard, type FeedCardProps } from "@/components/feed/FeedCard";
import { FeedCardSkeleton } from "@/components/feed/FeedCardSkeleton";
import { SkillGapWidget } from "@/components/feed/SkillGapWidget";
import { cn } from "@/lib/utils";

const FEED_TABS = [
  { key: "foryou", label: "For You" },
  { key: "campus", label: "Campus" },
  { key: "following", label: "Following" },
  { key: "resources", label: "Resources" },
];

const TRENDING_TAGS = [
  "React", "Machine Learning", "Hackathon", "Python", "NextJS",
  "System Design", "Interview Prep", "AI", "Docker",
];

async function fetchFeed({ pageParam, tab }: { pageParam?: string; tab: string }) {
  const params = new URLSearchParams();
  if (pageParam) params.set("cursor", pageParam);
  params.set("tab", tab);
  params.set("limit", "10");
  const res = await fetch(`/api/feed?${params}`);
  return res.json();
}

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState("foryou");
  const [showWelcome, setShowWelcome] = useState(true);
  const queryClient = useQueryClient();
  const observerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["feed", activeTab],
    queryFn: ({ pageParam }) => fetchFeed({ pageParam, tab: activeTab }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  // Infinite scroll observer
  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) || [];

  async function handleLike(postId: string) {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  }

  async function handleSave(postId: string) {
    await fetch(`/api/posts/${postId}/save`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["feed"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto max-w-7xl grid gap-6 px-4 py-6 lg:grid-cols-[1fr_320px]">
            {/* Center Column */}
            <div className="space-y-5">
              {/* Welcome banner */}
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative glass-card rounded-2xl p-5 overflow-hidden"
                >
                  <button onClick={() => setShowWelcome(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20">
                      <Sparkles className="h-5 w-5 text-cyan-glow" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Welcome to Clonnect! 👋</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        Start by sharing a resource, asking for help, or exploring what your campus community is working on.
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-glow via-violet-glow to-cyan-glow opacity-40" />
                </motion.div>
              )}

              {/* Post Composer */}
              <PostComposer onPostCreated={() => refetch()} />

              {/* Tab Bar */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {FEED_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                      activeTab === tab.key
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "text-muted-foreground hover:bg-secondary/50 border border-transparent"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Feed */}
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <FeedCardSkeleton key={i} />)
                ) : posts.length === 0 ? (
                  <div className="glass-card rounded-2xl p-12 text-center">
                    <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="font-semibold text-lg">No posts yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Be the first to share something with the community!
                    </p>
                  </div>
                ) : (
                  posts.map((post: FeedCardProps["post"]) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FeedCard post={post} onLike={handleLike} onSave={handleSave} />
                    </motion.div>
                  ))
                )}

                {/* Infinite scroll trigger */}
                <div ref={observerRef} className="h-4" />
                {isFetchingNextPage && (
                  <div className="space-y-4">
                    <FeedCardSkeleton />
                    <FeedCardSkeleton />
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block space-y-5">
              <SkillGapWidget />
              {/* Skill Passport Widget */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-cyan-glow" />
                  <h3 className="text-sm font-semibold">Skill Passport</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { skill: "React", level: 85, color: "from-cyan-400 to-cyan-600" },
                    { skill: "Python", level: 72, color: "from-violet-400 to-violet-600" },
                    { skill: "ML", level: 60, color: "from-emerald-400 to-emerald-600" },
                    { skill: "TypeScript", level: 90, color: "from-blue-400 to-blue-600" },
                    { skill: "UI/UX", level: 45, color: "from-amber-400 to-amber-600" },
                  ].map((s) => (
                    <div key={s.skill}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium">{s.skill}</span>
                        <span className="text-xs font-mono text-muted-foreground">{s.level}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary/80 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${s.level}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className={`h-full rounded-full bg-gradient-to-r ${s.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Tags */}
              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Hash className="h-4 w-4 text-violet-glow" />
                  <h3 className="text-sm font-semibold">Trending</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer transition-colors font-mono"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
