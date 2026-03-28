"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Bell, Check, CheckCheck, Heart, MessageCircle,
  UserPlus, AtSign, Zap, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils";

const notificationIcons: Record<string, any> = {
  LIKE: Heart,
  REPLY: MessageCircle,
  FOLLOW: UserPlus,
  MENTION: AtSign,
  MATCH: Zap,
  SYSTEM: Sparkles,
};

const notificationColors: Record<string, string> = {
  LIKE: "text-pink-400 bg-pink-400/10",
  REPLY: "text-cyan-400 bg-cyan-400/10",
  FOLLOW: "text-violet-400 bg-violet-400/10",
  MENTION: "text-amber-400 bg-amber-400/10",
  MATCH: "text-emerald-400 bg-emerald-400/10",
  SYSTEM: "text-blue-400 bg-blue-400/10",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
  });

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto max-w-2xl px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
                    <Bell className="h-6 w-6 text-primary" />
                    Notifications
                  </h1>
                  {unreadCount > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {unreadCount} unread notification{unreadCount !== 1 && "s"}
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" className="gap-1.5 border-border/50" onClick={markAllRead}>
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                  </Button>
                )}
              </div>

              {/* Notifications list */}
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="glass-card rounded-xl p-4 flex gap-3">
                      <div className="h-10 w-10 rounded-full skeleton-shimmer" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 skeleton-shimmer rounded" />
                        <div className="h-3 w-1/3 skeleton-shimmer rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-20">
                  <Bell className="h-14 w-14 mx-auto text-muted-foreground/20 mb-4" />
                  <h3 className="font-semibold text-lg">All caught up!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No notifications yet. Start engaging with the community!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notif: any, i: number) => {
                    const Icon = notificationIcons[notif.type] || Bell;
                    const colorClass = notificationColors[notif.type] || "text-muted-foreground bg-secondary/30";
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link href={notif.linkUrl || "/feed"}>
                          <div className={cn(
                            "flex items-start gap-3 rounded-xl p-4 transition-all duration-200 cursor-pointer",
                            notif.isRead
                              ? "bg-transparent hover:bg-secondary/20"
                              : "glass-card hover:translate-y-[-1px]"
                          )}>
                            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", colorClass)}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm leading-relaxed", !notif.isRead && "font-medium")}>
                                {notif.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            {!notif.isRead && (
                              <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary animate-pulse" />
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
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
