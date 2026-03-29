import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  scheduledAt: z.string().datetime(),
  maxMembers: z.number().int().min(2).max(100).optional(),
  topic: z.string().min(1),
});

export async function GET() {
  const groups = await prisma.studyGroup.findMany({
    where: { scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    take: 50,
    include: {
      creator: { select: { id: true, name: true, image: true, username: true } },
      members: { select: { id: true } },
    },
  });

  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, scheduledAt, maxMembers, topic } = parsed.data;

  const group = await prisma.studyGroup.create({
    data: {
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      maxMembers: maxMembers ?? 10,
      topic,
      creatorId: session.user.id,
      members: { create: { userId: session.user.id } },
    },
    include: {
      creator: { select: { id: true, name: true, image: true, username: true } },
      members: { select: { id: true } },
    },
  });

  return NextResponse.json(group, { status: 201 });
}
