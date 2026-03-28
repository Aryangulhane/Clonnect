"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Fuse from "fuse.js";
import {
  Search, Filter, Users, FileText, SlidersHorizontal, X,
  GraduationCap, MapPin,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { FeedCard } from "@/components/feed/FeedCard";
import { cn } from "@/lib/utils";

const SKILLS_FILTER = [
  "All", "Python", "JavaScript", "React", "Machine Learning", "Data Science",
  "UI/UX Design", "Node.js", "TypeScript", "Docker", "AWS",
];

const DEPARTMENTS_FILTER = [
  "All", "Computer Science", "Data Science", "Electrical Engineering",
  "Mathematics", "AI", "Software Engineering",
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "posts">("users");
  const [skillFilter, setSkillFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["discover", activeTab],
    queryFn: () => fetch(`/api/discover?type=${activeTab}`).then((r) => r.json()),
  });

  const items = activeTab === "users" ? data?.users || [] : data?.posts || [];

  // Fuse.js fuzzy search
  const fuse = useMemo(() => {
    if (activeTab === "users") {
      return new Fuse(items, {
        keys: ["name", "username", "university", "department", "skills.skill.name"],
        threshold: 0.3,
      });
    }
    return new Fuse(items, {
      keys: ["title", "content", "tags.tagName", "author.name"],
      threshold: 0.3,
    });
  }, [items, activeTab]);

  let filtered = searchQuery ? fuse.search(searchQuery).map((r) => r.item) : items;

  // Apply filters for users
  if (activeTab === "users") {
    if (skillFilter !== "All") {
      filtered = filtered.filter((u: any) =>
        u.skills?.some((s: any) => s.skill.name === skillFilter)
      );
    }
    if (deptFilter !== "All") {
      filtered = filtered.filter((u: any) => u.department === deptFilter);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto max-w-4xl px-4 py-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                Discover
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Find peers, resources, and connections across campus
              </p>

              {/* Search bar */}
              <div className="mt-5 flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === "users" ? "Search by name, skill, university..." : "Search posts, tags..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary/30 border-border/50"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button variant="outline" size="icon" className="border-border/50" onClick={() => setShowFilters(!showFilters)}>
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => setActiveTab("users")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                    activeTab === "users" ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary/50 border border-transparent"
                  )}
                >
                  <Users className="h-4 w-4" /> People
                </button>
                <button
                  onClick={() => setActiveTab("posts")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                    activeTab === "posts" ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary/50 border border-transparent"
                  )}
                >
                  <FileText className="h-4 w-4" /> Posts
                </button>
              </div>

              {/* Filters */}
              {showFilters && activeTab === "users" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 flex flex-wrap gap-3 p-4 glass-card rounded-xl"
                >
                  <Select value={skillFilter} onValueChange={(v) => v !== null && setSkillFilter(v)}>
                    <SelectTrigger className="w-[180px] bg-secondary/30 border-border/50">
                      <SelectValue placeholder="Skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {SKILLS_FILTER.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={deptFilter} onValueChange={(v) => v !== null && setDeptFilter(v)}>
                    <SelectTrigger className="w-[200px] bg-secondary/30 border-border/50">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS_FILTER.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </motion.div>
              )}
            </motion.div>

            {/* Results */}
            <div className="mt-6">
              {isLoading ? (
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
              ) : activeTab === "users" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filtered.map((user: any) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Link href={`/profile/${user.username || user.id}`}>
                        <div className="glass-card rounded-2xl p-5 transition-all duration-300 hover:translate-y-[-2px] cursor-pointer">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.image || ""} />
                              <AvatarFallback className="bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 font-semibold">
                                {user.name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{user.name}</p>
                              <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                {user.university && (
                                  <span className="flex items-center gap-1 truncate"><GraduationCap className="h-3 w-3 shrink-0" /> {user.university}</span>
                                )}
                              </div>
                              {user.skills?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {user.skills.slice(0, 3).map((s: any) => (
                                    <Badge key={s.skill.id} variant="secondary" className="text-[10px] bg-primary/10 text-primary px-1.5 py-0">
                                      {s.skill.name}
                                    </Badge>
                                  ))}
                                  {user.skills.length > 3 && (
                                    <Badge variant="secondary" className="text-[10px] bg-secondary/50 px-1.5 py-0">
                                      +{user.skills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/20 text-xs text-muted-foreground">
                            <span>{user._count?.followers || 0} followers</span>
                            <span>{user._count?.posts || 0} posts</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  {filtered.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No users found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((post: any) => <FeedCard key={post.id} post={post} />)}
                  {filtered.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No posts found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
