import { ImageWithSkeleton } from '@/presentation/components/ui';
import { useMemo, useState } from 'react';
import type { User } from '@/domain/user/user.types';
import type { JudgeSubcategoryDraft } from './judge-assignment-tree.utils';
import {
  computeCategoryCheckedState,
  toggleCategoryAllSubcategories,
} from './judge-assignment-tree.utils';

type CategoryNode = {
  id: string;
  name: string;
  subcategories: Array<{
    id: string;
    name: string;
  }>;
};

type JudgeValidationIssue = {
  judgeId: string;
  judgeName: string;
  message: string;
};

type JudgeEventAssignmentBoardProps = {
  judges: User[];
  assignedJudgeIds: Set<string>;
  selectionsByJudge: JudgeSubcategoryDraft;
  categories: CategoryNode[];
  pending: boolean;
  canManage: boolean;
  onAssignJudge: (judgeUserId: string) => void;
  onUnassignJudge: (judgeUserId: string) => void;
  onSetJudgeSelections: (judgeUserId: string, subcategoryIds: string[]) => void;
  validationIssues?: JudgeValidationIssue[];
  leftTitle?: string;
  rightTitle?: string;
};

const getJudgeInitials = (judge: User) => {
  const source = judge.name?.trim() || judge.email?.trim() || 'J';
  return source.charAt(0).toUpperCase();
};

const JudgeAvatar = ({ judge }: { judge: User }) => {
  const hasPhoto = Boolean(judge.photoUrl?.trim());

  return (
    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#2D2D2D] bg-[#151515]">
      {hasPhoto ? (
        <ImageWithSkeleton
          src={judge.photoUrl as string}
          alt={`Foto de perfil de ${judge.name}`}
          width={40}
          height={40}
          sizes="40px"
          className="h-full w-full object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#9C9C9C]">
          {getJudgeInitials(judge)}
        </div>
      )}
    </div>
  );
};

const CategoryCheckbox = ({
  checked,
  indeterminate,
  disabled,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  onChange: () => void;
}) => (
  <input
    type="checkbox"
    checked={checked}
    disabled={disabled}
    ref={(node) => {
      if (node) {
        node.indeterminate = indeterminate;
      }
    }}
    onChange={onChange}
    className="h-4 w-4 accent-[#5B68F1]"
  />
);

export function JudgeEventAssignmentBoard({
  judges,
  assignedJudgeIds,
  selectionsByJudge,
  categories,
  pending,
  canManage,
  onAssignJudge,
  onUnassignJudge,
  onSetJudgeSelections,
  validationIssues = [],
  leftTitle = 'Lista de jueces no asignados',
  rightTitle = 'Lista de jueces asignados',
}: JudgeEventAssignmentBoardProps) {
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');
  const [expandedJudgeIds, setExpandedJudgeIds] = useState<Record<string, boolean>>({});
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Record<string, boolean>>({});

  const assignedJudges = useMemo(
    () =>
      judges
        .filter((judge) => assignedJudgeIds.has(judge.id))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [assignedJudgeIds, judges],
  );
  const unassignedJudges = useMemo(
    () =>
      judges
        .filter((judge) => !assignedJudgeIds.has(judge.id))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [assignedJudgeIds, judges],
  );

  const filteredUnassignedJudges = useMemo(() => {
    const query = leftSearch.trim().toLowerCase();
    if (!query) {
      return unassignedJudges;
    }
    return unassignedJudges.filter((judge) =>
      `${judge.name} ${judge.email}`.toLowerCase().includes(query),
    );
  }, [leftSearch, unassignedJudges]);

  const filteredAssignedJudges = useMemo(() => {
    const query = rightSearch.trim().toLowerCase();
    if (!query) {
      return assignedJudges;
    }
    return assignedJudges.filter((judge) =>
      `${judge.name} ${judge.email}`.toLowerCase().includes(query),
    );
  }, [assignedJudges, rightSearch]);

  const issuesByJudgeId = useMemo(
    () => new Map(validationIssues.map((issue) => [issue.judgeId, issue] as const)),
    [validationIssues],
  );

  const toggleJudgeExpanded = (judgeUserId: string) => {
    setExpandedJudgeIds((prev) => ({
      ...prev,
      [judgeUserId]: !prev[judgeUserId],
    }));
  };

  const toggleCategoryExpanded = (judgeUserId: string, categoryId: string) => {
    const key = `${judgeUserId}::${categoryId}`;
    setExpandedCategoryIds((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleSubcategory = (judgeUserId: string, subcategoryId: string) => {
    const selected = new Set(selectionsByJudge[judgeUserId] ?? []);
    if (selected.has(subcategoryId)) {
      selected.delete(subcategoryId);
    } else {
      selected.add(subcategoryId);
    }
    onSetJudgeSelections(judgeUserId, Array.from(selected));
  };

  const handleToggleCategory = (judgeUserId: string, subcategoryIds: string[]) => {
    const next = toggleCategoryAllSubcategories(
      new Set(selectionsByJudge[judgeUserId] ?? []),
      subcategoryIds,
    );
    onSetJudgeSelections(judgeUserId, Array.from(next));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
        <h5 className="text-sm font-semibold text-white">{leftTitle}</h5>
        <input
          value={leftSearch}
          onChange={(event) => setLeftSearch(event.target.value)}
          placeholder="Buscar juez no asignado"
          className="mt-3 h-10 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
        />
        <div className="mt-3 max-h-[52vh] space-y-2 overflow-y-auto pr-1">
          {filteredUnassignedJudges.map((judge) => (
            <article
              key={`left:${judge.id}`}
              className="rounded-xl border border-[#2D2D2D] bg-[#101010] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <JudgeAvatar judge={judge} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{judge.name}</p>
                    <p className="truncate text-xs text-[#9C9C9C]">{judge.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={pending || !canManage}
                  onClick={() => onAssignJudge(judge.id)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[#5B68F1] px-3 text-xs font-semibold text-[#C8CEFF] disabled:opacity-50"
                >
                  Asignar
                </button>
              </div>
            </article>
          ))}
          {filteredUnassignedJudges.length === 0 ? (
            <p className="rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-xs text-[#9C9C9C]">
              No hay jueces no asignados con ese filtro.
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-[#2D2D2D] bg-[#121212] p-4">
        <h5 className="text-sm font-semibold text-white">{rightTitle}</h5>
        <input
          value={rightSearch}
          onChange={(event) => setRightSearch(event.target.value)}
          placeholder="Buscar juez asignado"
          className="mt-3 h-10 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 text-sm text-white outline-none"
        />
        <div className="mt-3 max-h-[52vh] space-y-3 overflow-y-auto pr-1">
          {filteredAssignedJudges.map((judge) => {
            const selectedForJudge = new Set(selectionsByJudge[judge.id] ?? []);
            const issue = issuesByJudgeId.get(judge.id);
            const expandedJudge = expandedJudgeIds[judge.id] ?? false;
            const selectedCount = selectedForJudge.size;
            return (
              <article key={`right:${judge.id}`} className="rounded-xl border border-[#2D2D2D] bg-[#101010]">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleJudgeExpanded(judge.id)}
                    className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <JudgeAvatar judge={judge} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{judge.name}</p>
                        <p className="truncate text-xs text-[#9C9C9C]">{judge.email}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-[#2D2D2D] px-2 py-0.5 text-[11px] text-[#D7D7D7]">
                      {selectedCount}
                    </span>
                  </button>
                  <button
                    type="button"
                    disabled={pending || !canManage}
                    onClick={() => onUnassignJudge(judge.id)}
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-[#7f1d1d] px-2.5 text-[11px] font-semibold text-[#fca5a5] disabled:opacity-50"
                  >
                    Desasignar
                  </button>
                </div>

                {expandedJudge ? (
                  <div className="space-y-2 border-t border-[#2D2D2D] px-4 py-3">
                    {categories.map((category) => {
                      const subcategoryIds = category.subcategories.map((item) => item.id);
                      const state = computeCategoryCheckedState(selectedForJudge, subcategoryIds);
                      const categoryKey = `${judge.id}::${category.id}`;
                      const expandedCategory = expandedCategoryIds[categoryKey] ?? false;
                      const disabledCategory = category.subcategories.length === 0;

                      return (
                        <div key={`${judge.id}:${category.id}`} className="rounded-lg border border-[#2D2D2D] bg-[#0F0F0F]">
                          <div className="flex items-center gap-2 px-3 py-2">
                            <CategoryCheckbox
                              checked={state.checked}
                              indeterminate={state.indeterminate}
                              disabled={pending || !canManage || disabledCategory}
                              onChange={() => handleToggleCategory(judge.id, subcategoryIds)}
                            />
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white">
                              {category.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleCategoryExpanded(judge.id, category.id)}
                              className="text-xs text-[#AAB1FF]"
                            >
                              {expandedCategory ? 'Ocultar' : 'Ver'}
                            </button>
                          </div>

                          {expandedCategory ? (
                            <div className="border-t border-[#2D2D2D] px-3 py-2">
                              {category.subcategories.length === 0 ? (
                                <p className="text-xs text-[#9C9C9C]">
                                  Sin subcategorias, no asignable.
                                </p>
                              ) : (
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {category.subcategories.map((subcategory) => (
                                    <label
                                      key={`${judge.id}:${subcategory.id}`}
                                      className="inline-flex items-center gap-2 rounded-md border border-[#2D2D2D] bg-[#121212] px-2 py-1.5 text-xs text-[#D7D7D7]"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedForJudge.has(subcategory.id)}
                                        disabled={pending || !canManage}
                                        onChange={() => handleToggleSubcategory(judge.id, subcategory.id)}
                                        className="h-3.5 w-3.5 accent-[#5B68F1]"
                                      />
                                      <span>{subcategory.name}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                    {categories.length === 0 ? (
                      <p className="text-xs text-[#9C9C9C]">
                        Este evento no tiene categorias disponibles para asignar.
                      </p>
                    ) : null}
                    {issue ? (
                      <p className="rounded-md border border-[#7f1d1d] bg-[#7f1d1d]/15 px-2 py-1 text-xs text-[#fca5a5]">
                        {issue.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
          {filteredAssignedJudges.length === 0 ? (
            <p className="rounded-lg border border-[#2D2D2D] bg-[#101010] px-3 py-2 text-xs text-[#9C9C9C]">
              No hay jueces asignados con ese filtro.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

