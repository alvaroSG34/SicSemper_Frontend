import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { User } from '@/domain/user/user.types';
import { AdminAdminsSection } from './admin-admins-section';
import { useAdminAdmins } from './use-admin-admins';

vi.mock('./use-admin-admins', () => ({ useAdminAdmins: vi.fn() }));

const useAdminAdminsMock = vi.mocked(useAdminAdmins);

const candidate: User = {
  id: 'user-1',
  name: 'Ana Pérez',
  email: 'ana@example.com',
  roles: ['PARTICIPANTE'],
  status: 'ACTIVO',
  photoUrl: null,
};

const createHookState = (overrides: Partial<ReturnType<typeof useAdminAdmins>> = {}) => ({
  adminSearch: '',
  setAdminSearch: vi.fn(),
  filteredAdminUsers: [],
  promoteAdminSearch: '',
  setPromoteAdminSearch: vi.fn(),
  promoteAdminSelectedUserId: '',
  setPromoteAdminSelectedUserId: vi.fn(),
  filteredPromotableAdminUsers: [candidate],
  createAdminForm: { name: '', email: '', password: '' },
  setCreateAdminForm: vi.fn(),
  adminFormModalMode: 'promote' as const,
  setAdminFormModalMode: vi.fn(),
  closeAdminFormModal: vi.fn(),
  handlePromoteAdmin: vi.fn(),
  handleCreateAdmin: vi.fn(),
  handleDemoteAdmin: vi.fn(),
  pendingAction: null,
  actionFeedback: null,
  adminUsers: [],
  ...overrides,
});

describe('AdminAdminsSection promotion modal', () => {
  it('uses selectable cards and confirm/cancel actions like judge promotion', () => {
    const setSelected = vi.fn();
    const close = vi.fn();
    const promote = vi.fn();
    useAdminAdminsMock.mockReturnValue(createHookState({
      setPromoteAdminSelectedUserId: setSelected,
      closeAdminFormModal: close,
      handlePromoteAdmin: promote,
    }));

    const view = render(
      <AdminAdminsSection
        users={[]}
        headingClassName=""
        loading={false}
        activePermissionAdminId={null}
        openAdminPermissionsManager={vi.fn()}
        canCreateAdmins
        canUpdateAdmins
        canManageAdminPermissions
      />,
    );

    expect(screen.queryByRole('combobox')).toBeNull();
    const card = screen.getByRole('button', { name: /Ana Pérez ana@example.com/i });
    expect(card).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Confirmar' }) as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(card);
    expect(setSelected).toHaveBeenCalledWith('user-1');
    useAdminAdminsMock.mockReturnValue(createHookState({
      promoteAdminSelectedUserId: 'user-1',
      setPromoteAdminSelectedUserId: setSelected,
      closeAdminFormModal: close,
      handlePromoteAdmin: promote,
    }));
    view.rerender(
      <AdminAdminsSection
        users={[]}
        headingClassName=""
        loading={false}
        activePermissionAdminId={null}
        openAdminPermissionsManager={vi.fn()}
        canCreateAdmins
        canUpdateAdmins
        canManageAdminPermissions
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(promote).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(close).toHaveBeenCalledTimes(1);
  });
});
