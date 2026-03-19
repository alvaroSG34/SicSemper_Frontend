import type {
  AdminPermission,
  AdminPermissionCode,
  AdminPermissionEntry,
} from '@/domain/admin/admin.types';
import type { UserRole } from '@/domain/user/user.types';
import type {
  ApiAdminPermissionActionRequest,
  ApiAdminPermissionEntry,
  ApiSystemPermission,
} from '../contracts/admin-permissions.contract';

export const mapApiSystemPermissionToAdminPermission = (
  permission: ApiSystemPermission,
): AdminPermission => ({
  id: permission.id,
  code: permission.code,
  name: permission.name,
  description: permission.description,
  assignedRoles: permission.assignedRoles.map((role) => ({
    code: role.code as UserRole,
    name: role.name,
  })),
  roleAssignmentsCount: permission.roleAssignmentsCount,
  userAssignmentsCount: permission.userAssignmentsCount,
  createdAt: permission.createdAt,
  updatedAt: permission.updatedAt,
});

export const mapApiAdminPermissionEntry = (
  entry: ApiAdminPermissionEntry,
): AdminPermissionEntry => ({
  code: entry.code,
  name: entry.name,
  description: entry.description,
  granted: entry.granted,
  grantedByRole: entry.grantedByRole,
  grantedDirectly: entry.grantedDirectly,
  grantedAt: entry.grantedAt,
  grantedBy: entry.grantedBy,
});

export const mapAdminPermissionCodeToApiRequest = (
  code: AdminPermissionCode,
): ApiAdminPermissionActionRequest => ({
  permission: code,
});
