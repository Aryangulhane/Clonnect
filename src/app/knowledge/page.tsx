"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, Search, FolderOpen, Tag, Upload, Filter, X,
  FileText, Image, File, ExternalLink, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils";

// Demo saved resources (works without DB)
const DEMO_RESOURCES = [
  { id: "1", title: "Complete ML Roadmap 2026", type: "pdf", tags: ["Machine Learning", "AI", "Roadmap"], author: "Sophia Chen", savedAt: "2 days ago", size: "2.4 MB" },
  { id: "2", title: "React Server Components Guide", type: "doc", tags: ["React", "Next.js"], author: "Arjun Mehta", savedAt: "3 days ago", size: "1.1 MB" },
  { id: "3", title: "Git & GitHub Cheat Sheet", type: "image", tags: ["Git", "GitHub", "Beginners"], author: "Emma Schmidt", savedAt: "1 week ago", size: "450 KB" },
  { id: "4", title: "Data Structures Visualizer", type: "link", tags: ["Data Structures", "Tool"], author: "Carlos Rivera", savedAt: "1 week ago", size: null },
  { id: "5", title: "System Design Interview Notes", type: "pdf", tags: ["System Design", "Interview Prep"], author: "Ravi Patel", savedAt: "2 weeks ago", size: "3.8 MB" },
  { id: "6", title: "Cybersecurity CTF Toolkit", type: "doc", tags: ["Cybersecurity", "CTF"], author: "Aisha Khan", savedAt: "2 weeks ago", size: "5.2 MB" },
  { id: "7", title: "Competitive Programming Problem Set", type: "pdf", tags: ["CP", "LeetCode", "Algorithms"], author: "Lucas Martin", savedAt: "3 weeks ago", size: "1.7 MB" },
  { id: "8", title: "UI/UX Design Course Notes", type: "doc", tags: ["Design", "Figma", "UI/UX"], author: "Priya Sharma", savedAt: "1 month ago", size: "2.1 MB" },
];

const ALL_TAGS = [...new Set(DEMO_RESOURCES.flatMap((r) => r.tags))];

const fileIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  doc: File,
  image: Image,
  link: ExternalLink,
};

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filtered = DEMO_RESOURCES.filter((r) => {
    const matchesSearch = !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTag = !selectedTag || r.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto max-w-4xl px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <BookOpen className="h-6 w-6 text-primary" />
                    Knowledge Base
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your saved resources, organized by topic
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-navy font-semibold gap-1.5">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>

              {/* Search & Filter */}
              <div className="mt-5 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary/30 border-border/50"
                  />
                </div>

                {/* Tag filters */}
                <div className="flex flex-wrap gap-1.5">
                  <Badge
                    variant={selectedTag === null ? "default" : "outline"}
                    className={cn("cursor-pointer text-xs", selectedTag === null ? "bg-primary/10 text-primary" : "border-border/50")}
                    onClick={() => setSelectedTag(null)}
                  >
                    All
                  </Badge>
                  {ALL_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      className={cn("cursor-pointer text-xs", selectedTag === tag ? "bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:text-primary hover:border-primary/30")}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Resource Grid */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {filtered.map((resource, i) => {
                  const Icon = fileIcons[resource.type] || FileText;
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass-card rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
                            {resource.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            by {resource.author}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {resource.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-[10px] bg-secondary/50 font-mono px-1.5 py-0">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {resource.savedAt}</span>
                        {resource.size && <span>{resource.size}</span>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <FolderOpen className="h-14 w-14 mx-auto text-muted-foreground/20 mb-4" />
                  <h3 className="font-semibold text-lg">No resources found</h3>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or tags</p>
                </div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
