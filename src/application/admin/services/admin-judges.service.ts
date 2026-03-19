import type {
  ApiJudgeAssignmentScope,
  ApiJudgePermissionEntry,
} from "@/application/admin/contracts/admin-judges.contract";
import {
  mapApiJudgeAssignmentToJudgeAssignmentScope,
  mapApiJudgePermissionEntry,
  mapAssignJudgeScopePayloadToApiRequest,
  mapJudgePermissionCodeToApiRequest,
} from "@/application/admin/mappers/admin-judges.mapper";
import type { AdminService } from "@/application/admin/admin.service.types";
import { apiRequest } from "@/infrastructure/api/http-client";
import { toErrorMessage } from "./admin-service.shared";

type BackendJudgeAssignment = ApiJudgeAssignmentScope;
type BackendJudgePermissionEntry = ApiJudgePermissionEntry;

export const adminJudgesService: Pick<
  AdminService,
  | "assignJudgeScope"
  | "removeJudgeScope"
  | "listJudgePermissions"
  | "grantJudgePermission"
  | "revokeJudgePermission"
> = {
  async assignJudgeScope(payload) {
    try {
      const assignment = await apiRequest<BackendJudgeAssignment>("/admin/judge-assignments", {
        method: "POST",
        body: mapAssignJudgeScopePayloadToApiRequest(payload),
      });

      return mapApiJudgeAssignmentToJudgeAssignmentScope(assignment);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo asignar el alcance del juez."));
    }
  },
  async removeJudgeScope(assignmentId) {
    try {
      await apiRequest<{ success: boolean }>(`/admin/judge-assignments/${assignmentId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo remover la asignacion del juez."));
    }
  },
  async listJudgePermissions(judgeUserId) {
    try {
      const entries = await apiRequest<BackendJudgePermissionEntry[]>(
        `/admin/judges/${judgeUserId}/permissions`,
      );
      return entries.map(mapApiJudgePermissionEntry);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudieron cargar los permisos del juez."));
    }
  },
  async grantJudgePermission(judgeUserId, permission) {
    try {
      const entries = await apiRequest<BackendJudgePermissionEntry[]>(
        `/admin/judges/${judgeUserId}/permissions`,
        {
          method: "POST",
          body: mapJudgePermissionCodeToApiRequest(permission),
        },
      );
      return entries.map(mapApiJudgePermissionEntry);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo otorgar el permiso."));
    }
  },
  async revokeJudgePermission(judgeUserId, permission) {
    try {
      const entries = await apiRequest<BackendJudgePermissionEntry[]>(
        `/admin/judges/${judgeUserId}/permissions`,
        {
          method: "DELETE",
          body: mapJudgePermissionCodeToApiRequest(permission),
        },
      );
      return entries.map(mapApiJudgePermissionEntry);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo revocar el permiso."));
    }
  },
};
