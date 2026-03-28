import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/discover — search users and posts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all"; // users | posts | all
  const skill = searchParams.get("skill");
  const department = searchParams.get("department");

  const results: { users?: unknown[]; posts?: unknown[] } = {};

  if (type === "users" || type === "all") {
    const userWhere: Record<string, unknown> = {};
    if (query) {
      userWhere.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { username: { contains: query, mode: "insensitive" } },
        { university: { contains: query, mode: "insensitive" } },
      ];
    }
    if (department) {
      userWhere.department = department;
    }
    if (skill) {
      userWhere.skills = { some: { skill: { name: skill } } };
    }

    results.users = await prisma.user.findMany({
      where: userWhere,
      take: 20,
      select: {
        id: true,
        name: true,
        image: true,
        username: true,
        university: true,
        department: true,
        year: true,
        skills: { include: { skill: true }, take: 5 },
        _count: { select: { followers: true, posts: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (type === "posts" || type === "all") {
    const postWhere: Record<string, unknown> = {};
    if (query) {
      postWhere.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
        { tags: { some: { tagName: { contains: query, mode: "insensitive" } } } },
      ];
    }

    results.posts = await prisma.post.findMany({
      where: postWhere,
      take: 20,
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        tags: true,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json(results);
}
