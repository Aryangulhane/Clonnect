"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Brain,
  FolderOpen,
  Users,
  Calendar,
  BookOpen,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/knowledge", label: "Knowledge", icon: Brain },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/clubs", label: "Clubs", icon: Users },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/resources", label: "Resources", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  // Don't show on landing or auth pages
  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border/40 bg-sidebar/50 backdrop-blur-sm">
      <nav className="flex flex-col gap-1 p-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Skill Passport Widget */}
      <div className="mt-auto p-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-cyan-glow" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Skill Passport
            </h3>
          </div>
          <div className="space-y-2.5">
            {[
              { skill: "React", level: 85, color: "from-cyan-400 to-cyan-600" },
              { skill: "Python", level: 72, color: "from-violet-400 to-violet-600" },
              { skill: "ML", level: 60, color: "from-emerald-400 to-emerald-600" },
              { skill: "UI/UX", level: 45, color: "from-amber-400 to-amber-600" },
            ].map((s) => (
              <div key={s.skill}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {s.skill}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {s.level}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-secondary/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${s.color} transition-all duration-700`}
                    style={{ width: `${s.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/profile/me"
            className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <TrendingUp className="h-3 w-3" />
            View Full Passport
          </Link>
        </div>
      </div>
    </aside>
  );
}
