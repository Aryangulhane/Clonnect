"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Users, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type StudyGroup = {
  id: string;
  title: string;
  description: string | null;
  topic: string;
  scheduledAt: string;
  maxMembers: number;
  creator: {
    name: string | null;
    image: string | null;
    username: string | null;
  };
  members: { id: string }[];
};

export default function ClubsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["study-groups"],
    queryFn: () => fetch("/api/study-groups").then((res) => res.json()),
  });

  const groups = (data?.groups ?? []) as StudyGroup[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto max-w-5xl px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card rounded-2xl p-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  <Users className="h-6 w-6 text-primary" />
                  Clubs & Study Groups
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Meet other students around shared interests, weekly prep sessions, and hands-on workshops.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="glass-card rounded-2xl p-8" />
                  ))
                ) : groups.length > 0 ? (
                  groups.map((group) => (
                    <div key={group.id} className="glass-card rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {group.topic}
                          </Badge>
                          <h2 className="mt-3 text-lg font-semibold">{group.title}</h2>
                        </div>
                        <div className="rounded-xl bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                          {group.members.length}/{group.maxMembers}
                        </div>
                      </div>

                      {group.description && (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {group.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={group.creator.image || ""} />
                          <AvatarFallback>
                            {group.creator.name?.[0] || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{group.creator.name}</p>
                          <p className="text-xs text-muted-foreground">@{group.creator.username}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" />
                          {format(new Date(group.scheduledAt), "EEE, MMM d • h:mm a")}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4" />
                          Open seats: {Math.max(group.maxMembers - group.members.length, 0)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-card col-span-full rounded-2xl p-12 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                    <h2 className="text-lg font-semibold">No groups scheduled yet</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create or seed a study group and it will appear here.
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
