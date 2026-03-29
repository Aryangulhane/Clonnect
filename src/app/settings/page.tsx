"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, Save, Settings as SettingsIcon, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SettingsUser = {
  id: string;
  name: string | null;
  username: string | null;
  bio: string | null;
  university: string | null;
  department: string | null;
  year: number | null;
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { data, isLoading } = useQuery({
    queryKey: ["settings-user", userId],
    queryFn: () => fetch(`/api/users/${userId}`).then((res) => res.json()),
    enabled: !!userId,
  });

  const user = data as SettingsUser | undefined;
  const [form, setForm] = useState({
    name: "",
    bio: "",
    university: "",
    department: "",
    year: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || ("error" in user && user.error)) return;
    setForm({
      name: user.name ?? "",
      bio: user.bio ?? "",
      university: user.university ?? "",
      department: user.department ?? "",
      year: user.year ? String(user.year) : "",
    });
  }, [user]);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      queryClient.invalidateQueries({ queryKey: ["settings-user", userId] });
      toast.success("Profile updated");
    } catch {
      toast.error("Could not save your settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="mx-auto max-w-3xl px-4 py-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card rounded-2xl p-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                  <SettingsIcon className="h-6 w-6 text-primary" />
                  Account Settings
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Update the details that appear on your public campus profile.
                </p>
              </div>

              <div className="mt-6 glass-card rounded-2xl p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{session?.user?.name || form.name || "Your profile"}</p>
                        <p className="text-sm text-muted-foreground">@{user?.username || "username"}</p>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Display name</Label>
                        <Input
                          id="name"
                          value={form.name}
                          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                          className="bg-secondary/30 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          value={form.year}
                          onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
                          className="bg-secondary/30 border-border/50"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="university">University</Label>
                        <Input
                          id="university"
                          value={form.university}
                          onChange={(event) => setForm((current) => ({ ...current, university: event.target.value }))}
                          className="bg-secondary/30 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={form.department}
                          onChange={(event) => setForm((current) => ({ ...current, department: event.target.value }))}
                          className="bg-secondary/30 border-border/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={form.bio}
                        onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                        className="min-h-[120px] resize-none bg-secondary/30 border-border/50"
                        placeholder="Tell the campus community a little about yourself..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="gap-2 bg-gradient-to-r from-cyan-glow to-violet-glow text-navy font-semibold"
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save changes
                      </Button>
                    </div>
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
