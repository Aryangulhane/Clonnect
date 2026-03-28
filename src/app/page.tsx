"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Users,
  Zap,
  Calendar,
  MessageSquare,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const KnowledgeGlobe = dynamic(
  () => import("@/components/globe/KnowledgeGlobe"),
  { ssr: false, loading: () => <GlobeLoader /> }
);

function GlobeLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center min-h-[500px]">
      <div className="relative">
        <div className="h-40 w-40 rounded-full border border-cyan-glow/20 animate-spin" style={{ animationDuration: "3s" }} />
        <div className="absolute inset-4 h-32 w-32 rounded-full border border-violet-glow/20 animate-spin" style={{ animationDuration: "2s", animationDirection: "reverse" }} />
        <div className="absolute inset-8 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-cyan-glow/50 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: MessageSquare,
    title: "Help Requests",
    description: "Post questions and get answers from peers who've been there. Real students, real solutions.",
    gradient: "from-cyan-400 to-cyan-600",
  },
  {
    icon: Share2,
    title: "Resource Sharing",
    description: "Share notes, projects, templates, and study materials. Build a collaborative knowledge base.",
    gradient: "from-violet-400 to-violet-600",
  },
  {
    icon: Zap,
    title: "Skill Matching",
    description: "Find peers with complementary skills. Your Skill Passport tracks and showcases your expertise.",
    gradient: "from-emerald-400 to-emerald-600",
  },
  {
    icon: Calendar,
    title: "Campus Events",
    description: "Discover hackathons, workshops, study groups, and campus events curated for your interests.",
    gradient: "from-amber-400 to-amber-600",
  },
];

const stats = [
  { value: "2,400+", label: "Active Students" },
  { value: "12K+",   label: "Resources Shared" },
  { value: "180+",   label: "Universities" },
  { value: "50+",    label: "Skill Categories" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-0 left-1/4 h-[600px] w-[600px] rounded-full bg-cyan-glow/3 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[600px] w-[600px] rounded-full bg-violet-glow/3 blur-[120px]" />
      </div>

      {/* ═══ Navbar ═══ */}
      <header className="relative z-50 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-glow to-violet-glow shadow-lg shadow-cyan-glow/20">
            <span className="text-lg font-black text-navy">C</span>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            <span className="gradient-text">Clonnect</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-gradient-to-r from-cyan-glow to-violet-glow text-navy font-semibold shadow-lg shadow-cyan-glow/20 hover:shadow-cyan-glow/40 transition-all duration-300">
              Get Started
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* ═══ Hero Section ═══ */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-8 pb-20">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left — Text */}
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start"
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/50 px-4 py-1.5 backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-glow" />
              <span className="text-xs font-medium text-muted-foreground">
                Join 2,400+ students already connected
              </span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Your campus.{" "}
              <span className="gradient-text">Your knowledge.</span>{" "}
              Connected.
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground"
            >
              The knowledge-sharing network built for university students.
              Ask questions, share resources, find collaborators, and track your skills —
              all in one beautiful platform.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-cyan-glow to-violet-glow text-navy font-semibold text-base shadow-lg shadow-cyan-glow/20 hover:shadow-cyan-glow/40 hover:scale-[1.02] transition-all duration-300"
                >
                  Sign Up Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/feed">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 border-border/60 bg-secondary/30 text-base font-medium hover:bg-secondary/60 transition-all duration-300"
                >
                  Explore Demo
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div custom={4} variants={fadeUp} className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — 3D Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="relative h-[500px] lg:h-[600px]"
          >
            <KnowledgeGlobe />
          </motion.div>
        </div>
      </section>

      {/* ═══ Features Section ═══ */}
      <section className="relative z-10 border-t border-border/30 bg-secondary/10 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center"
          >
            <motion.p custom={0} variants={fadeUp} className="text-sm font-semibold uppercase tracking-widest text-cyan-glow">
              Why Clonnect?
            </motion.p>
            <motion.h2
              custom={1}
              variants={fadeUp}
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Everything your campus needs.{" "}
              <span className="gradient-text">In one place.</span>
            </motion.h2>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  custom={i}
                  variants={fadeUp}
                  className="group glass-card rounded-2xl p-6 transition-all duration-300"
                >
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ready to <span className="gradient-text">connect</span> your campus?
            </motion.h2>
            <motion.p custom={1} variants={fadeUp} className="mt-4 text-muted-foreground text-lg">
              Join thousands of students already sharing knowledge and building together.
            </motion.p>
            <motion.div custom={2} variants={fadeUp} className="mt-8">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="h-13 px-10 bg-gradient-to-r from-cyan-glow to-violet-glow text-navy font-semibold text-base shadow-lg shadow-cyan-glow/20 hover:shadow-cyan-glow/40 hover:scale-[1.02] transition-all duration-300"
                >
                  Get Started — It&apos;s Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 border-t border-border/30 py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-glow to-violet-glow">
              <span className="text-xs font-black text-navy">C</span>
            </div>
            <span className="text-sm font-semibold gradient-text">Clonnect</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Clonnect. Built for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
}
