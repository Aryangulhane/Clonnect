"use client";

import { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  content: string;
  onSuggest: (improved: string, tags: string[]) => void;
}

export function SmartHelpButton({ content, onSuggest }: Props) {
  const [loading, setLoading] = useState(false);

  async function improve() {
    if (!content.trim() || content.length < 20) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/improve-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      onSuggest(data.improved, data.tags);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={improve}
      disabled={loading || content.length < 20}
      className="text-violet-400 hover:text-violet-300 gap-1.5 text-xs"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
      Improve with AI
    </Button>
  );
}
