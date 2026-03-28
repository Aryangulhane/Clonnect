import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/posts/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, image: true, username: true, university: true, department: true } },
      tags: true,
      files: true,
      _count: { select: { likes: true, comments: true, saves: true } },
      comments: {
        where: { parentCommentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, image: true, username: true } },
          replies: {
            include: {
              author: { select: { id: true, name: true, image: true, username: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  // Check if current user liked/saved
  const session = await auth();
  let userLiked = false;
  let userSaved = false;
  if (session?.user?.id) {
    const [like, save] = await Promise.all([
      prisma.like.findUnique({ where: { userId_postId: { userId: session.user.id, postId: id } } }),
      prisma.save.findUnique({ where: { userId_postId: { userId: session.user.id, postId: id } } }),
    ]);
    userLiked = !!like;
    userSaved = !!save;
  }

  return NextResponse.json({ ...post, userLiked, userSaved });
}

// PATCH /api/posts/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (post.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.post.update({
    where: { id },
    data: {
      title: body.title,
      content: body.content,
      isUrgent: body.isUrgent,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/posts/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (post.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ message: "Post deleted" });
}
