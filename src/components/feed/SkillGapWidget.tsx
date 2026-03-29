"use client";

import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SkillGapWidget() {
  const { data } = useQuery({
    queryKey: ["skill-gap"],
    queryFn: () => fetch("/api/ai/skill-gap").then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  if (!data?.suggestedSkills?.length) return null;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold">Skills in demand</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Peers are posting about these — consider learning them:
      </p>
      <div className="flex flex-wrap gap-1.5">
        {data.suggestedSkills.map((skill: string) => (
          <Badge
            key={skill}
            variant="outline"
            className="text-xs border-amber-500/30 text-amber-400 cursor-pointer hover:bg-amber-500/10 gap-1"
          >
            <Plus className="h-3 w-3" />
            {skill}
          </Badge>
        ))}
      </div>
    </div>
  );
}
