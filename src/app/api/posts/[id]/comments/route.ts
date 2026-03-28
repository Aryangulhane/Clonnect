import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1),
  parentCommentId: z.string().optional(),
});

// GET /api/posts/[id]/comments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id, parentCommentId: null },
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
  });

  return NextResponse.json(comments);
}

// POST /api/posts/[id]/comments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      postId: id,
      authorId: session.user.id,
      content: parsed.data.content,
      parentCommentId: parsed.data.parentCommentId || null,
    },
    include: {
      author: { select: { id: true, name: true, image: true, username: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
