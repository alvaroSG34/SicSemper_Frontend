import type { ParticipantSubcategoryOption } from "@/domain/participant/participant.types";

export const hasModelsInSubtree = (
  categoryId: string,
  subcategoriesByCategory: Record<string, ParticipantSubcategoryOption[]>,
  modelLeafCategoryIdSet: Set<string>,
) => {
  const queue = [categoryId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);
    if (modelLeafCategoryIdSet.has(current)) {
      return true;
    }

    const children = subcategoriesByCategory[current] ?? [];
    for (const child of children) {
      if (!visited.has(child.id)) {
        queue.push(child.id);
      }
    }
  }

  return false;
};

