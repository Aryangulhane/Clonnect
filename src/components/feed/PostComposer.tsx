"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ImageIcon, FileText, HelpCircle, Send, Loader2, X, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type PostType = "GENERAL" | "RESOURCE" | "HELP_REQUEST";

const postTypes = [
  { type: "GENERAL" as PostType, label: "Photo", icon: ImageIcon, color: "text-cyan-400" },
  { type: "RESOURCE" as PostType, label: "Resource", icon: FileText, color: "text-violet-400" },
  { type: "HELP_REQUEST" as PostType, label: "Ask Help", icon: HelpCircle, color: "text-amber-400" },
];

export function PostComposer({ onPostCreated }: { onPostCreated?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [postType, setPostType] = useState<PostType>("GENERAL");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);

  function addTag() {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: postType, title: title || undefined, content, isUrgent, tags }),
      });
      setContent("");
      setTitle("");
      setTags([]);
      setIsUrgent(false);
      setExpanded(false);
      onPostCreated?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      layout
      className="glass-card rounded-2xl p-4 transition-all duration-300"
    >
      {/* Type selector */}
      <div className="flex items-center gap-2 mb-3">
        {postTypes.map((pt) => {
          const Icon = pt.icon;
          return (
            <button
              key={pt.type}
              onClick={() => { setPostType(pt.type); setExpanded(true); }}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200",
                postType === pt.type && expanded
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 border border-transparent"
              )}
            >
              <Icon className={cn("h-3.5 w-3.5", postType === pt.type && expanded ? pt.color : "")} />
              {pt.label}
            </button>
          );
        })}
      </div>

      {/* Compact view */}
      {!expanded && (
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 text-sm">U</AvatarFallback>
          </Avatar>
          <div className="flex-1 rounded-xl bg-secondary/30 px-4 py-2.5 text-sm text-muted-foreground">
            What&apos;s on your mind? Share knowledge...
          </div>
        </div>
      )}

      {/* Expanded view */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3"
        >
          {(postType === "HELP_REQUEST" || postType === "RESOURCE") && (
            <Input
              placeholder={postType === "HELP_REQUEST" ? "What do you need help with?" : "Resource title"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary/30 border-border/50 font-medium"
            />
          )}

          <Textarea
            placeholder={
              postType === "HELP_REQUEST"
                ? "Describe your problem in detail..."
                : postType === "RESOURCE"
                ? "Describe this resource..."
                : "Share your thoughts..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] bg-secondary/30 border-border/50 resize-none"
          />

          {/* Tags input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Add tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                className="bg-secondary/30 border-border/50 text-sm h-8"
              />
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 bg-primary/10 text-primary text-xs cursor-pointer" onClick={() => removeTag(tag)}>
                    #{tag} <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Urgent toggle for help requests */}
          {postType === "HELP_REQUEST" && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="rounded border-border" />
              <span className="text-xs font-medium text-amber-400">🔥 Mark as Urgent</span>
            </label>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} className="text-muted-foreground text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!content.trim() || loading}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-cyan-glow to-violet-glow text-navy font-semibold shadow-sm hover:shadow-lg transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
              Post
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
