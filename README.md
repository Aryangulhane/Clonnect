# 🔗 Clonnect — Campus Knowledge Network

> **Your campus. Your knowledge. Connected.**

A full-stack knowledge-sharing and peer-collaboration platform for university students, built with cutting-edge web technologies and an interactive 3D knowledge graph globe.

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=three.js)

---

## ✨ Features

- **3D Knowledge Graph Globe** — Interactive Three.js visualization on the landing page
- **Smart Feed** — Infinite scroll with tabs (For You, Campus, Following, Resources)
- **Help Requests** — Post urgent questions and get peer answers
- **Resource Sharing** — Share notes, guides, and study materials
- **Skill Passport** — Radar chart showcasing your proficiency levels
- **Discover** — Fuse.js fuzzy search across users, posts, and skills
- **Knowledge Base** — Save and organize resources by topic
- **Real-time Notifications** — Pusher-powered live updates
- **Google OAuth + Email/Password** — Flexible authentication via NextAuth v5
- **Mobile-first** — Bottom tab bar and responsive layouts

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router, TypeScript) |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **3D / Animation** | Three.js + React Three Fiber + Framer Motion |
| **Auth** | NextAuth.js v5 (Google OAuth + Credentials) |
| **Database** | PostgreSQL via Prisma ORM |
| **File Uploads** | UploadThing |
| **Real-time** | Pusher |
| **Client State** | Zustand |
| **Server State** | TanStack Query |
| **Forms** | React Hook Form + Zod |
| **Search** | Fuse.js (client-side fuzzy search) |
| **Charts** | Recharts |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **PostgreSQL** database (local or hosted, e.g. Supabase, Neon)
- **npm** (or pnpm/yarn)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/clonnect.git
cd clonnect
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — Random secret for NextAuth (`openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — From Google Cloud Console
- `PUSHER_*` — From Pusher dashboard (optional for dev)
- `UPLOADTHING_*` — From UploadThing dashboard (optional for dev)

### 3. Database Setup

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed Demo Data

```bash
npx tsx prisma/seed.ts
```

This creates 10 demo users, 30 skills, 20 posts, follows, and notifications.

**Demo login:** `arjun@clonnect.dev` / `password123`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page (3D globe)
│   ├── layout.tsx                  # Root layout
│   ├── auth/login/page.tsx         # Login
│   ├── auth/register/page.tsx      # Registration
│   ├── feed/page.tsx               # Home feed
│   ├── post/[id]/page.tsx          # Single post + comments
│   ├── profile/[username]/page.tsx # User profile
│   ├── discover/page.tsx           # Search & discover
│   ├── knowledge/page.tsx          # Saved resources
│   ├── notifications/page.tsx      # Notifications
│   └── api/                        # API routes
│       ├── auth/[...nextauth]/     # NextAuth handler
│       ├── posts/                  # CRUD + like/save/comments
│       ├── users/                  # Profile + follow
│       ├── feed/                   # Personalized feed
│       ├── discover/               # Search API
│       ├── notifications/          # Notifications
│       └── uploadthing/            # File uploads
├── components/
│   ├── globe/KnowledgeGlobe.tsx    # 3D knowledge graph
│   ├── feed/                       # Feed components
│   ├── layout/                     # Navbar, Sidebar, MobileNav
│   ├── providers/                  # Client providers
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── auth.ts                     # NextAuth config
│   ├── prisma.ts                   # Prisma client
│   ├── store.ts                    # Zustand store
│   └── utils.ts                    # Utilities
└── middleware.ts                    # Route protection
```

---

## 🎨 Design System

**"Academic Dark Mode"** — Deep navy backgrounds, electric cyan & violet accents, glassmorphism cards, crisp white typography.

- **Fonts**: Inter (body), Outfit (headings), JetBrains Mono (code/tags)
- **Colors**: `#22d3ee` (cyan), `#a78bfa` (violet), `#0a0e1a` (navy)
- **Effects**: Glass cards, glow shadows, shimmer skeletons, micro-animations

---

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

The included `vercel.json` handles configuration automatically.

---

## 📄 License

MIT — Built for students, by students.
