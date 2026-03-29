"use client";

import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderKanban, Users, Target } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { FeedCard, type FeedCardProps } from "@/components/feed/FeedCard";
import { Badge } from "@/components/ui/badge";

const projectKeywords = ["project", "team", "teammate", "collaboration", "hackathon", "build"];

function isProjectPost(post: FeedCardProps["post"]) {
  const text = [
    post.title ?? "",
    post.content,
    ...post.tags.map((tag) => tag.tagName),
  ]
    .join(" ")
    .toLowerCase();

  return projectKeywords.some((keyword) => text.includes(keyword));
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const postsQuery = useQuery({
    queryKey: ["projects-page"],
    queryFn: () => fetch("/api/posts?limit=40").then((res) => res.json()),
  });

  const posts = ((postsQuery.data?.posts ?? []) as FeedCardProps["post"][]).filter(isProjectPost);

  async function handleLike(postId: string) {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["projects-page"] });
  }

  async function handleSave(postId: string) {
    await fetch(`/api/posts/${postId}/save`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["projects-page"] });
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
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                      <FolderKanban className="h-6 w-6 text-primary" />
                      Collaboration Board
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Team formation, hackathon recruiting, and project-building conversations from the campus feed.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary">
                      <Users className="h-3.5 w-3.5" />
                      Team up faster
                    </Badge>
                    <Badge variant="secondary" className="gap-1 bg-secondary/60">
                      <Target className="h-3.5 w-3.5" />
                      Focused on builders
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {posts.length > 0 ? (
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
                    <FolderKanban className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                    <h2 className="text-lg font-semibold">No collaboration posts yet</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      When students post about team formation or projects, they’ll appear here.
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
