import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";

// POST /api/users/[id]/follow — toggle follow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (session.user.id === id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: id,
      },
    },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  } else {
    await prisma.follow.create({
      data: { followerId: session.user.id, followingId: id },
    });
    // Create notification
    await prisma.notification.create({
      data: {
        userId: id,
        type: "FOLLOW",
        message: `${session.user.name || "Someone"} started following you!`,
        linkUrl: `/profile/${session.user.id}`,
      },
    });
    if (pusherServer) {
      try {
        await pusherServer.trigger(`user-${id}`, "new-notification", {
          message: `${session.user.name} started following you!`,
          type: "FOLLOW",
        });
      } catch {
        /* Pusher optional in dev */
      }
    }
    return NextResponse.json({ following: true });
  }
}
