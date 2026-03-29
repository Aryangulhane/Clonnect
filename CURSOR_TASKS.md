# Clonnect — Cursor Task List
> Paste individual task blocks into Cursor's chat. Work top-to-bottom; each block is self-contained.

---

## 🔴 CRITICAL FIXES (App won't run without these)

---

### TASK 01 — Fix Prisma schema missing database URL

**File:** `prisma/schema.prisma`

Find this block:
```prisma
datasource db {
  provider = "postgresql"
}
```

Replace with:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Then in your `.env` file add both:
```
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
```
> The pooled URL goes to DATABASE_URL (for runtime), DIRECT_URL is the non-pooled one (for migrations). Both are on your Neon dashboard.

---

### TASK 02 — Replace src/lib/prisma.ts (WebSocket adapter breaks Next.js 15)

**File:** `src/lib/prisma.ts`

Replace the entire file with:
```typescript
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env file.\nGet it from: https://console.neon.tech"
    );
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
```

Also remove `@prisma/adapter-neon`, `@prisma/adapter-pg`, `@neondatabase/serverless`, and `ws` from the dependencies used in prisma.ts — they are no longer needed since Prisma 7 handles Neon natively via the connection string.

---

### TASK 03 — Add NextAuth TypeScript types (session.user.id causes TS errors)

**File:** `src/types/next-auth.d.ts` (create this new file)

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
  }
}
```

---

### TASK 04 — Fix /profile/me (currently crashes with 404)

**File:** `src/app/api/users/me/route.ts` (create this new file)

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, id: true },
  });

  const destination = user?.username ?? user?.id ?? session.user.id;
  return NextResponse.redirect(new URL(`/profile/${destination}`, req.url));
}
```

Then in `src/components/layout/Navbar.tsx` update the profile link href from `/profile/me` to `/api/users/me`.

Then in `src/components/layout/MobileNav.tsx` update:
```typescript
{ href: "/api/users/me", label: "Profile", icon: User },
```

---

### TASK 05 — Fix posts API — authorId filter is missing

**File:** `src/app/api/posts/route.ts`

The profile page calls `/api/posts?authorId=${user?.id}` but the GET handler ignores `authorId`. Fix the `where` clause:

```typescript
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "10");
  const type = searchParams.get("type");
  const authorId = searchParams.get("authorId"); // ADD THIS

  const where: Record<string, unknown> = {};
  if (type) where.type = type as "HELP_REQUEST" | "RESOURCE" | "GENERAL";
  if (authorId) where.authorId = authorId; // ADD THIS

  // rest of handler stays the same
```

---

### TASK 06 — Fix hardcoded notification badge in Navbar

**File:** `src/components/layout/Navbar.tsx`

The badge currently shows hardcoded `3`. Replace the Bell button section with a data-fetching approach:

```typescript
"use client";
// Add this hook near the top of the component:
import { useQuery } from "@tanstack/react-query";

// Inside the Navbar component, add:
const { data: notifData } = useQuery({
  queryKey: ["notifications-count"],
  queryFn: () => fetch("/api/notifications?unread=true").then(r => r.json()),
  refetchInterval: 30000, // poll every 30s
});
const unreadCount = notifData?.unreadCount ?? 0;

// Replace the hardcoded badge:
{unreadCount > 0 && (
  <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 text-[10px] flex items-center justify-center bg-cyan-glow text-navy border-0">
    {unreadCount > 9 ? "9+" : unreadCount}
  </Badge>
)}
```

---

### TASK 07 — Fix the "campus" feed tab (currently same as "foryou")

**File:** `src/app/api/feed/route.ts`

The "campus" tab has no filter logic. Add it:

```typescript
if (session?.user?.id && tab === "following") {
  const follows = await prisma.follow.findMany({
    where: { followerId: session.user.id },
    select: { followingId: true },
  });
  const followingIds = follows.map((f) => f.followingId);
  where = { authorId: { in: followingIds } };
} else if (tab === "resources") {
  where = { type: "RESOURCE" };
} else if (tab === "campus" && session?.user?.id) {
  // Show posts from people at the same university
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { university: true },
  });
  if (currentUser?.university) {
    const campusPeers = await prisma.user.findMany({
      where: { university: currentUser.university, id: { not: session.user.id } },
      select: { id: true },
    });
    where = { authorId: { in: campusPeers.map(u => u.id) } };
  }
}
```

---

### TASK 08 — Add missing loading.tsx files (pages show blank while loading)

Create these files:

**`src/app/feed/loading.tsx`**
```typescript
import { FeedCardSkeleton } from "@/components/feed/FeedCardSkeleton";
export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <FeedCardSkeleton key={i} />)}
    </div>
  );
}
```

**`src/app/discover/loading.tsx`**
```typescript
export default function DiscoverLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="h-8 w-48 skeleton-shimmer rounded mb-6" />
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
    </div>
  );
}
```

**`src/app/profile/[username]/loading.tsx`**
```typescript
export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="glass-card rounded-2xl p-8 space-y-4">
        <div className="flex gap-4">
          <div className="h-24 w-24 rounded-full skeleton-shimmer shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-6 w-48 skeleton-shimmer rounded" />
            <div className="h-4 w-32 skeleton-shimmer rounded" />
            <div className="h-4 w-72 skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### TASK 09 — Fix auth.config.ts hardcoded localhost URL

**File:** `src/lib/auth.config.ts`

The `authorized` callback uses hardcoded `"/feed"` redirect which works, but the session/jwt callbacks reference `token.sub` which needs proper typing. Also the Credentials provider `authorize` stub returns null which is fine for edge middleware, but add a comment so future devs understand:

```typescript
// In the Credentials provider:
Credentials({
  name: "credentials",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  // NOTE: This authorize stub is intentional — the real authorize()
  // lives in src/lib/auth.ts. This file is edge-compatible (no Prisma).
  authorize: () => null,
}),
```

Also fix the session callback typing issue:
```typescript
async session({ session, token }) {
  if (token?.sub && session?.user) {
    session.user.id = token.sub;
  }
  return session;
},
```

---

### TASK 10 — Add .env.example so teammates know what's needed

**File:** `.env.example` (create in project root)

```env
# ══════════════════════════════════════════════════
# Clonnect — Environment Variables
# Copy this file to .env and fill in your values
# ══════════════════════════════════════════════════

# ── Database (Neon PostgreSQL) ──────────────────
# Get both from: https://console.neon.tech → your project → Connection Details
# Use the "Pooled connection" string for DATABASE_URL
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# ── NextAuth ────────────────────────────────────
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# ── Google OAuth ─────────────────────────────────
# Create at: https://console.cloud.google.com
# Authorized redirect URI: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxx"

# ── Pusher (Real-time notifications) ────────────
# Get from: https://dashboard.pusher.com
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER="ap2"
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER="ap2"

# ── UploadThing (File uploads) ───────────────────
# Get from: https://uploadthing.com/dashboard
UPLOADTHING_TOKEN=""
```

---

## 🟡 IMPORTANT FIXES (App runs but features are broken)

---

### TASK 11 — Fix PostComposer "Photo" label (misleading, no image upload wired)

**File:** `src/components/feed/PostComposer.tsx`

Change the post types to be accurate and wire up the actual type properly:

```typescript
const postTypes = [
  { type: "GENERAL" as PostType, label: "General", icon: MessageSquare, color: "text-cyan-400" },
  { type: "RESOURCE" as PostType, label: "Resource", icon: FileText, color: "text-violet-400" },
  { type: "HELP_REQUEST" as PostType, label: "Ask Help", icon: HelpCircle, color: "text-amber-400" },
];
```

Also add a character counter below the textarea:
```typescript
// Inside the expanded view, after the Textarea:
<div className="flex justify-between text-xs text-muted-foreground">
  <span>{content.length > 500 ? <span className="text-destructive">{content.length}/1000</span> : `${content.length}/1000`}</span>
  <span>Press Enter to add tags</span>
</div>
```

---

### TASK 12 — Add error boundary for the 3D globe (crashes entire page if WebGL fails)

**File:** `src/components/globe/GlobeErrorBoundary.tsx` (create new file)

```typescript
"use client";
import { Component, ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class GlobeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[400px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Knowledge graph unavailable</p>
            <p className="text-xs mt-1 opacity-60">WebGL may not be supported in this browser</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

Then in `src/app/page.tsx`, wrap KnowledgeGlobe:
```typescript
import { GlobeErrorBoundary } from "@/components/globe/GlobeErrorBoundary";

// In the render:
<GlobeErrorBoundary>
  <KnowledgeGlobe />
</GlobeErrorBoundary>
```

---

### TASK 13 — Fix profile page — posts tab shows nothing (wrong API call)

**File:** `src/app/profile/[username]/page.tsx`

The query fetches posts using `user?.id` but the query runs before `user` is loaded:

```typescript
// Change the posts query to:
const { data: postsData } = useQuery({
  queryKey: ["userPosts", user?.id],
  queryFn: () =>
    fetch(`/api/posts?authorId=${user!.id}&limit=20`).then((r) => r.json()),
  enabled: !!user?.id && !user?.error, // only run when user is loaded
});
```

Also add tabs for "Resources" and "Questions" that actually filter by post type:

```typescript
// In TabsContent for resources:
const resources = postsData?.posts?.filter((p: any) => p.type === "RESOURCE") ?? [];
// In TabsContent for questions:
const questions = postsData?.posts?.filter((p: any) => p.type === "HELP_REQUEST") ?? [];
```

---

### TASK 14 — Add Pusher real-time notifications (already installed, not wired)

**File:** `src/lib/pusher-server.ts` (create new file)

```typescript
import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
```

**File:** `src/lib/pusher-client.ts` (create new file)

```typescript
import PusherJs from "pusher-js";

export const pusherClient = new PusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});
```

Then in `src/app/api/users/[id]/follow/route.ts`, after creating the notification, add:

```typescript
import { pusherServer } from "@/lib/pusher-server";

// After prisma.notification.create():
await pusherServer.trigger(`user-${id}`, "new-notification", {
  message: `${session.user.name} started following you!`,
  type: "FOLLOW",
});
```

Then in `src/app/notifications/page.tsx`, add a Pusher listener to refetch when a new notification arrives:

```typescript
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher-client";
import { useSession } from "next-auth/react";

// Inside component:
const { data: session } = useSession();

useEffect(() => {
  if (!session?.user?.id) return;
  const channel = pusherClient.subscribe(`user-${session.user.id}`);
  channel.bind("new-notification", () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  });
  return () => { pusherClient.unsubscribe(`user-${session.user.id}`); };
}, [session?.user?.id]);
```

---

### TASK 15 — Wire up UploadThing to PostComposer (file uploads don't work)

**File:** `src/components/feed/PostComposer.tsx`

Add image upload support using UploadThing:

```typescript
import { useUploadThing } from "@uploadthing/react";
import { ImagePlus, Loader2 } from "lucide-react";

// Inside PostComposer, add state:
const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string }[]>([]);
const [uploading, setUploading] = useState(false);

const { startUpload } = useUploadThing("postUploader", {
  onClientUploadComplete: (res) => {
    if (res) {
      setUploadedFiles(prev => [...prev, ...res.map(f => ({ url: f.url, name: f.name }))]);
    }
    setUploading(false);
  },
  onUploadError: () => setUploading(false),
});

async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
  const files = Array.from(e.target.files ?? []);
  if (!files.length) return;
  setUploading(true);
  await startUpload(files);
}

// Add this inside the expanded textarea area:
// Image preview strip
{uploadedFiles.length > 0 && (
  <div className="flex gap-2 flex-wrap">
    {uploadedFiles.map((f) => (
      <div key={f.url} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border/40">
        <img src={f.url} alt={f.name} className="h-full w-full object-cover" />
        <button
          onClick={() => setUploadedFiles(prev => prev.filter(x => x.url !== f.url))}
          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
        >×</button>
      </div>
    ))}
  </div>
)}

// Upload button (add to the actions row):
<label className="cursor-pointer">
  <input type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={handleFileChange} />
  <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
    <span>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}</span>
  </Button>
</label>
```

Also update `handleSubmit` to include fileUrls in the post body when you extend the API.

---

## 🟢 CREATIVE FEATURE IDEAS

---

### TASK 16 — 🎯 AI-powered "Help Me" button (uses Anthropic API)

**File:** `src/components/feed/SmartHelpButton.tsx` (create new file)

Add a button in PostComposer that, when a user is writing a help request, suggests related tags, improves the question clarity, and finds similar past posts.

```typescript
"use client";
import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  content: string;
  onSuggest: (improved: string, tags: string[]) => void;
}

export function SmartHelpButton({ content, onSuggest }: Props) {
  const [loading, setLoading] = useState(false);

  async function improve() {
    if (!content.trim() || content.length < 20) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/improve-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      onSuggest(data.improved, data.tags);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={improve} disabled={loading || content.length < 20}
      className="text-violet-400 hover:text-violet-300 gap-1.5 text-xs">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
      Improve with AI
    </Button>
  );
}
```

**File:** `src/app/api/ai/improve-post/route.ts` (create new file)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are helping a university student improve their help request post on a campus knowledge-sharing platform.

Given this post:
"${content}"

Return ONLY a JSON object (no markdown) with:
{
  "improved": "The rewritten post — clearer, more specific, more likely to get helpful answers. Keep the student's voice. Max 300 words.",
  "tags": ["tag1", "tag2", "tag3"]  // 3-5 relevant tech/topic tags from: Python, JavaScript, React, Machine Learning, Data Science, UI/UX, Docker, AWS, Java, C++, TypeScript, etc.
}`,
      }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "{}";

  try {
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ improved: content, tags: [] });
  }
}
```

Then add `<SmartHelpButton>` inside `PostComposer` when `postType === "HELP_REQUEST"` and content is non-empty.

---

### TASK 17 — 🔔 Toast notifications for likes and comments (real-time feedback)

**File:** `src/components/feed/FeedCard.tsx`

Add optimistic UI for likes with a toast:

```typescript
import { toast } from "sonner";

// Replace the like handler prop usage with local optimistic state:
const [liked, setLiked] = useState(post.userLiked ?? false);
const [likeCount, setLikeCount] = useState(post._count.likes);

async function handleLikeClick() {
  setLiked(!liked);
  setLikeCount(liked ? likeCount - 1 : likeCount + 1);
  await onLike?.(post.id);
  if (!liked) {
    toast.success("Post liked!", { duration: 1500, position: "bottom-center" });
  }
}
```

---

### TASK 18 — 🗺️ Skill Gap Analyzer (helps students know what to learn next)

**File:** `src/app/api/ai/skill-gap/route.ts` (create new file)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { skills: { include: { skill: true } } },
  });

  // Find the most in-demand skills from recent posts (tags that appear most)
  const popularTags = await prisma.postTag.groupBy({
    by: ["tagName"],
    _count: { tagName: true },
    orderBy: { _count: { tagName: "desc" } },
    take: 20,
  });

  const userSkillNames = user?.skills.map(s => s.skill.name.toLowerCase()) ?? [];
  const gaps = popularTags
    .map(t => t.tagName)
    .filter(tag => !userSkillNames.includes(tag.toLowerCase()))
    .slice(0, 5);

  return NextResponse.json({
    currentSkills: user?.skills.map(s => ({ name: s.skill.name, level: s.proficiencyLevel })) ?? [],
    suggestedSkills: gaps,
    popularTags: popularTags.map(t => ({ name: t.tagName, count: t._count.tagName })),
  });
}
```

**File:** `src/components/feed/SkillGapWidget.tsx` (create new file — add to feed right sidebar)

```typescript
"use client";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SkillGapWidget() {
  const { data } = useQuery({
    queryKey: ["skill-gap"],
    queryFn: () => fetch("/api/ai/skill-gap").then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  if (!data?.suggestedSkills?.length) return null;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold">Skills in demand</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Peers are posting about these — consider learning them:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {data.suggestedSkills.map((skill: string) => (
          <Badge key={skill} variant="outline"
            className="text-xs border-amber-500/30 text-amber-400 cursor-pointer hover:bg-amber-500/10 gap-1">
            <Plus className="h-3 w-3" />{skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}
```

Add `<SkillGapWidget />` to the right sidebar in `src/app/feed/page.tsx`.

---

### TASK 19 — 🔍 Debounced global search with keyboard shortcut (Cmd+K)

**File:** `src/components/layout/GlobalSearch.tsx` (create new file)

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Users, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Cmd+K shortcut
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

  // Debounced search
  useEffect(() => {
    if (!query.trim()) { setResults({ users: [], posts: [] }); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/discover?q=${encodeURIComponent(query)}&type=all`);
      const data = await res.json();
      setResults(data);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/50 text-sm text-muted-foreground hover:bg-secondary/80 transition-colors">
      <Search className="h-3.5 w-3.5" />
      Search...
      <kbd className="ml-auto text-[10px] bg-secondary rounded px-1.5 py-0.5">⌘K</kbd>
    </button>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[15vh]"
        onClick={() => setOpen(false)}>
        <motion.div initial={{ opacity: 0, y: -20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }} transition={{ duration: 0.15 }}
          className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search people, posts, skills..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
            {query && <button onClick={() => setQuery("")}><X className="h-4 w-4 text-muted-foreground" /></button>}
            <kbd className="text-[10px] bg-secondary border border-border rounded px-1.5 py-0.5 text-muted-foreground">ESC</kbd>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {loading && <p className="text-center text-xs text-muted-foreground py-8">Searching...</p>}
            {!loading && !query && (
              <p className="text-center text-xs text-muted-foreground py-8">Type to search across Clonnect</p>
            )}
            {results.users?.slice(0, 3).map((u: any) => (
              <button key={u.id} onClick={() => { router.push(`/profile/${u.username || u.id}`); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 text-left transition-colors">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 flex items-center justify-center text-sm font-semibold shrink-0">
                  {u.name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.university} · {u.department}</p>
                </div>
                <Users className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
              </button>
            ))}
            {results.posts?.slice(0, 5).map((p: any) => (
              <button key={p.id} onClick={() => { router.push(`/post/${p.id}`); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary/50 text-left transition-colors">
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
```

Replace the static search `<Input>` in `Navbar.tsx` with `<GlobalSearch />`.

---

### TASK 20 — 📊 Weekly Digest Email (sends a summary of new campus activity)

**File:** `src/app/api/digest/route.ts` (create new file)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This route can be called by a cron job (e.g. Vercel Cron, or GitHub Actions)
// Protect with a secret header so only your scheduler can call it
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [newPosts, topHelp, newUsers] = await Promise.all([
    prisma.post.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.post.findMany({
      where: { type: "HELP_REQUEST", createdAt: { gte: oneWeekAgo } },
      orderBy: { likes: { _count: "desc" } },
      take: 3,
      include: { author: { select: { name: true } }, _count: { select: { likes: true } } },
    }),
    prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
  ]);

  // Return digest data — you can pipe this to Resend/SendGrid/Nodemailer
  return NextResponse.json({ newPosts, topHelp, newUsers, period: "last 7 days" });
}
```

Add `CRON_SECRET` and `RESEND_API_KEY` to your `.env.example`.

---

### TASK 21 — 🎮 Gamification: XP points and badges for activity

**File:** `prisma/schema.prisma` — add to User model:

```prisma
model User {
  // ... existing fields ...
  xp         Int      @default(0)
  badges     Badge[]
}

model Badge {
  id        String   @id @default(cuid())
  userId    String
  type      String   // "FIRST_POST", "HELPER_10", "RESOURCE_SHARER", "EARLY_ADOPTER"
  awardedAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**File:** `src/lib/xp.ts` (create new file)

```typescript
import { prisma } from "@/lib/prisma";

const XP_VALUES = {
  POST_CREATED: 10,
  POST_LIKED: 2,
  COMMENT_CREATED: 5,
  HELP_ANSWERED: 15,
  RESOURCE_SHARED: 20,
  FOLLOWER_GAINED: 3,
};

const BADGES = {
  FIRST_POST: { threshold: 1, metric: "posts" },
  HELPER_10: { threshold: 10, metric: "help_posts" },
  RESOURCE_SHARER: { threshold: 5, metric: "resource_posts" },
};

export async function awardXP(userId: string, action: keyof typeof XP_VALUES) {
  const amount = XP_VALUES[action];
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  });
}
```

Call `awardXP(session.user.id, "POST_CREATED")` in the POST `/api/posts` route after creating a post.

---

### TASK 22 — 📅 Study Group scheduler (book time with peers)

**File:** `prisma/schema.prisma` — add:

```prisma
model StudyGroup {
  id          String   @id @default(cuid())
  title       String
  description String?
  scheduledAt DateTime
  maxMembers  Int      @default(10)
  topic       String
  creatorId   String
  createdAt   DateTime @default(now())
  creator     User     @relation("CreatedGroups", fields: [creatorId], references: [id], onDelete: Cascade)
  members     StudyGroupMember[]
}

model StudyGroupMember {
  id           String     @id @default(cuid())
  groupId      String
  userId       String
  joinedAt     DateTime   @default(now())
  group        StudyGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([groupId, userId])
}
```

Then create `src/app/api/study-groups/route.ts` with GET (list upcoming groups) and POST (create a group) endpoints.

---

### TASK 23 — 🌙 Theme toggle (light/dark mode switch)

**File:** `src/components/layout/ThemeToggle.tsx` (create new file)

```typescript
"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <Button variant="ghost" size="icon" className="h-9 w-9"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark"
        ? <Sun className="h-4 w-4 text-amber-400" />
        : <Moon className="h-4 w-4" />}
    </Button>
  );
}
```

Add it to `Navbar.tsx` next to the notification bell. Already have `next-themes` installed — just wire it up.

Also update `src/app/globals.css` to add light mode variables:

```css
.light {
  --background: oklch(0.98 0.005 260);
  --foreground: oklch(0.12 0.01 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.12 0.01 260);
  --secondary: oklch(0.94 0.01 260);
  --muted: oklch(0.94 0.01 260);
  --muted-foreground: oklch(0.50 0.01 260);
  --border: oklch(0.88 0.01 260);
  --primary: oklch(0.60 0.18 200);
}
```

And change `src/app/layout.tsx` — remove `className="dark"` from `<html>` so next-themes can control it:
```typescript
<html lang="en" suppressHydrationWarning>
```

---

## 📦 SETUP COMMANDS (run these after all file changes)

```bash
# After fixing prisma/schema.prisma
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts

# Verify everything
npm run dev

# Test demo login:
# Email: arjun@clonnect.dev
# Password: password123
```

---

## 📋 QUICK REFERENCE — Task Priority Order

| Priority | Tasks | Status |
|----------|-------|--------|
| 🔴 Must do first | 01–10 | App won't start |
| 🟡 Do second | 11–15 | Features broken |
| 🟢 Do when ready | 16–23 | New features |

---
*Generated for Clonnect v0.1.0 — Next.js 15 + Prisma 7 + Neon PostgreSQL*
