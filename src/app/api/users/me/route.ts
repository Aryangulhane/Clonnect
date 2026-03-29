import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, id: true },
  });

  const destination = user?.username ?? user?.id ?? session.user.id;
  return NextResponse.redirect(new URL(`/profile/${destination}`, req.url));
}
