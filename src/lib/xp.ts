import { prisma } from "@/lib/prisma";

const XP_VALUES = {
  POST_CREATED: 10,
  POST_LIKED: 2,
  COMMENT_CREATED: 5,
  HELP_ANSWERED: 15,
  RESOURCE_SHARED: 20,
  FOLLOWER_GAINED: 3,
} as const;

export async function awardXP(userId: string, action: keyof typeof XP_VALUES) {
  const amount = XP_VALUES[action];
  await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  });
}
