import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type UserSkillRow = {
  skill: { name: string };
  proficiencyLevel: number;
};

type PopularTagRow = {
  tagName: string;
  _count: { tagName: number };
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { skills: { include: { skill: true } } },
  });

  const popularTags = await prisma.postTag.groupBy({
    by: ["tagName"],
    _count: { tagName: true },
    orderBy: { _count: { tagName: "desc" } },
    take: 20,
  });

  const userSkillNames =
    user?.skills.map((s: UserSkillRow) => s.skill.name.toLowerCase()) ?? [];
  const gaps = popularTags
    .map((t: PopularTagRow) => t.tagName)
    .filter((tag: string) => !userSkillNames.includes(tag.toLowerCase()))
    .slice(0, 5);

  return NextResponse.json({
    currentSkills:
      user?.skills.map((s: UserSkillRow) => ({
        name: s.skill.name,
        level: s.proficiencyLevel,
      })) ?? [],
    suggestedSkills: gaps,
    popularTags: popularTags.map((t: PopularTagRow) => ({
      name: t.tagName,
      count: t._count.tagName,
    })),
  });
}
