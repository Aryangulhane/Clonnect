import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/users/[id] — profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Allow lookup by id or username
  const user = await prisma.user.findFirst({
    where: { OR: [{ id }, { username: id }] },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      username: true,
      university: true,
      department: true,
      year: true,
      bio: true,
      createdAt: true,
      skills: {
        include: { skill: true },
      },
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if current user follows this user
  const session = await auth();
  let isFollowing = false;
  if (session?.user?.id && session.user.id !== user.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  return NextResponse.json({ ...user, isFollowing });
}

// PUT /api/users/[id] — update profile
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (session.user.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      bio: body.bio,
      university: body.university,
      department: body.department,
      year: body.year ? parseInt(body.year) : undefined,
    },
  });

  return NextResponse.json(updated);
}
