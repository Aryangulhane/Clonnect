import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [newPosts, topHelp, newUsers] = await Promise.all([
    prisma.post.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.post.findMany({
      where: { type: "HELP_REQUEST", createdAt: { gte: oneWeekAgo } },
      orderBy: { likes: { _count: "desc" } },
      take: 3,
      include: { author: { select: { name: true } }, _count: { select: { likes: true } } },
    }),
    prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
  ]);

  return NextResponse.json({ newPosts, topHelp, newUsers, period: "last 7 days" });
}
