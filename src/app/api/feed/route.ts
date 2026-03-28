import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/feed — personalized feed
export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "10");
  const tab = searchParams.get("tab") || "foryou";

  let where: Record<string, unknown> = {};

  if (session?.user?.id && tab === "following") {
    // Get IDs of users the current user follows
    const follows = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    const followingIds = follows.map((f) => f.followingId);
    where = { authorId: { in: followingIds } };
  } else if (tab === "resources") {
    where = { type: "RESOURCE" };
  }

  const posts = await prisma.post.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, name: true, image: true, username: true, university: true },
      },
      tags: true,
      files: true,
      _count: { select: { likes: true, comments: true, saves: true } },
    },
  });

  // Check user interactions
  let userLikes: Set<string> = new Set();
  let userSaves: Set<string> = new Set();
  if (session?.user?.id) {
    const postIds = posts.map((p) => p.id);
    const [likes, saves] = await Promise.all([
      prisma.like.findMany({ where: { userId: session.user.id, postId: { in: postIds } } }),
      prisma.save.findMany({ where: { userId: session.user.id, postId: { in: postIds } } }),
    ]);
    userLikes = new Set(likes.map((l) => l.postId));
    userSaves = new Set(saves.map((s) => s.postId));
  }

  let nextCursor: string | undefined;
  if (posts.length > limit) {
    const next = posts.pop();
    nextCursor = next?.id;
  }

  const postsWithInteractions = posts.map((p) => ({
    ...p,
    userLiked: userLikes.has(p.id),
    userSaved: userSaves.has(p.id),
  }));

  return NextResponse.json({ posts: postsWithInteractions, nextCursor });
}
