import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { awardXP } from "@/lib/xp";
import { z } from "zod";

const createPostSchema = z.object({
  type: z.enum(["HELP_REQUEST", "RESOURCE", "GENERAL"]).default("GENERAL"),
  title: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  isUrgent: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  fileUrls: z.array(z.object({ url: z.string(), name: z.string() })).optional(),
});

// GET /api/posts — list with cursor pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "10");
  const type = searchParams.get("type");
  const authorId = searchParams.get("authorId");

  const where: Record<string, unknown> = {};
  if (type) where.type = type as "HELP_REQUEST" | "RESOURCE" | "GENERAL";
  if (authorId) where.authorId = authorId;

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

    const { type, title, content, isUrgent, tags, fileUrls } = parsed.data;

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        type,
        title,
        content,
        isUrgent,
        tags: tags ? { create: tags.map((t) => ({ tagName: t })) } : undefined,
        files:
          fileUrls && fileUrls.length > 0
            ? {
                create: fileUrls.map((f) => ({
                  url: f.url,
                  name: f.name,
                  size: 0,
                  type: "application/octet-stream",
                  userId: session.user.id,
                })),
              }
            : undefined,
      },
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        tags: true,
        _count: { select: { likes: true, comments: true, saves: true } },
      },
    });

    await awardXP(session.user.id, "POST_CREATED");

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
