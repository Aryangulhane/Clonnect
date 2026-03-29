import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      improved: content as string,
      tags: [] as string[],
      message: "ANTHROPIC_API_KEY is not configured",
    });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `You are helping a university student improve their help request post on a campus knowledge-sharing platform.

Given this post:
"${content}"

Return ONLY a JSON object (no markdown) with:
{
  "improved": "The rewritten post — clearer, more specific, more likely to get helpful answers. Keep the student's voice. Max 300 words.",
  "tags": ["tag1", "tag2", "tag3"]
}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ improved: content, tags: [] });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "{}";

  try {
    const parsed = JSON.parse(String(text).replace(/```json|```/g, "").trim());
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ improved: content, tags: [] });
  }
}
