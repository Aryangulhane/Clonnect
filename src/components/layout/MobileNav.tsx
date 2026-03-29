"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Brain, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/knowledge", label: "Knowledge", icon: Brain },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/api/users/me", label: "Profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();

  // Don't show on landing or auth pages
  if (pathname === "/" || pathname.startsWith("/auth")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/90 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around py-2 safe-area-inset-bottom">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === "/api/users/me"
              ? pathname.startsWith("/profile")
              : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_oklch(0.78_0.15_200)]")} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
