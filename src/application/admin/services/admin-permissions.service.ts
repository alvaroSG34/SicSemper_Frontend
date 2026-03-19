import type { ApiAdminPermissionEntry } from "@/application/admin/contracts/admin-permissions.contract";
import {
  mapAdminPermissionCodeToApiRequest,
  mapApiAdminPermissionEntry,
} from "@/application/admin/mappers/admin-permissions.mapper";
import type { AdminService } from "@/application/admin/admin.service.types";
import { apiRequest } from "@/infrastructure/api/http-client";
import { toErrorMessage } from "./admin-service.shared";

type BackendAdminPermissionEntry = ApiAdminPermissionEntry;

export const adminPermissionsService: Pick<
  AdminService,
  "listAdminPermissions" | "grantAdminPermission" | "revokeAdminPermission"
> = {
  async listAdminPermissions(adminUserId) {
    try {
      const entries = await apiRequest<BackendAdminPermissionEntry[]>(
        `/admin/admins/${adminUserId}/permissions`,
      );
      return entries.map(mapApiAdminPermissionEntry);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudieron cargar los permisos del admin."));
    }
  },
  async grantAdminPermission(adminUserId, permission) {
    try {
      const entries = await apiRequest<BackendAdminPermissionEntry[]>(
        `/admin/admins/${adminUserId}/permissions`,
        {
          method: "POST",
          body: mapAdminPermissionCodeToApiRequest(permission),
        },
      );
      return entries.map(mapApiAdminPermissionEntry);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo otorgar el permiso al admin."));
    }
  },
  async revokeAdminPermission(adminUserId, permission) {
    try {
      const entries = await apiRequest<BackendAdminPermissionEntry[]>(
        `/admin/admins/${adminUserId}/permissions`,
        {
          method: "DELETE",
          body: mapAdminPermissionCodeToApiRequest(permission),
        },
      );
      return entries.map(mapApiAdminPermissionEntry);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo revocar el permiso del admin."));
    }
  },
};
