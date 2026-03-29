"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  MapPin, GraduationCap, Calendar, FileText,
  HelpCircle, UserPlus, UserCheck, ExternalLink,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { FeedCard, type FeedCardProps } from "@/components/feed/FeedCard";
import { cn } from "@/lib/utils";

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: () => fetch(`/api/users/${username}`).then((r) => r.json()),
  });

  const { data: postsData } = useQuery({
    queryKey: ["userPosts", user?.id],
    queryFn: () => fetch(`/api/posts?authorId=${user!.id}&limit=20`).then((r) => r.json()),
    enabled: !!user?.id && !(user && "error" in user && user.error),
  });

  async function handleFollow() {
    if (!user?.id) return;
    await fetch(`/api/users/${user.id}/follow`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["user", username] });
  }

  async function handleLike(postId: string) {
    await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["userPosts", user?.id] });
  }

  async function handleSave(postId: string) {
    await fetch(`/api/posts/${postId}/save`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["userPosts", user?.id] });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="glass-card rounded-2xl p-8 animate-pulse space-y-4">
            <div className="flex gap-4">
              <div className="h-24 w-24 rounded-full skeleton-shimmer" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-48 skeleton-shimmer rounded" />
                <div className="h-4 w-72 skeleton-shimmer rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || ("error" in user && user.error)) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <Link href="/discover"><Button className="mt-4">Discover People</Button></Link>
        </div>
      </div>
    );
  }

  type ProfilePost = FeedCardProps["post"];
  type SkillRow = { skill: { id: string; name: string }; proficiencyLevel: number };

  const resources =
    postsData?.posts?.filter((p: ProfilePost) => p.type === "RESOURCE") ?? [];
  const questions =
    postsData?.posts?.filter((p: ProfilePost) => p.type === "HELP_REQUEST") ?? [];

  const radarData = (user.skills || []).slice(0, 6).map((us: SkillRow) => ({
    skill: us.skill.name,
    level: us.proficiencyLevel * 20,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6 pb-24 lg:pb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Header */}
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar className="h-24 w-24 shrink-0 ring-2 ring-primary/20 ring-offset-4 ring-offset-background">
                <AvatarImage src={user.image || ""} alt={user.name || ""} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-glow/30 to-violet-glow/30 text-2xl font-bold">
                  {user.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                      {user.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                  <Button
                    onClick={handleFollow}
                    variant={user.isFollowing ? "outline" : "default"}
                    className={cn(
                      "gap-1.5",
                      !user.isFollowing && "bg-gradient-to-r from-cyan-glow to-violet-glow text-navy font-semibold"
                    )}
                  >
                    {user.isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {user.isFollowing ? "Following" : "Follow"}
                  </Button>
                </div>

                {user.bio && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{user.bio}</p>}

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                  {user.university && (
                    <span className="flex items-center gap-1"><GraduationCap className="h-4 w-4" /> {user.university}</span>
                  )}
                  {user.department && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {user.department}</span>
                  )}
                  {user.year && (
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Year {user.year}</span>
                  )}
                </div>

                <div className="flex items-center gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-lg font-bold">{user._count?.posts || 0}</p>
                    <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{user._count?.followers || 0}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{user._count?.following || 0}</p>
                    <p className="text-xs text-muted-foreground">Following</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            {user.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-5 pt-4 border-t border-border/30">
                {user.skills.map((us: SkillRow) => (
                  <Badge key={us.skill.id} variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
                    {us.skill.name}
                    <span className="ml-1 text-[10px] text-muted-foreground">Lv.{us.proficiencyLevel}</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Skill Passport Radar Chart + Content Tabs */}
          <div className="grid gap-6 mt-6 lg:grid-cols-[300px_1fr]">
            {/* Radar Chart */}
            {radarData.length >= 3 && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  Skill Passport
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="oklch(0.25 0.03 260 / 0.5)" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fill: "oklch(0.7 0.02 260)", fontSize: 11 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      dataKey="level"
                      stroke="#22d3ee"
                      fill="#22d3ee"
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Post tabs */}
            <div>
              <Tabs defaultValue="posts" className="w-full">
                <TabsList className="w-full justify-start bg-secondary/30 border border-border/30 rounded-xl p-1">
                  <TabsTrigger value="posts" className="rounded-lg text-xs gap-1"><FileText className="h-3.5 w-3.5" /> Posts</TabsTrigger>
                  <TabsTrigger value="resources" className="rounded-lg text-xs gap-1"><ExternalLink className="h-3.5 w-3.5" /> Resources</TabsTrigger>
                  <TabsTrigger value="questions" className="rounded-lg text-xs gap-1"><HelpCircle className="h-3.5 w-3.5" /> Questions</TabsTrigger>
                </TabsList>
                <TabsContent value="posts" className="mt-4 space-y-4">
                  {postsData?.posts?.length > 0 ? (
                    postsData.posts.map((post: ProfilePost) => (
                      <FeedCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onSave={handleSave}
                      />
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-12">No posts yet</p>
                  )}
                </TabsContent>
                <TabsContent value="resources" className="mt-4 space-y-4">
                  {resources.length > 0 ? (
                    resources.map((post: ProfilePost) => (
                      <FeedCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onSave={handleSave}
                      />
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-12">No resources shared yet</p>
                  )}
                </TabsContent>
                <TabsContent value="questions" className="mt-4 space-y-4">
                  {questions.length > 0 ? (
                    questions.map((post: ProfilePost) => (
                      <FeedCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onSave={handleSave}
                      />
                    ))
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-12">No questions asked yet</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </motion.div>
      </main>
      <MobileNav />
    </div>
  );
}
