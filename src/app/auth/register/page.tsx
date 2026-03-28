"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye, EyeOff, Mail, Lock, User, GraduationCap,
  ArrowRight, Loader2, X, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  university: z.string().min(1, "Select your university"),
  department: z.string().min(1, "Select your department"),
  year: z.string().min(1, "Select your year"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const AVAILABLE_SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
  "Machine Learning", "Data Science", "UI/UX Design", "Figma",
  "PostgreSQL", "MongoDB", "Docker", "AWS", "Java", "C++",
  "Flutter", "Swift", "Kotlin", "TensorFlow", "Go", "Rust",
];

const UNIVERSITIES = [
  "MIT", "Stanford University", "IIT Delhi", "IIT Bombay",
  "IIT Madras", "IIT Kanpur", "University of Cambridge",
  "ETH Zurich", "NUS Singapore", "UC Berkeley",
  "Carnegie Mellon", "University of Tokyo", "Other",
];

const DEPARTMENTS = [
  "Computer Science", "Electrical Engineering", "Data Science",
  "Mathematics", "Physics", "Mechanical Engineering",
  "Information Technology", "Artificial Intelligence",
  "Software Engineering", "Biomedical Engineering", "Other",
];

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillSearch, setSkillSearch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function removeSkill(skill: string) {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  }

  const filteredSkills = AVAILABLE_SKILLS.filter(
    (s) =>
      s.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.includes(s)
  );

  async function onSubmit(data: RegisterForm) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, skills: selectedSkills }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || "Registration failed");
        return;
      }
      // Auto sign in after registration
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/feed",
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-glow/5 blur-[120px] animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute bottom-1/3 right-1/3 h-[500px] w-[500px] rounded-full bg-cyan-glow/5 blur-[120px] animate-pulse" style={{ animationDuration: "7s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-glow to-violet-glow shadow-lg shadow-cyan-glow/20">
            <span className="text-xl font-black text-navy">C</span>
          </div>
          <span className="text-2xl font-bold gradient-text">Clonnect</span>
        </Link>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              Create your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Join the campus knowledge network
            </p>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-11 bg-secondary/30 border-border/60 hover:bg-secondary/60 font-medium"
            onClick={() => signIn("google", { callbackUrl: "/feed" })}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-6">
            <Separator className="bg-border/40" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              or register with email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" placeholder="John Doe" className="pl-10 bg-secondary/30 border-border/50" {...register("name")} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@university.edu" className="pl-10 bg-secondary/30 border-border/50" {...register("email")} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password Row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 bg-secondary/30 border-border/50"
                    {...register("password")}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="bg-secondary/30 border-border/50"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* University & Dept */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>University</Label>
                <Select onValueChange={(v) => setValue("university", v as string)}>
                  <SelectTrigger className="bg-secondary/30 border-border/50">
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIVERSITIES.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.university && <p className="text-xs text-destructive">{errors.university.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select onValueChange={(v) => setValue("department", v as string)}>
                  <SelectTrigger className="bg-secondary/30 border-border/50">
                    <SelectValue placeholder="Select dept" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
              </div>
            </div>

            {/* Year */}
            <div className="space-y-2">
              <Label>Year</Label>
              <Select onValueChange={(v) => setValue("year", v as string)}>
                <SelectTrigger className="bg-secondary/30 border-border/50 w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((y) => (
                    <SelectItem key={y} value={String(y)}>Year {y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Skills — What do you know?</Label>
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="gap-1 bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => removeSkill(skill)}
                    >
                      {skill}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
              <Input
                placeholder="Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="bg-secondary/30 border-border/50"
              />
              <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto">
                {filteredSkills.slice(0, 12).map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="cursor-pointer border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                    onClick={() => toggleSkill(skill)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-cyan-glow to-violet-glow text-navy font-semibold shadow-lg shadow-cyan-glow/20 hover:shadow-cyan-glow/40 transition-all duration-300"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Creating account..." : "Create Account"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
