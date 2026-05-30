import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type {
  AdminClub,
  CatalogCategory,
  CatalogEvent,
  CatalogEventStatus,
  CatalogScale,
  CatalogSubcategory,
  EventCategoryOption,
  EventDeleteImpact,
  JudgeAssignmentScope,
} from '@/domain/admin/admin.types';
import { adminEventsService } from '@/application/admin/services/admin-events.service';
import { adminUploadsService } from '@/application/admin/services/admin-uploads.service';
import { useAdminOperations } from './use-admin-operations';
import { useAdminStore } from '@/presentation/stores/admin.store';
import {
  combineLaPazDateAndTimeToUtcIso,
  splitUtcIsoToLaPazDateAndTime,
  toLaPazDateTimeTimestamp,
} from '@/core/utils/event-datetime';

type EventModalMode = 'create' | 'edit';
type EventModalTab = 'datos' | 'categorias' | 'escalas';

type EventFormState = {
  organizerClubId: string;
  name: string;
  place: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: CatalogEventStatus;
  description: string;
  imageUrl: string;
};

type EventCategoryRemovalImpact = {
  removedEventCategoryIds: string[];
  removedCategoryNames: string[];
  removedAssignmentsCount: number;
};

type EventCategoryTreeNode = {
  id: string;
  name: string;
  depth: number;
  children: EventCategoryTreeNode[];
};

type EventCategoryNodeSelectionState = {
  checked: boolean;
  indeterminate: boolean;
  selectedLeaves: number;
  totalLeaves: number;
};

type Step3ScaleCategoryItem = {
  id: string;
  name: string;
  subcategoriesCount: number;
  specialtiesCount: number;
};

type Step3ScaleSubcategoryItem = {
  id: string;
  categoryId: string;
  name: string;
  specialtiesCount: number;
};

type Step3ScaleSpecialtyItem = {
  id: string;
  categoryId: string;
  subcategoryId: string;
  name: string;
  pathLabel: string;
  activeScalesCount: number;
  isConfigured: boolean;
};

type EventScaleGroupDraft = {
  id?: string;
  name: string;
  scaleIds: string[];
};

const emptyEventForm: EventFormState = {
  organizerClubId: '',
  name: '',
  place: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  status: 'BORRADOR',
  description: '',
  imageUrl: '',
};

export const eventStatusOptions: CatalogEventStatus[] = ['ACTIVO', 'PAUSADO', 'BORRADOR', 'FINALIZADO'];

type UseAdminEventsParams = {
  events: CatalogEvent[];
  clubs: AdminClub[];
  categories: CatalogCategory[];
  subcategories: CatalogSubcategory[];
  eventCategories: EventCategoryOption[];
  scales: CatalogScale[];
  assignments: JudgeAssignmentScope[];
  canReadJudgeAssignments: boolean;
};

export const useAdminEvents = ({
  events,
  clubs,
  categories,
  subcategories,
  eventCategories,
  scales,
  assignments,
  canReadJudgeAssignments,
}: UseAdminEventsParams) => {
  const { createEventAndLinkCategories, updateEventAndLinkCategories, getEventDeleteImpact, removeEvent } =
    useAdminOperations();
  const clearError = useAdminStore((state) => state.clearError);

  const [eventSearch, setEventSearch] = useState('');
  const [eventStatusFilter, setEventStatusFilter] = useState<'TODOS' | CatalogEventStatus>('TODOS');
  const [eventModalMode, setEventModalMode] = useState<EventModalMode | null>(null);
  const [activeEventTab, setActiveEventTab] = useState<EventModalTab>('datos');
  const [eventModalSelectedLeafIds, setEventModalSelectedLeafIds] = useState<Set<string>>(
    new Set(),
  );
  const [eventModalTargetId, setEventModalTargetId] = useState<string | null>(null);
  const [eventModalError, setEventModalError] = useState<string | null>(null);
  const [eventModalScaleConfigLoading, setEventModalScaleConfigLoading] =
    useState(false);
  const [eventForm, setEventForm] = useState<EventFormState>(emptyEventForm);
  const [eventModalScaleIdsByCategoryId, setEventModalScaleIdsByCategoryId] =
    useState<Record<string, string[]>>({});
  const [eventModalScaleGroupsByCategoryId, setEventModalScaleGroupsByCategoryId] =
    useState<Record<string, EventScaleGroupDraft[]>>({});
  const [eventModalScaleGroupsLoading, setEventModalScaleGroupsLoading] =
    useState(false);
  const [eventModalScaleCategorySearch, setEventModalScaleCategorySearch] = useState('');
  const [eventModalScaleSubcategorySearch, setEventModalScaleSubcategorySearch] = useState('');
  const [eventModalScaleSpecialtySearch, setEventModalScaleSpecialtySearch] = useState('');
  const [eventModalSelectedScaleCategoryId, setEventModalSelectedScaleCategoryId] =
    useState<string | null>(null);
  const [eventModalSelectedScaleSubcategoryId, setEventModalSelectedScaleSubcategoryId] =
    useState<string | null>(null);
  const [eventModalSelectedScaleLeafId, setEventModalSelectedScaleLeafId] = useState<string | null>(null);
  const [eventModalScaleDraftIds, setEventModalScaleDraftIds] = useState<string[]>([]);
  const [isEventImageUploading, setIsEventImageUploading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [eventDeleteImpactModal, setEventDeleteImpactModal] = useState<{
    eventId: string;
    eventName: string;
    impact: EventDeleteImpact | null;
    loading: boolean;
    error: string | null;
  } | null>(null);

  const eventImageFileInputRef = useRef<HTMLInputElement | null>(null);

  const subcategoriesByParentId = useMemo(() => {
    const map = new Map<string, CatalogSubcategory[]>();
    subcategories.forEach((subcategory) => {
      const current = map.get(subcategory.categoryId) ?? [];
      current.push(subcategory);
      map.set(subcategory.categoryId, current);
    });

    for (const [parentId, children] of map.entries()) {
      map.set(
        parentId,
        [...children].sort((left, right) => left.name.localeCompare(right.name)),
      );
    }

    return map;
  }, [subcategories]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = eventSearch.trim().toLowerCase();

    return events.filter((eventItem) => {
      const matchesStatus = eventStatusFilter === 'TODOS' ? true : eventItem.status === eventStatusFilter;
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : `${eventItem.name} ${eventItem.place ?? ''} ${eventItem.description ?? ''}`
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [eventSearch, eventStatusFilter, events]);

  const eventModalCategoryTree = useMemo<EventCategoryTreeNode[]>(() => {
    const buildChildren = (
      parentId: string,
      depth: number,
      ancestry: Set<string>,
    ): EventCategoryTreeNode[] => {
      const children = subcategoriesByParentId.get(parentId) ?? [];
      if (depth >= 3) {
        return [];
      }

      return children.map((child) => {
        if (ancestry.has(child.id)) {
          return {
            id: child.id,
            name: child.name,
            depth: depth + 1,
            children: [],
          };
        }

        const nextAncestry = new Set(ancestry);
        nextAncestry.add(child.id);
        return {
          id: child.id,
          name: child.name,
          depth: depth + 1,
          children: buildChildren(child.id, depth + 1, nextAncestry),
        };
      });
    };

    return [...categories]
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((rootCategory) => ({
        id: rootCategory.id,
        name: rootCategory.name,
        depth: 1,
        children: buildChildren(rootCategory.id, 1, new Set<string>([rootCategory.id])),
      }));
  }, [categories, subcategoriesByParentId]);

  const categoryLeafIdsByNodeId = useMemo(() => {
    const map = new Map<string, string[]>();

    const visitNode = (node: EventCategoryTreeNode): string[] => {
      if (node.children.length === 0) {
        map.set(node.id, [node.id]);
        return [node.id];
      }

      const leafIds = Array.from(
        new Set(node.children.flatMap((childNode) => visitNode(childNode))),
      );
      map.set(node.id, leafIds);
      return leafIds;
    };

    eventModalCategoryTree.forEach((rootNode) => {
      visitNode(rootNode);
    });

    return map;
  }, [eventModalCategoryTree]);

  const allLeafNodeIds = useMemo(
    () =>
      new Set(
        [...categoryLeafIdsByNodeId.entries()]
          .filter(([nodeId, leafIds]) => leafIds.length === 1 && leafIds[0] === nodeId)
          .map(([nodeId]) => nodeId),
      ),
    [categoryLeafIdsByNodeId],
  );

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const subcategoriesById = useMemo(
    () => new Map(subcategories.map((subcategory) => [subcategory.id, subcategory])),
    [subcategories],
  );

  const categoryNameByLeafId = useMemo(() => {
    const map = new Map<string, string>();
    eventCategories.forEach((item) => {
      if (!map.has(item.categoryId)) {
        map.set(item.categoryId, item.name);
      }
    });
    return map;
  }, [eventCategories]);

  const collectSelectedLeafCategoryIds = useCallback(
    () =>
      [...eventModalSelectedLeafIds].filter((leafId) =>
        allLeafNodeIds.has(leafId),
      ),
    [allLeafNodeIds, eventModalSelectedLeafIds],
  );

  const getCategoryNodeSelectionState = useCallback(
    (nodeId: string): EventCategoryNodeSelectionState => {
      const leafIds = categoryLeafIdsByNodeId.get(nodeId) ?? [];
      if (leafIds.length === 0) {
        return {
          checked: false,
          indeterminate: false,
          selectedLeaves: 0,
          totalLeaves: 0,
        };
      }

      const selectedLeaves = leafIds.filter((leafId) =>
        eventModalSelectedLeafIds.has(leafId),
      ).length;

      return {
        checked: selectedLeaves === leafIds.length,
        indeterminate: selectedLeaves > 0 && selectedLeaves < leafIds.length,
        selectedLeaves,
        totalLeaves: leafIds.length,
      };
    },
    [categoryLeafIdsByNodeId, eventModalSelectedLeafIds],
  );

  const selectedLeafCategoryIds = useMemo(
    () => collectSelectedLeafCategoryIds(),
    [collectSelectedLeafCategoryIds],
  );

  const step3ScaleCatalog = useMemo(() => {
    const categoriesAccumulator = new Map<string, Step3ScaleCategoryItem>();
    const subcategoriesAccumulator = new Map<string, Step3ScaleSubcategoryItem>();
    const specialties: Step3ScaleSpecialtyItem[] = [];

    const resolveRootCategoryId = (nodeId: string): string | null => {
      const visited = new Set<string>();
      let currentId: string | null = nodeId;
      while (currentId) {
        if (categoriesById.has(currentId)) {
          return currentId;
        }
        if (visited.has(currentId)) {
          return null;
        }
        visited.add(currentId);
        const currentNode = subcategoriesById.get(currentId);
        if (!currentNode) {
          return null;
        }
        currentId = currentNode.categoryId;
      }
      return null;
    };

    selectedLeafCategoryIds.forEach((leafId) => {
      const leaf = subcategoriesById.get(leafId);
      const rootCategoryId = resolveRootCategoryId(leafId);
      if (!rootCategoryId) {
        return;
      }

      const rootCategory = categoriesById.get(rootCategoryId);
      if (!rootCategory) {
        return;
      }

      if (!categoriesAccumulator.has(rootCategoryId)) {
        categoriesAccumulator.set(rootCategoryId, {
          id: rootCategoryId,
          name: rootCategory.name,
          subcategoriesCount: 0,
          specialtiesCount: 0,
        });
      }

      const leafParentId = leaf?.categoryId ?? rootCategoryId;
      const leafParentIsCategory = categoriesById.has(leafParentId);
      const subcategoryId = leafParentIsCategory
        ? `__direct__:${rootCategoryId}`
        : leafParentId;
      const subcategoryName = leafParentIsCategory
        ? 'Sin subcategoria'
        : subcategoriesById.get(leafParentId)?.name ?? 'Subcategoria';
      const subcategoryKey = `${rootCategoryId}:${subcategoryId}`;

      if (!subcategoriesAccumulator.has(subcategoryKey)) {
        subcategoriesAccumulator.set(subcategoryKey, {
          id: subcategoryId,
          categoryId: rootCategoryId,
          name: subcategoryName,
          specialtiesCount: 0,
        });
      }

      const scaleIds = eventModalScaleIdsByCategoryId[leafId] ?? [];
      const specialtyName = leaf?.name ?? categoryNameByLeafId.get(leafId) ?? leafId;
      specialties.push({
        id: leafId,
        categoryId: rootCategoryId,
        subcategoryId,
        name: specialtyName,
        pathLabel:
          categoryNameByLeafId.get(leafId) ??
          `${rootCategory.name} > ${subcategoryName} > ${specialtyName}`,
        activeScalesCount: scaleIds.length,
        isConfigured: scaleIds.length > 0,
      });
    });

    specialties.forEach((specialty) => {
      const category = categoriesAccumulator.get(specialty.categoryId);
      if (category) {
        category.specialtiesCount += 1;
      }

      const subcategory = subcategoriesAccumulator.get(
        `${specialty.categoryId}:${specialty.subcategoryId}`,
      );
      if (subcategory) {
        subcategory.specialtiesCount += 1;
      }
    });

    const categoriesList = [...categoriesAccumulator.values()]
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((category) => {
        const subcategoriesCount = [...subcategoriesAccumulator.values()].filter(
          (subcategory) => subcategory.categoryId === category.id,
        ).length;
        return {
          ...category,
          subcategoriesCount,
        };
      });

    const subcategoriesList = [...subcategoriesAccumulator.values()].sort((left, right) =>
      left.name.localeCompare(right.name),
    );

    const specialtiesList = specialties.sort((left, right) => left.name.localeCompare(right.name));

    return {
      categories: categoriesList,
      subcategories: subcategoriesList,
      specialties: specialtiesList,
    };
  }, [
    categoriesById,
    categoryNameByLeafId,
    eventModalScaleIdsByCategoryId,
    selectedLeafCategoryIds,
    subcategoriesById,
  ]);

  useEffect(() => {
    const firstCategoryId = step3ScaleCatalog.categories[0]?.id ?? null;
    setEventModalSelectedScaleCategoryId((current) => {
      if (!current) {
        return firstCategoryId;
      }
      const exists = step3ScaleCatalog.categories.some((category) => category.id === current);
      return exists ? current : firstCategoryId;
    });
  }, [step3ScaleCatalog.categories]);

  const step3SubcategoriesForSelectedCategory = useMemo(
    () =>
      step3ScaleCatalog.subcategories.filter(
        (subcategory) => subcategory.categoryId === eventModalSelectedScaleCategoryId,
      ),
    [eventModalSelectedScaleCategoryId, step3ScaleCatalog.subcategories],
  );

  useEffect(() => {
    const firstSubcategoryId = step3SubcategoriesForSelectedCategory[0]?.id ?? null;
    setEventModalSelectedScaleSubcategoryId((current) => {
      if (!current) {
        return firstSubcategoryId;
      }
      const exists = step3SubcategoriesForSelectedCategory.some(
        (subcategory) => subcategory.id === current,
      );
      return exists ? current : firstSubcategoryId;
    });
  }, [step3SubcategoriesForSelectedCategory]);

  const step3SpecialtiesForSelection = useMemo(
    () =>
      step3ScaleCatalog.specialties.filter(
        (specialty) =>
          specialty.categoryId === eventModalSelectedScaleCategoryId &&
          specialty.subcategoryId === eventModalSelectedScaleSubcategoryId,
      ),
    [
      eventModalSelectedScaleCategoryId,
      eventModalSelectedScaleSubcategoryId,
      step3ScaleCatalog.specialties,
    ],
  );

  useEffect(() => {
    const firstLeafId = step3SpecialtiesForSelection[0]?.id ?? null;
    setEventModalSelectedScaleLeafId((current) => {
      if (!current) {
        return firstLeafId;
      }
      const exists = step3SpecialtiesForSelection.some((specialty) => specialty.id === current);
      return exists ? current : firstLeafId;
    });
  }, [step3SpecialtiesForSelection]);

  useEffect(() => {
    if (!eventModalSelectedScaleLeafId) {
      setEventModalScaleDraftIds([]);
      return;
    }

    setEventModalScaleDraftIds(eventModalScaleIdsByCategoryId[eventModalSelectedScaleLeafId] ?? []);
  }, [eventModalScaleIdsByCategoryId, eventModalSelectedScaleLeafId]);

  const filteredStep3ScaleCategories = useMemo(() => {
    const normalizedQuery = eventModalScaleCategorySearch.trim().toLowerCase();
    if (!normalizedQuery) {
      return step3ScaleCatalog.categories;
    }
    return step3ScaleCatalog.categories.filter((category) =>
      category.name.toLowerCase().includes(normalizedQuery),
    );
  }, [eventModalScaleCategorySearch, step3ScaleCatalog.categories]);

  const filteredStep3ScaleSubcategories = useMemo(() => {
    const normalizedQuery = eventModalScaleSubcategorySearch.trim().toLowerCase();
    if (!normalizedQuery) {
      return step3SubcategoriesForSelectedCategory;
    }
    return step3SubcategoriesForSelectedCategory.filter((subcategory) =>
      subcategory.name.toLowerCase().includes(normalizedQuery),
    );
  }, [eventModalScaleSubcategorySearch, step3SubcategoriesForSelectedCategory]);

  const filteredStep3ScaleSpecialties = useMemo(() => {
    const normalizedQuery = eventModalScaleSpecialtySearch.trim().toLowerCase();
    if (!normalizedQuery) {
      return step3SpecialtiesForSelection;
    }
    return step3SpecialtiesForSelection.filter(
      (specialty) =>
        specialty.name.toLowerCase().includes(normalizedQuery) ||
        specialty.pathLabel.toLowerCase().includes(normalizedQuery),
    );
  }, [eventModalScaleSpecialtySearch, step3SpecialtiesForSelection]);

  const step3ScaleProgress = useMemo(() => {
    const configuredCount = selectedLeafCategoryIds.filter(
      (leafId) => (eventModalScaleIdsByCategoryId[leafId] ?? []).length > 0,
    ).length;
    return {
      configuredCount,
      totalCount: selectedLeafCategoryIds.length,
    };
  }, [eventModalScaleIdsByCategoryId, selectedLeafCategoryIds]);

  const activeStep3ScaleSpecialty = useMemo(
    () =>
      step3ScaleCatalog.specialties.find(
        (specialty) => specialty.id === eventModalSelectedScaleLeafId,
      ) ?? null,
    [eventModalSelectedScaleLeafId, step3ScaleCatalog.specialties],
  );

  const markAllStep3ScaleDraft = useCallback(() => {
    const nextScaleIds = scales.map((scale) => scale.id);
    setEventModalScaleDraftIds(nextScaleIds);
    if (eventModalSelectedScaleLeafId) {
      setEventModalScaleIdsByCategoryId((prev) => ({
        ...prev,
        [eventModalSelectedScaleLeafId]: nextScaleIds,
      }));
    }
  }, [eventModalSelectedScaleLeafId, scales]);

  const clearStep3ScaleDraft = useCallback(() => {
    setEventModalScaleDraftIds([]);
    if (eventModalSelectedScaleLeafId) {
      setEventModalScaleIdsByCategoryId((prev) => ({
        ...prev,
        [eventModalSelectedScaleLeafId]: [],
      }));
    }
  }, [eventModalSelectedScaleLeafId]);

  const toggleStep3ScaleDraftId = useCallback((scaleId: string) => {
    setEventModalScaleDraftIds((current) => {
      const next = current.includes(scaleId)
        ? current.filter((id) => id !== scaleId)
        : [...current, scaleId];
      const deduped = Array.from(new Set(next));
      if (eventModalSelectedScaleLeafId) {
        setEventModalScaleIdsByCategoryId((prev) => ({
          ...prev,
          [eventModalSelectedScaleLeafId]: deduped,
        }));
      }
      return deduped;
    });
  }, [eventModalSelectedScaleLeafId]);

  const saveStep3ScaleDraft = useCallback(() => {
    // Maintained for compatibility with existing consumers.
  }, []);

  const eventModalCategoryRemovalImpact = useMemo<EventCategoryRemovalImpact>(() => {
    if (eventModalMode !== 'edit' || !eventModalTargetId) {
      return {
        removedEventCategoryIds: [],
        removedCategoryNames: [],
        removedAssignmentsCount: 0,
      };
    }

    const desiredLeafCategoryIds = new Set(collectSelectedLeafCategoryIds());
    const currentLinks = eventCategories.filter((entry) => entry.eventId === eventModalTargetId);
    const removedLinks = currentLinks.filter(
      (entry) => !desiredLeafCategoryIds.has(entry.categoryId),
    );
    const removedEventCategoryIds = removedLinks.map((entry) => entry.id);
    const removedEventCategorySet = new Set(removedEventCategoryIds);
    const removedAssignmentsCount = canReadJudgeAssignments
      ? assignments.filter(
          (assignment) =>
            assignment.eventId === eventModalTargetId &&
            removedEventCategorySet.has(assignment.eventCategoryId),
        ).length
      : 0;

    return {
      removedEventCategoryIds,
      removedCategoryNames: removedLinks.map((entry) => entry.name),
      removedAssignmentsCount,
    };
  }, [
    assignments,
    canReadJudgeAssignments,
    eventCategories,
    eventModalMode,
    eventModalTargetId,
    collectSelectedLeafCategoryIds,
  ]);

  const executeAction = async (
    actionKey: string,
    successMessage: string,
    action: () => Promise<void>,
  ) => {
    setPendingAction(actionKey);
    setActionFeedback(null);
    clearError();

    try {
      await action();
      const latestError = useAdminStore.getState().error;
      if (latestError) {
        setActionFeedback({ type: 'error', message: latestError });
        return false;
      }

      setActionFeedback({ type: 'success', message: successMessage });
      return true;
    } catch (error) {
      setActionFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'No se pudo completar la accion.',
      });
      return false;
    } finally {
      setPendingAction((current) => (current === actionKey ? null : current));
    }
  };

  const toggleCategorySelection = useCallback((categoryId: string) => {
    const leafIds = categoryLeafIdsByNodeId.get(categoryId) ?? [];
    if (leafIds.length === 0) {
      return;
    }

    setEventModalSelectedLeafIds((prev) => {
      const next = new Set(prev);

      const allSelected = leafIds.every((leafId) => next.has(leafId));
      for (const leafId of leafIds) {
        if (allSelected) {
          next.delete(leafId);
        } else {
          next.add(leafId);
        }
      }

      return next;
    });
  }, [categoryLeafIdsByNodeId]);

  const selectStep3ScaleCategory = useCallback((categoryId: string) => {
    setEventModalSelectedScaleCategoryId(categoryId);
    setEventModalSelectedScaleSubcategoryId(null);
    setEventModalSelectedScaleLeafId(null);
  }, []);

  const selectStep3ScaleSubcategory = useCallback((subcategoryId: string) => {
    setEventModalSelectedScaleSubcategoryId(subcategoryId);
    setEventModalSelectedScaleLeafId(null);
  }, []);

  const selectStep3ScaleSpecialty = useCallback((leafId: string) => {
    setEventModalSelectedScaleLeafId(leafId);
  }, []);

  useEffect(() => {
    setEventModalScaleIdsByCategoryId((prev) => {
      const next: Record<string, string[]> = {};
      for (const categoryId of eventModalSelectedLeafIds) {
        next[categoryId] = prev[categoryId] ?? [];
      }
      return next;
    });
  }, [eventModalSelectedLeafIds]);

  useEffect(() => {
    setEventModalScaleGroupsByCategoryId((prev) => {
      const next: Record<string, EventScaleGroupDraft[]> = {};
      for (const categoryId of eventModalSelectedLeafIds) {
        next[categoryId] = prev[categoryId] ?? [];
      }
      return next;
    });
  }, [eventModalSelectedLeafIds]);

  const updateCategoryScaleIds = useCallback(
    (categoryId: string, scaleIds: string[]) => {
      setEventModalScaleIdsByCategoryId((prev) => ({
        ...prev,
        [categoryId]: Array.from(new Set(scaleIds)),
      }));
    },
    [],
  );

  const addScaleGroup = useCallback((categoryId: string) => {
    setEventModalScaleGroupsByCategoryId((prev) => {
      const current = prev[categoryId] ?? [];
      return {
        ...prev,
        [categoryId]: [...current, { name: '', scaleIds: [] }],
      };
    });
  }, []);

  const removeScaleGroup = useCallback((categoryId: string, index: number) => {
    setEventModalScaleGroupsByCategoryId((prev) => {
      const current = prev[categoryId] ?? [];
      return {
        ...prev,
        [categoryId]: current.filter((_, groupIndex) => groupIndex !== index),
      };
    });
  }, []);

  const updateScaleGroupName = useCallback(
    (categoryId: string, index: number, name: string) => {
      setEventModalScaleGroupsByCategoryId((prev) => {
        const current = prev[categoryId] ?? [];
        const next = current.map((group, groupIndex) =>
          groupIndex === index ? { ...group, name } : group,
        );
        return { ...prev, [categoryId]: next };
      });
    },
    [],
  );

  const toggleScaleGroupScaleId = useCallback(
    (categoryId: string, index: number, scaleId: string) => {
      setEventModalScaleGroupsByCategoryId((prev) => {
        const current = prev[categoryId] ?? [];
        
        // We find the target group to see if it already has the scale
        const targetGroup = current[index];
        if (!targetGroup) return prev;
        
        const isAdding = !targetGroup.scaleIds.includes(scaleId);

        const next = current.map((group, groupIndex) => {
          if (groupIndex === index) {
            const nextScaleIds = isAdding
              ? [...group.scaleIds, scaleId]
              : group.scaleIds.filter((entry) => entry !== scaleId);
            return {
              ...group,
              scaleIds: Array.from(new Set(nextScaleIds)),
            };
          }

          // If we are adding to the target group, remove it from all other groups
          if (isAdding && group.scaleIds.includes(scaleId)) {
            return {
              ...group,
              scaleIds: group.scaleIds.filter((entry) => entry !== scaleId),
            };
          }

          return group;
        });
        return { ...prev, [categoryId]: next };
      });
    },
    [],
  );

  const openCreateEventModal = () => {
    setActionFeedback(null);
    clearError();
    setEventModalMode('create');
    setEventModalTargetId(null);
    setEventForm({
      ...emptyEventForm,
      organizerClubId: clubs[0]?.id ?? '',
    });
    setActiveEventTab('datos');
    setEventModalSelectedLeafIds(new Set());
    setEventModalScaleIdsByCategoryId({});
    setEventModalScaleGroupsByCategoryId({});
    setEventModalScaleGroupsLoading(false);
    setEventModalScaleCategorySearch('');
    setEventModalScaleSubcategorySearch('');
    setEventModalScaleSpecialtySearch('');
    setEventModalSelectedScaleCategoryId(null);
    setEventModalSelectedScaleSubcategoryId(null);
    setEventModalSelectedScaleLeafId(null);
    setEventModalScaleDraftIds([]);
    setEventModalError(null);
    setEventModalScaleConfigLoading(false);
  };

  const openEditEventModal = (eventItem: CatalogEvent) => {
    setActionFeedback(null);
    clearError();
    setEventModalError(null);
    const startDateTime = splitUtcIsoToLaPazDateAndTime(eventItem.startDate);
    const endDateTime = splitUtcIsoToLaPazDateAndTime(eventItem.endDate);

    setEventModalMode('edit');
    setEventModalTargetId(eventItem.id);
    setActiveEventTab('datos');
    setEventForm({
      organizerClubId: eventItem.organizerClubId ?? clubs[0]?.id ?? '',
      name: eventItem.name,
      place: eventItem.place ?? '',
      startDate: startDateTime.date,
      startTime: startDateTime.time,
      endDate: endDateTime.date,
      endTime: endDateTime.time,
      status: eventItem.status,
      description: eventItem.description ?? '',
      imageUrl: eventItem.imageUrl ?? '',
    });

    const normalizedLeafIds = new Set<string>();
    eventCategories
      .filter((entry) => entry.eventId === eventItem.id)
      .forEach((entry) => {
        const leafIds = categoryLeafIdsByNodeId.get(entry.categoryId) ?? [];
        leafIds.forEach((leafId) => {
          if (allLeafNodeIds.has(leafId)) {
            normalizedLeafIds.add(leafId);
          }
        });
      });
    setEventModalSelectedLeafIds(normalizedLeafIds);
    setEventModalScaleIdsByCategoryId({});
    setEventModalScaleGroupsByCategoryId({});
    setEventModalScaleCategorySearch('');
    setEventModalScaleSubcategorySearch('');
    setEventModalScaleSpecialtySearch('');
    setEventModalSelectedScaleCategoryId(null);
    setEventModalSelectedScaleSubcategoryId(null);
    setEventModalSelectedScaleLeafId(null);
    setEventModalScaleDraftIds([]);
    setEventModalScaleConfigLoading(true);
    void adminEventsService
      .listEventCategoryScales(eventItem.id)
      .then((response) => {
        const scaleIdsByCategoryId = response.items.reduce<
          Record<string, string[]>
        >((accumulator, item) => {
          accumulator[item.categoryId] = item.scaleIds;
          return accumulator;
        }, {});
        setEventModalScaleIdsByCategoryId((prev) => {
          const next: Record<string, string[]> = {};
          for (const categoryId of normalizedLeafIds) {
            next[categoryId] = scaleIdsByCategoryId[categoryId] ?? prev[categoryId] ?? [];
          }
          return next;
        });
      })
      .catch((error: unknown) => {
        setEventModalError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar la configuracion de escalas del evento.',
        );
      })
      .finally(() => {
        setEventModalScaleConfigLoading(false);
      });

    setEventModalScaleGroupsLoading(true);
    void Promise.all(
      [...normalizedLeafIds].map((categoryId) =>
        adminEventsService.listEventCategoryScaleGroups(eventItem.id, categoryId),
      ),
    )
      .then((responses) => {
        const groupsByCategoryId = responses.reduce<Record<string, EventScaleGroupDraft[]>>(
          (accumulator, response) => {
            accumulator[response.finalCategoryId] = response.groups.map((group) => ({
              id: group.id,
              name: group.name,
              scaleIds: group.scaleIds,
            }));
            return accumulator;
          },
          {},
        );
        setEventModalScaleGroupsByCategoryId((prev) => {
          const next: Record<string, EventScaleGroupDraft[]> = {};
          for (const categoryId of normalizedLeafIds) {
            next[categoryId] = groupsByCategoryId[categoryId] ?? prev[categoryId] ?? [];
          }
          return next;
        });
      })
      .catch((error: unknown) => {
        setEventModalError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar la configuracion de grupos MultiEscala del evento.',
        );
      })
      .finally(() => {
        setEventModalScaleGroupsLoading(false);
      });
  };

  const closeEventModal = () => {
    if (pendingAction === 'event:create') {
      return;
    }
    if (eventModalTargetId && pendingAction === `event:update:${eventModalTargetId}`) {
      return;
    }

    setEventModalMode(null);
    setEventModalTargetId(null);
    setEventForm(emptyEventForm);
    setActiveEventTab('datos');
    setEventModalSelectedLeafIds(new Set());
    setEventModalScaleIdsByCategoryId({});
    setEventModalScaleGroupsByCategoryId({});
    setEventModalScaleCategorySearch('');
    setEventModalScaleSubcategorySearch('');
    setEventModalScaleSpecialtySearch('');
    setEventModalSelectedScaleCategoryId(null);
    setEventModalSelectedScaleSubcategoryId(null);
    setEventModalSelectedScaleLeafId(null);
    setEventModalScaleDraftIds([]);
    setEventModalScaleConfigLoading(false);
    setEventModalScaleGroupsLoading(false);
    setEventModalError(null);
    if (eventImageFileInputRef.current) {
      eventImageFileInputRef.current.value = '';
    }
  };

  const handleEventImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.currentTarget.value = '';
    if (!file) {
      return;
    }

    setIsEventImageUploading(true);
    try {
      const data = await adminUploadsService.uploadEventImage(file);
      setEventForm((prev) => ({ ...prev, imageUrl: data.url }));
      setEventModalError(null);
    } catch (error) {
      setEventModalError(
        error instanceof Error
          ? error.message
          : 'No se pudo subir la imagen del evento.',
      );
    } finally {
      setIsEventImageUploading(false);
    }
  };

  const validateEventForm = useCallback(() => {
    if (clubs.length === 0) {
      setEventModalError('Primero debes crear un club para asignarlo como organizador del evento.');
      return false;
    }

    if (!eventForm.organizerClubId) {
      setEventModalError('Selecciona el club organizador del evento.');
      return false;
    }

    if (
      !eventForm.name.trim() ||
      !eventForm.place.trim() ||
      !eventForm.startDate ||
      !eventForm.startTime ||
      !eventForm.endDate ||
      !eventForm.endTime ||
      !eventForm.description.trim()
    ) {
      setEventModalError('Completa todos los campos requeridos para guardar el evento.');
      return false;
    }

    const startTimestamp = toLaPazDateTimeTimestamp(eventForm.startDate, eventForm.startTime);
    const endTimestamp = toLaPazDateTimeTimestamp(eventForm.endDate, eventForm.endTime);

    if (startTimestamp === null || endTimestamp === null) {
      setEventModalError('La fecha u hora ingresada no es valida.');
      return false;
    }

    if (startTimestamp > endTimestamp) {
      setEventModalError('La fecha y hora de inicio no puede ser mayor que la fecha y hora de fin.');
      return false;
    }

    setEventModalError(null);
    return true;
  }, [clubs.length, eventForm]);

  const handleSubmitEventModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    validateEventForm();
  };

  const handleFinalizeEventModal = async () => {
    if (!eventModalMode) {
      return;
    }
    if (eventModalMode === 'edit' && !eventModalTargetId) {
      return;
    }

    if (!validateEventForm()) {
      return;
    }

    setEventModalError(null);

    const startDateIso = combineLaPazDateAndTimeToUtcIso(eventForm.startDate, eventForm.startTime);
    const endDateIso = combineLaPazDateAndTimeToUtcIso(eventForm.endDate, eventForm.endTime);

    if (!startDateIso || !endDateIso) {
      setEventModalError('La fecha u hora ingresada no es valida.');
      return;
    }

    const allCategoryIds = collectSelectedLeafCategoryIds();
    const categoriesWithoutScales = allCategoryIds.filter(
      (categoryId) => (eventModalScaleIdsByCategoryId[categoryId] ?? []).length === 0,
    );
    if (categoriesWithoutScales.length > 0) {
      setEventModalError(
        'Cada categoria final seleccionada debe tener al menos una escala permitida.',
      );
      return;
    }

    const scalesByCategoryId = allCategoryIds.reduce<Record<string, string[]>>(
      (accumulator, categoryId) => {
        accumulator[categoryId] = eventModalScaleIdsByCategoryId[categoryId] ?? [];
        return accumulator;
      },
      {},
    );

    const groupsByCategoryId = allCategoryIds.reduce<Record<string, EventScaleGroupDraft[]>>(
      (accumulator, categoryId) => {
        accumulator[categoryId] = eventModalScaleGroupsByCategoryId[categoryId] ?? [];
        return accumulator;
      },
      {},
    );

    for (const categoryId of allCategoryIds) {
      const allowedScaleIds = new Set(eventModalScaleIdsByCategoryId[categoryId] ?? []);
      const groups = groupsByCategoryId[categoryId] ?? [];
      for (const group of groups) {
        const trimmedName = group.name.trim();
        const validScaleIds = group.scaleIds.filter((scaleId) => allowedScaleIds.has(scaleId));
        if (!trimmedName || validScaleIds.length === 0) {
          setEventModalError(
            'Cada grupo MultiEscala debe tener nombre y al menos una escala valida.',
          );
          return;
        }
      }
    }

    const actionKey = eventModalMode === 'create' ? 'event:create' : `event:update:${eventModalTargetId}`;

    const success = await executeAction(
      actionKey,
      eventModalMode === 'create' ? 'Evento creado correctamente.' : 'Evento actualizado correctamente.',
      async () => {
        let eventId: string | null = eventModalTargetId ?? null;
        if (eventModalMode === 'create') {
          const createdEvent = await createEventAndLinkCategories(
            {
              organizerClubId: eventForm.organizerClubId,
              name: eventForm.name,
              status: eventForm.status,
              place: eventForm.place,
              startDate: startDateIso,
              endDate: endDateIso,
              description: eventForm.description,
              imageUrl: eventForm.imageUrl || undefined,
            },
            allCategoryIds,
            scalesByCategoryId,
          );
          eventId = createdEvent.id;
        } else if (eventModalTargetId) {
          const updatedEvent = await updateEventAndLinkCategories(
            {
              id: eventModalTargetId,
              organizerClubId: eventForm.organizerClubId,
              name: eventForm.name,
              status: eventForm.status,
              place: eventForm.place,
              startDate: startDateIso,
              endDate: endDateIso,
              description: eventForm.description,
              imageUrl: eventForm.imageUrl || undefined,
            },
            allCategoryIds,
            scalesByCategoryId,
          );
          eventId = updatedEvent.id;
        }

        if (eventId) {
          await Promise.all(
            allCategoryIds.map((categoryId) => {
              const allowedScaleIds = new Set(eventModalScaleIdsByCategoryId[categoryId] ?? []);
              const groups = (groupsByCategoryId[categoryId] ?? []).map((group) => ({
                name: group.name.trim(),
                scaleIds: group.scaleIds.filter((scaleId) => allowedScaleIds.has(scaleId)),
              }));
              return adminEventsService.replaceEventCategoryScaleGroups(
                eventId,
                categoryId,
                groups,
              );
            }),
          );
        }

        clearError();
      },
    );

    if (success) {
      closeEventModal();
    }
  };

  const openEventDeleteImpactModal = async (eventId: string, eventName: string) => {
    setActionFeedback(null);
    clearError();
    setEventDeleteImpactModal({
      eventId,
      eventName,
      impact: null,
      loading: true,
      error: null,
    });

    try {
      const impact = await getEventDeleteImpact(eventId);
      setEventDeleteImpactModal((prev) =>
        prev && prev.eventId === eventId
          ? {
              ...prev,
              impact,
              loading: false,
              error: null,
            }
          : prev,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo calcular el impacto de eliminacion para este evento.';
      setEventDeleteImpactModal((prev) =>
        prev && prev.eventId === eventId
          ? {
              ...prev,
              loading: false,
              error: message,
            }
          : prev,
      );
    }
  };

  const closeEventDeleteImpactModal = () => {
    if (eventDeleteImpactModal && pendingAction === `event:delete:${eventDeleteImpactModal.eventId}`) {
      return;
    }
    setEventDeleteImpactModal(null);
  };

  const confirmDeleteEvent = async () => {
    if (!eventDeleteImpactModal) {
      return;
    }

    const { eventId } = eventDeleteImpactModal;
    const success = await executeAction(`event:delete:${eventId}`, 'Evento eliminado correctamente.', () =>
      removeEvent(eventId),
    );

    if (success) {
      if (eventModalMode === 'edit' && eventModalTargetId === eventId) {
        closeEventModal();
      }
      setEventDeleteImpactModal(null);
    }
  };

  const isEventModalPending =
    pendingAction === 'event:create' ||
    (eventModalTargetId ? pendingAction === `event:update:${eventModalTargetId}` : false);

  return {
    actionFeedback,
    filteredEvents,
    eventSearch,
    setEventSearch,
    eventStatusFilter,
    setEventStatusFilter,
    eventStatusOptions,
    openCreateEventModal,
    openEditEventModal,
    eventModalMode,
    activeEventTab,
    setActiveEventTab,
    eventModalSelectedLeafIds,
    toggleCategorySelection,
    eventModalCategoryTree,
    getCategoryNodeSelectionState,
    eventModalError,
    eventModalScaleConfigLoading,
    eventModalScaleIdsByCategoryId,
    eventModalScaleGroupsByCategoryId,
    eventModalScaleGroupsLoading,
    availableScales: scales,
    updateCategoryScaleIds,
    eventModalScaleCategorySearch,
    setEventModalScaleCategorySearch,
    eventModalScaleSubcategorySearch,
    setEventModalScaleSubcategorySearch,
    eventModalScaleSpecialtySearch,
    setEventModalScaleSpecialtySearch,
    eventModalSelectedScaleCategoryId,
    eventModalSelectedScaleSubcategoryId,
    eventModalSelectedScaleLeafId,
    filteredStep3ScaleCategories,
    filteredStep3ScaleSubcategories,
    filteredStep3ScaleSpecialties,
    selectStep3ScaleCategory,
    selectStep3ScaleSubcategory,
    selectStep3ScaleSpecialty,
    step3ScaleProgress,
    activeStep3ScaleSpecialty,
    eventModalScaleDraftIds,
    markAllStep3ScaleDraft,
    clearStep3ScaleDraft,
    toggleStep3ScaleDraftId,
    saveStep3ScaleDraft,
    addScaleGroup,
    removeScaleGroup,
    updateScaleGroupName,
    toggleScaleGroupScaleId,
    eventForm,
    setEventForm,
    eventImageFileInputRef,
    isEventImageUploading,
    handleEventImageFileChange,
    handleSubmitEventModal,
    isEventModalPending,
    eventModalCategoryRemovalImpact,
    handleFinalizeEventModal,
    closeEventModal,
    pendingAction,
    eventDeleteImpactModal,
    openEventDeleteImpactModal,
    closeEventDeleteImpactModal,
    confirmDeleteEvent,
  };
};
