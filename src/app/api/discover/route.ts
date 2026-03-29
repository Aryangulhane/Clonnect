import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type DiscoverUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    image: true;
    username: true;
    university: true;
    department: true;
    year: true;
    skills: { include: { skill: true }; take: 5 };
    _count: { select: { followers: true; posts: true } };
  };
}>;

type DiscoverPost = Prisma.PostGetPayload<{
  include: {
    author: { select: { id: true; name: true; image: true; username: true } };
    tags: true;
    _count: { select: { likes: true; comments: true; saves: true } };
  };
}>;

type DiscoverResponse = {
  users?: DiscoverUser[];
  posts?: Array<DiscoverPost & { userLiked?: boolean; userSaved?: boolean }>;
};

// GET /api/discover — search users and posts
export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all"; // users | posts | all
  const skill = searchParams.get("skill");
  const department = searchParams.get("department");

  const results: DiscoverResponse = {};

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

    const posts = await prisma.post.findMany({
      where: postWhere,
      take: 20,
      include: {
        author: { select: { id: true, name: true, image: true, username: true } },
        tags: true,
        _count: { select: { likes: true, comments: true, saves: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (session?.user?.id && posts.length > 0) {
      const postIds = posts.map((post) => post.id);
      const [likes, saves] = await Promise.all([
        prisma.like.findMany({
          where: { userId: session.user.id, postId: { in: postIds } },
          select: { postId: true },
        }),
        prisma.save.findMany({
          where: { userId: session.user.id, postId: { in: postIds } },
          select: { postId: true },
        }),
      ]);

      const likedIds = new Set(likes.map((like) => like.postId));
      const savedIds = new Set(saves.map((save) => save.postId));

      results.posts = posts.map((post) => ({
        ...post,
        userLiked: likedIds.has(post.id),
        userSaved: savedIds.has(post.id),
      }));
    } else {
      results.posts = posts;
    }
  }

  return NextResponse.json(results);
}
