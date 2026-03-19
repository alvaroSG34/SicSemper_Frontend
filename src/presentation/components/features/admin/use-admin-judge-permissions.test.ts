import { act, renderHook } from '@testing-library/react';
import type { JudgePermissionEntry } from '@/domain/admin/admin.types';
import { useAdminJudgePermissions } from './use-admin-judge-permissions';

const loadJudgePermissions = vi.fn();
const toggleJudgePermission = vi.fn();
const clearError = vi.fn();

const entries: JudgePermissionEntry[] = [
  {
    code: 'JUDGE_DASHBOARD_READ',
    granted: true,
    grantedByRole: true,
    grantedDirectly: false,
    grantedAt: null,
    grantedBy: null,
  },
  {
    code: 'JUDGE_REVIEW_START',
    granted: true,
    grantedByRole: false,
    grantedDirectly: true,
    grantedAt: '2026-01-01T00:00:00.000Z',
    grantedBy: { id: 'admin-1', name: 'Admin Uno' },
  },
];

vi.mock('@/presentation/stores/admin-access-control.slice', () => ({
  useAdminAccessControlSlice: () => ({
    judgePermissionsMap: {
      'judge-1': entries,
    },
    judgePermissionsLoading: {},
    judgePermissionsError: {},
    loadJudgePermissions,
    toggleJudgePermission,
  }),
}));

vi.mock('@/presentation/stores/admin.store', () => ({
  useAdminStore: (selector: (state: { clearError: () => void }) => unknown) =>
    selector({
      clearError,
    }),
}));

describe('useAdminJudgePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens modal and loads permissions for selected judge', async () => {
    const { result } = renderHook(() => useAdminJudgePermissions());

    await act(async () => {
      await result.current.openJudgePermissionsModal({
        id: 'judge-1',
        name: 'Judge One',
        email: 'judge@example.com',
        roles: ['JUEZ'],
        verified: true,
      });
    });

    expect(clearError).toHaveBeenCalled();
    expect(loadJudgePermissions).toHaveBeenCalledWith('judge-1');
    expect(result.current.judgePermissionModal?.userId).toBe('judge-1');
    expect(result.current.filteredJudgePermissionEntries).toHaveLength(2);
  });

  it('toggles using grantedDirectly flag', async () => {
    const { result } = renderHook(() => useAdminJudgePermissions());

    await act(async () => {
      await result.current.openJudgePermissionsModal({
        id: 'judge-1',
        name: 'Judge One',
        email: 'judge@example.com',
        roles: ['JUEZ'],
        verified: true,
      });
    });

    await act(async () => {
      await result.current.handleToggleJudgePermission(entries[1]!);
    });

    expect(toggleJudgePermission).toHaveBeenCalledWith(
      'judge-1',
      'JUDGE_REVIEW_START',
      true,
    );
  });
});
