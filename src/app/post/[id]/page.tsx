"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  Heart, MessageCircle, Bookmark, Share2, ArrowLeft,
  Send, AlertTriangle, FileText, Users, Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/layout/Navbar";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils";

interface CommentAuthor {
  id: string;
  name: string | null;
  image: string | null;
  username: string | null;
}

interface CommentNode {
  id: string;
  content: string;
  createdAt: string;
  author: CommentAuthor;
  replies?: CommentNode[];
}

function CommentThread({
  comment,
  postId,
  onReply,
}: {
  comment: CommentNode;
  postId: string;
  onReply: () => void;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleReply() {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent, parentCommentId: comment.id }),
    });
    setReplyContent("");
    setShowReplyBox(false);
    setSubmitting(false);
    onReply();
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.author.image || ""} />
          <AvatarFallback className="bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 text-xs">
            {comment.author.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="rounded-xl bg-secondary/30 px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/profile/${comment.author.username || comment.author.id}`} className="text-sm font-semibold hover:text-primary transition-colors">
                {comment.author.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
          </div>
          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="mt-1 ml-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Reply
          </button>
          {showReplyBox && (
            <div className="mt-2 flex gap-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] bg-secondary/20 border-border/40 text-sm resize-none"
              />
              <Button size="icon" className="shrink-0 h-10 w-10 bg-primary" onClick={handleReply} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-3 border-l-2 border-border/20 pl-4">
          {comment.replies.map((reply: CommentNode) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={reply.author.image || ""} />
                <AvatarFallback className="bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 text-[10px]">
                  {reply.author.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="rounded-xl bg-secondary/20 px-3 py-2 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold">{reply.author.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: () => fetch(`/api/posts/${id}`).then((r) => r.json()),
  });

  async function handleLike() {
    await fetch(`/api/posts/${id}/like`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["post", id] });
  }

  async function handleSave() {
    await fetch(`/api/posts/${id}/save`, { method: "POST" });
    queryClient.invalidateQueries({ queryKey: ["post", id] });
  }

  async function handleComment() {
    if (!commentContent.trim()) return;
    setSubmitting(true);
    await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: commentContent }),
    });
    setCommentContent("");
    setSubmitting(false);
    queryClient.invalidateQueries({ queryKey: ["post", id] });
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="glass-card rounded-2xl p-8 space-y-4">
            <div className="h-6 w-3/4 skeleton-shimmer rounded" />
            <div className="h-4 w-full skeleton-shimmer rounded" />
            <div className="h-4 w-5/6 skeleton-shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!post || post.error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <Link href="/feed"><Button className="mt-4">Back to Feed</Button></Link>
        </div>
      </div>
    );
  }

  const isHelp = post.type === "HELP_REQUEST";
  const isResource = post.type === "RESOURCE";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 pb-24 lg:pb-8">
        {/* Back button */}
        <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6 md:p-8"
        >
          {/* Badges */}
          {isHelp && post.isUrgent && (
            <div className="flex items-center gap-1.5 mb-3 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Urgent Help Needed</span>
            </div>
          )}
          {(isHelp || isResource) && (
            <Badge variant="outline" className={cn("mb-4 text-xs", isHelp ? "border-amber-500/30 text-amber-400" : "border-violet-500/30 text-violet-400")}>
              {isHelp ? <Users className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
              {isHelp ? "Help Request" : "Resource"}
            </Badge>
          )}

          {/* Author */}
          <div className="flex items-center gap-3 mb-5">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.image || ""} />
              <AvatarFallback className="bg-gradient-to-br from-cyan-glow/20 to-violet-glow/20 font-semibold">
                {post.author.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/profile/${post.author.username || post.author.id}`} className="font-semibold hover:text-primary transition-colors">
                {post.author.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {post.author.university} · {post.author.department} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Content */}
          {post.title && <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>{post.title}</h1>}
          <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{post.content}</div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.map((tag: { tagName: string }) => (
                <Badge key={tag.tagName} variant="secondary" className="text-xs font-mono bg-secondary/50">#{tag.tagName}</Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/30">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className={cn("gap-1.5", post.userLiked ? "text-pink-400" : "text-muted-foreground")} onClick={handleLike}>
                <Heart className={cn("h-4 w-4", post.userLiked && "fill-current")} />
                {post._count?.likes || 0} likes
              </Button>
              <span className="text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4 inline mr-1" />
                {post._count?.comments || 0} comments
              </span>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className={cn(post.userSaved ? "text-cyan-400" : "text-muted-foreground")} onClick={handleSave}>
                <Bookmark className={cn("h-4 w-4", post.userSaved && "fill-current")} />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground"><Share2 className="h-4 w-4" /></Button>
            </div>
          </div>
        </motion.article>

        {/* Comment box */}
        <div className="mt-6 glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-3">Add a comment</h3>
          <div className="flex gap-3">
            <Textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Write your thoughts..."
              className="min-h-[80px] bg-secondary/20 border-border/40 resize-none"
            />
          </div>
          <div className="flex justify-end mt-3">
            <Button onClick={handleComment} disabled={!commentContent.trim() || submitting} className="bg-gradient-to-r from-cyan-glow to-violet-glow text-navy font-semibold">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Comment
            </Button>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-semibold">Comments ({post.comments?.length || 0})</h3>
          {post.comments?.map((comment: CommentNode) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              postId={id}
              onReply={() => queryClient.invalidateQueries({ queryKey: ["post", id] })}
            />
          ))}
          {(!post.comments || post.comments.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first to reply!</p>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
