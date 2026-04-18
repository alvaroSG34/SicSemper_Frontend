import { ImageWithSkeleton } from '@/presentation/components/ui';
import { useMemo, useState } from 'react';
import type { User } from '@/domain/user/user.types';
import type { JudgeSubcategoryDraft } from './judge-assignment-tree.utils';
import type {
  JudgeCategoryTreeNode,
  JudgeNodeSelectionState,
} from './use-admin-judge-assignments';

type JudgeValidationIssue = {
  judgeId: string;
  judgeName: string;
  message: string;
};

type JudgeEventAssignmentBoardProps = {
  judges: User[];
  assignedJudgeIds: Set<string>;
  selectionsByJudge: JudgeSubcategoryDraft;
  categoryTree: JudgeCategoryTreeNode[];
  pending: boolean;
  canManage: boolean;
  onAssignJudge: (judgeUserId: string) => void;
  onUnassignJudge: (judgeUserId: string) => void;
  onToggleJudgeNode: (judgeUserId: string, nodeId: string) => void;
  getJudgeNodeSelectionState: (
    judgeUserId: string,
    nodeId: string,
  ) => JudgeNodeSelectionState;
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
  categoryTree,
  pending,
  canManage,
  onAssignJudge,
  onUnassignJudge,
  onToggleJudgeNode,
  getJudgeNodeSelectionState,
  validationIssues = [],
  leftTitle = 'Lista de jueces no asignados',
  rightTitle = 'Lista de jueces asignados',
}: JudgeEventAssignmentBoardProps) {
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');
  const [expandedJudgeIds, setExpandedJudgeIds] = useState<Record<string, boolean>>({});
  const [expandedNodeIds, setExpandedNodeIds] = useState<Record<string, boolean>>({});

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

  const toggleNodeExpanded = (judgeUserId: string, nodeId: string) => {
    const key = `${judgeUserId}::${nodeId}`;
    setExpandedNodeIds((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
            const issue = issuesByJudgeId.get(judge.id);
            const expandedJudge = expandedJudgeIds[judge.id] ?? false;
            const selectedCount = (selectionsByJudge[judge.id] ?? []).length;

            const renderNode = (node: JudgeCategoryTreeNode) => {
              const nodeState = getJudgeNodeSelectionState(judge.id, node.id);
              const hasChildren = node.children.length > 0;
              const nodeKey = `${judge.id}::${node.id}`;
              const isExpanded = expandedNodeIds[nodeKey] ?? false;
              const disabledNode = nodeState.totalLeaves === 0;

              return (
                <div
                  key={nodeKey}
                  className={`rounded-lg border ${
                    nodeState.checked
                      ? 'border-[#5B68F1] bg-[rgba(91,104,241,0.16)]'
                      : nodeState.indeterminate
                        ? 'border-[#3f478f] bg-[rgba(63,71,143,0.15)]'
                        : 'border-[#2D2D2D] bg-[#0F0F0F]'
                  }`}
                >
                  <div className="flex items-center gap-2 px-3 py-2" style={{ paddingLeft: `${8 + node.depth * 10}px` }}>
                    <CategoryCheckbox
                      checked={nodeState.checked}
                      indeterminate={nodeState.indeterminate}
                      disabled={pending || !canManage || disabledNode}
                      onChange={() => onToggleJudgeNode(judge.id, node.id)}
                    />
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white">
                      {node.isLeaf ? node.pathLabel : node.name}
                    </span>
                    <span className="text-[11px] text-[#A8A8A8]">
                      {nodeState.selectedLeaves}/{nodeState.totalLeaves}
                    </span>
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => toggleNodeExpanded(judge.id, node.id)}
                        className="rounded-md border border-[#2D2D2D] px-2 py-0.5 text-[11px] text-white"
                      >
                        {isExpanded ? 'Ocultar' : 'Ver'}
                      </button>
                    ) : null}
                  </div>
                  {hasChildren && isExpanded ? (
                    <div className="space-y-2 border-t border-[#2D2D2D] px-2 py-2">
                      {node.children.map((childNode) => renderNode(childNode))}
                    </div>
                  ) : null}
                </div>
              );
            };

            return (
              <article
                key={`right:${judge.id}`}
                className="rounded-xl border border-[#2D2D2D] bg-[#101010]"
              >
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
                    {categoryTree.map((rootNode) => renderNode(rootNode))}
                    {categoryTree.length === 0 ? (
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
