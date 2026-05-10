"use client";

import { Clock3 } from "lucide-react";

type JudgePendingCountBadgeProps = {
  count: number;
};

export function JudgePendingCountBadge({ count }: JudgePendingCountBadgeProps) {
  if (count <= 0) {
    return null;
  }

  const label = count === 1 ? "maqueta por calificar" : "maquetas por calificar";

  return (
    <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#F2B740]">
      <Clock3 className="h-3.5 w-3.5" />
      <span>
        {count} {label}
      </span>
    </p>
  );
}
