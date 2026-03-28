import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createPostSchema = z.object({
  type: z.enum(["HELP_REQUEST", "RESOURCE", "GENERAL"]).default("GENERAL"),
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  isUrgent: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

// GET /api/posts — list with cursor pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "10");
  const type = searchParams.get("type");

  const where = type ? { type: type as "HELP_REQUEST" | "RESOURCE" | "GENERAL" } : {};

  const posts = await prisma.post.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { id: true, name: true, image: true, username: true, university: true } },
      tags: true,
      _count: { select: { likes: true, comments: true, saves: true } },
      files: true,
    },
  });

  let nextCursor: string | undefined;
  if (posts.length > limit) {
    const next = posts.pop();
    nextCursor = next?.id;
  }

  return NextResponse.json({ posts, nextCursor });
}

// POST /api/posts — create
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }

    const { type, title, content, isUrgent, tags } = parsed.data;

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        type,
        title,
        content,
        isUrgent,
        tags: tags ? { create: tags.map((t) => ({ tagName: t })) } : undefined,
      },
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        tags: true,
        _count: { select: { likes: true, comments: true, saves: true } },
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
