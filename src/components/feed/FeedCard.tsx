"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  AlertTriangle,
  FileText,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FeedCardProps {
  post: {
    id: string;
    type: "HELP_REQUEST" | "RESOURCE" | "GENERAL";
    title?: string | null;
    content: string;
    isUrgent: boolean;
    createdAt: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
      username: string | null;
      university?: string | null;
    };
    tags: { tagName: string }[];
    _count: { likes: number; comments: number; saves: number };
    userLiked?: boolean;
    userSaved?: boolean;
  };
  onLike?: (postId: string) => void;
  onSave?: (postId: string) => void;
}

export function FeedCard({ post, onLike, onSave }: FeedCardProps) {
  const [liked, setLiked] = useState(post.userLiked ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);

  // Keep local optimistic state in sync when the server sends updated post data (e.g. after refetch).
  /* eslint-disable react-hooks/set-state-in-effect -- syncing props → local UI state after parent refetch */
  useEffect(() => {
    setLiked(post.userLiked ?? false);
    setLikeCount(post._count.likes);
  }, [post.id, post.userLiked, post._count.likes]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isHelp = post.type === "HELP_REQUEST";
  const isResource = post.type === "RESOURCE";
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  async function handleLikeClick() {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1);
    await onLike?.(post.id);
    if (!wasLiked) {
      toast.success("Post liked!", { duration: 1500, position: "bottom-center" });
    }
  }

  return (
    <article className="glass-card rounded-2xl p-5 transition-all duration-300 hover:translate-y-[-1px]">
      {isHelp && post.isUrgent && (
        <div className="flex items-center gap-1.5 mb-3 text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Urgent Help Needed</span>
        </div>
      )}

      {(isHelp || isResource) && (
        <div className="mb-3">
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              isHelp ? "border-amber-500/30 text-amber-400 bg-amber-500/5" : "border-violet-500/30 text-violet-400 bg-violet-500/5"
            )}
          >
            {isHelp ? <Users className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
            {isHelp ? "Help Request" : "Resource"}
          </Badge>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <Link href={`/profile/${post.author.username || post.author.id}`} className="flex items-center gap-3 group">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.image || ""} alt={post.author.name || ""} />
            <AvatarFallback className="bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 text-sm font-semibold">
              {post.author.name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold group-hover:text-primary transition-colors">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">
              {post.author.university && `${post.author.university} · `}
              {timeAgo}
            </p>
          </div>
        </Link>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {post.title && (
        <Link href={`/post/${post.id}`}>
          <h3 className="mb-2 text-lg font-semibold hover:text-primary transition-colors leading-snug">{post.title}</h3>
        </Link>
      )}

      <Link href={`/post/${post.id}`}>
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4 hover:text-foreground transition-colors">
          {post.content}
        </p>
      </Link>

      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((tag) => (
            <Badge
              key={tag.tagName}
              variant="secondary"
              className="text-xs bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer font-mono"
            >
              #{tag.tagName}
            </Badge>
          ))}
        </div>
      )}

      {isHelp && (
        <Link href={`/post/${post.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
            Answer this · {post._count.comments} {post._count.comments === 1 ? "reply" : "replies"}
          </Button>
        </Link>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 gap-1.5 text-xs", liked ? "text-pink-400" : "text-muted-foreground")}
            onClick={handleLikeClick}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            {likeCount > 0 && likeCount}
          </Button>
          <Link href={`/post/${post.id}`}>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {post._count.comments > 0 && post._count.comments}
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 text-xs", post.userSaved ? "text-cyan-400" : "text-muted-foreground")}
            onClick={() => onSave?.(post.id)}
          >
            <Bookmark className={cn("h-4 w-4", post.userSaved && "fill-current")} />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
