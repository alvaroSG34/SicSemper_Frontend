import type { JudgeAssignedEvent } from "@/domain/judge/judge.types";

type JudgeAssignedScope = JudgeAssignedEvent["assignedScopes"][number];

export type GroupedJudgeAssignedScope = {
  categoryName: string;
  includesGeneralScope: boolean;
  subcategories: string[];
};

export const groupJudgeAssignedScopes = (
  assignedScopes: JudgeAssignedScope[],
): GroupedJudgeAssignedScope[] => {
  const byCategory = new Map<
    string,
    {
      includesGeneralScope: boolean;
      subcategorySet: Set<string>;
    }
  >();

  for (const scope of assignedScopes) {
    const entry = byCategory.get(scope.categoryName) ?? {
      includesGeneralScope: false,
      subcategorySet: new Set<string>(),
    };

    if (scope.subcategoryName) {
      entry.subcategorySet.add(scope.subcategoryName);
    } else {
      entry.includesGeneralScope = true;
    }

    byCategory.set(scope.categoryName, entry);
  }

  return Array.from(byCategory.entries())
    .map(([categoryName, entry]) => ({
      categoryName,
      includesGeneralScope: entry.includesGeneralScope,
      subcategories: Array.from(entry.subcategorySet).sort((left, right) =>
        left.localeCompare(right),
      ),
    }))
    .sort((left, right) => left.categoryName.localeCompare(right.categoryName));
};
