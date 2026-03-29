import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  university: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, password, university, department, year, skills } = parsed.data;

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + Math.floor(Math.random() * 100);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        username,
        university: university || null,
        department: department || null,
        year: year ? parseInt(year) : null,
        image: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      },
    });

    // Assign skills
    if (skills && skills.length > 0) {
      for (const skillName of skills) {
        const skill = await prisma.skill.findUnique({ where: { name: skillName } });
        if (skill) {
          await prisma.userSkill.create({
            data: {
              userId: user.id,
              skillId: skill.id,
              proficiencyLevel: 3,
            },
          });
        }
      }
    }

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
