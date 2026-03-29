"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ users: unknown[]; posts: unknown[] }>({
    users: [],
    posts: [],
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], posts: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/discover?q=${encodeURIComponent(query)}&type=all`);
        const data = await res.json();
        setResults(data);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-sm text-muted-foreground hover:bg-secondary/80 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        Search...
        <kbd className="ml-auto text-[10px] bg-secondary rounded px-1.5 py-0.5">⌘K</kbd>
      </button>
    );
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
        onClick={() => setOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, posts, skills..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <kbd className="text-[10px] bg-secondary border border-border rounded px-1.5 py-0.5 text-muted-foreground">
              ESC
            </kbd>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {loading && (
              <p className="text-center text-xs text-muted-foreground py-8">Searching...</p>
            )}
            {!loading && !query && (
              <p className="text-center text-xs text-muted-foreground py-8">Type to search across Clonnect</p>
            )}
            {(results.users as { id: string; name?: string | null; username?: string | null; university?: string | null; department?: string | null }[])
              ?.slice(0, 3)
              .map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    router.push(`/profile/${u.username || u.id}`);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 text-left transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 flex items-center justify-center text-sm font-semibold shrink-0">
                    {u.name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.university} · {u.department}
                    </p>
                  </div>
                  <Users className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                </button>
              ))}
            {(results.posts as { id: string; title?: string | null; content: string; author?: { name?: string | null } }[])
              ?.slice(0, 5)
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    router.push(`/post/${p.id}`);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 text-left transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.title || p.content.slice(0, 60)}</p>
                    <p className="text-xs text-muted-foreground">by {p.author?.name}</p>
                  </div>
                </button>
              ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
