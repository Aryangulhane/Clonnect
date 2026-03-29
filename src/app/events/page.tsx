"use client";

import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, PartyPopper, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { FeedCard, type FeedCardProps } from "@/components/feed/FeedCard";
import { Badge } from "@/components/ui/badge";

type Group = {
  id: string;
  title: string;
  topic: string;
  scheduledAt: string;
  members: { id: string }[];
};

const eventKeywords = ["event", "hackathon", "workshop", "contest", "meetup", "club", "code"];

function isEventPost(post: FeedCardProps["post"]) {
  const haystack = [
    post.title ?? "",
    post.content,
    ...post.tags.map((tag) => tag.tagName),
  ]
    .join(" ")
    .toLowerCase();

  return eventKeywords.some((keyword) => haystack.includes(keyword));
}

export default function EventsPage() {
  const queryClient = useQueryClient();
  const postsQuery = useQuery({
    queryKey: ["events-posts"],
    queryFn: () => fetch("/api/posts?limit=40").then((res) => res.json()),
  });
  const groupsQuery = useQuery({
    queryKey: ["events-groups"],
    queryFn: () => fetch("/api/study-groups").then((res) => res.json()),
  });

  const eventPosts = ((postsQuery.data?.posts ?? []) as FeedCardProps["post"][]).filter(isEventPost);
  const groups = (groupsQuery.data?.groups ?? []) as Group[];

  async function handleLike(postId: string) {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["events-posts"] });
  }

  async function handleSave(postId: string) {
    await fetch(`/api/posts/${postId}/save`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["events-posts"] });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto max-w-6xl px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card rounded-2xl p-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  <PartyPopper className="h-6 w-6 text-primary" />
                  Campus Events
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  A single place for hackathons, workshops, contests, and upcoming student meetups.
                </p>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  {eventPosts.length > 0 ? (
                    eventPosts.map((post) => (
                      <FeedCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onSave={handleSave}
                      />
                    ))
                  ) : (
                    <div className="glass-card rounded-2xl p-12 text-center">
                      <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                      <h2 className="text-lg font-semibold">No event posts yet</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Event announcements will appear here once they’re shared in the feed.
                      </p>
                    </div>
                  )}
                </div>

                <aside className="space-y-4">
                  <div className="glass-card rounded-2xl p-5">
                    <h2 className="text-sm font-semibold">Upcoming sessions</h2>
                    <div className="mt-4 space-y-3">
                      {groups.slice(0, 5).map((group) => (
                        <div key={group.id} className="rounded-xl bg-secondary/30 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {group.topic}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {group.members.length} joined
                            </span>
                          </div>
                          <p className="mt-2 text-sm font-medium">{group.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {format(new Date(group.scheduledAt), "EEE, MMM d • h:mm a")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-glow" />
                      <h2 className="text-sm font-semibold">What belongs here</h2>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      We automatically surface posts about hackathons, workshops, contests, and community events
                      so this page stays useful even without a separate events backend yet.
                    </p>
                  </div>
                </aside>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
