import { fireEvent, render, screen } from '@testing-library/react';
import type { User } from '@/domain/user/user.types';
import type { JudgeCategoryTreeNode } from './use-admin-judge-assignments';
import { JudgeEventAssignmentBoard } from './judge-event-assignment-board';

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));

const judges: User[] = [
  {
    id: 'judge-1',
    name: 'Judge One',
    email: 'judge1@example.com',
    roles: ['JUEZ'],
    verified: true,
  },
];

const categoryTree: JudgeCategoryTreeNode[] = [
  {
    id: 'cat-1',
    name: 'Categoria 1',
    depth: 1,
    isLeaf: false,
    pathLabel: 'Categoria 1',
    leafIds: ['leaf-1'],
    children: [
      {
        id: 'sub-1',
        name: 'Subcategoria 1',
        depth: 2,
        isLeaf: false,
        pathLabel: 'Subcategoria 1',
        leafIds: ['leaf-1'],
        children: [
          {
            id: 'leaf-1',
            name: 'Leaf 1',
            depth: 3,
            isLeaf: true,
            pathLabel: 'Subcategoria 1 > Leaf 1',
            leafIds: ['leaf-1'],
            children: [],
          },
        ],
      },
    ],
  },
];

describe('JudgeEventAssignmentBoard', () => {
  it('renders hierarchical tree and keeps branches collapsed by default', () => {
    render(
      <JudgeEventAssignmentBoard
        judges={judges}
        assignedJudgeIds={new Set(['judge-1'])}
        selectionsByJudge={{ 'judge-1': [] }}
        categoryTree={categoryTree}
        pending={false}
        canManage
        onAssignJudge={vi.fn()}
        onUnassignJudge={vi.fn()}
        onToggleJudgeNode={vi.fn()}
        getJudgeNodeSelectionState={(_, nodeId) => ({
          checked: false,
          indeterminate: false,
          selectedLeaves: nodeId === 'cat-1' ? 0 : 0,
          totalLeaves: 1,
        })}
      />,
    );

    fireEvent.click(screen.getByText('Judge One'));

    expect(screen.getByText('Categoria 1')).toBeTruthy();
    expect(screen.queryByText('Subcategoria 1')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Ver' }));

    expect(screen.getByText('Subcategoria 1')).toBeTruthy();
  });

  it('syncs checkbox interaction with tri-state and toggle callbacks', () => {
    const onToggleJudgeNode = vi.fn();

    render(
      <JudgeEventAssignmentBoard
        judges={judges}
        assignedJudgeIds={new Set(['judge-1'])}
        selectionsByJudge={{ 'judge-1': ['leaf-1'] }}
        categoryTree={categoryTree}
        pending={false}
        canManage
        onAssignJudge={vi.fn()}
        onUnassignJudge={vi.fn()}
        onToggleJudgeNode={onToggleJudgeNode}
        getJudgeNodeSelectionState={(_, nodeId) => {
          if (nodeId === 'cat-1') {
            return {
              checked: false,
              indeterminate: true,
              selectedLeaves: 1,
              totalLeaves: 2,
            };
          }

          return {
            checked: true,
            indeterminate: false,
            selectedLeaves: 1,
            totalLeaves: 1,
          };
        }}
      />,
    );

    fireEvent.click(screen.getByText('Judge One'));

    const rootCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(rootCheckbox.indeterminate).toBe(true);

    fireEvent.click(rootCheckbox);

    expect(onToggleJudgeNode).toHaveBeenCalledWith('judge-1', 'cat-1');
  });
});
