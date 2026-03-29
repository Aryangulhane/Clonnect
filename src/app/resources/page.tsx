"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Library, Bookmark, FolderOpen } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { FeedCard, type FeedCardProps } from "@/components/feed/FeedCard";
import { Button } from "@/components/ui/button";

export default function ResourcesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["resources-page"],
    queryFn: () => fetch("/api/posts?type=RESOURCE&limit=24").then((res) => res.json()),
  });

  const posts = (data?.posts ?? []) as FeedCardProps["post"][];

  async function handleLike(postId: string) {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["resources-page"] });
  }

  async function handleSave(postId: string) {
    await fetch(`/api/posts/${postId}/save`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["resources-page"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto max-w-5xl px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                      <Library className="h-6 w-6 text-primary" />
                      Shared Resources
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Browse the latest guides, templates, notes, and study material from the community.
                    </p>
                  </div>
                  <Link href="/knowledge">
                    <Button variant="outline" className="gap-2 border-border/50">
                      <Bookmark className="h-4 w-4" />
                      Open Saved Library
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="glass-card rounded-2xl p-8" />
                  ))
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <FeedCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onSave={handleSave}
                    />
                  ))
                ) : (
                  <div className="glass-card rounded-2xl p-12 text-center">
                    <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                    <h2 className="text-lg font-semibold">No shared resources yet</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Once students post notes or guides, they’ll show up here automatically.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
