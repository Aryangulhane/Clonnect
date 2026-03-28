import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST /api/posts/[id]/save — toggle save
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.save.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: id } },
  });

  if (existing) {
    await prisma.save.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.save.create({ data: { userId: session.user.id, postId: id } });
    return NextResponse.json({ saved: true });
  }
}
