import type {
  ApiAdminManagedUser,
  ApiDemoteAdminUser,
  ApiPromoteAdminUser,
} from "@/application/admin/contracts/admin-admins.contract";
import type {
  ApiBanParticipantResponse,
  ApiListUsersResponse,
  ApiUnbanParticipantResponse,
} from "@/application/admin/contracts/admin-users.contract";
import type { ApiJudgeUser } from "@/application/admin/contracts/admin-judges.contract";
import {
  mapApiAdminManagedUserToDomainUser,
  mapCreateAdminPayloadToApiRequest,
} from "@/application/admin/mappers/admin-admins.mapper";
import { mapApiJudgeUserToDomainUser } from "@/application/admin/mappers/admin-judges.mapper";
import { mapApiAdminDashboardUserToDomainUser } from "@/application/admin/mappers/admin-users.mapper";
import type { AdminService } from "@/application/admin/admin.service.types";
import { apiRequest } from "@/infrastructure/api/http-client";
import { toErrorMessage } from "./admin-service.shared";

type BackendListUsers = ApiListUsersResponse;
type BackendBanParticipantUser = ApiBanParticipantResponse;
type BackendUnbanParticipantUser = ApiUnbanParticipantResponse;
type BackendJudgeUser = ApiJudgeUser;
type BackendAdminManagedUser = ApiAdminManagedUser;
type BackendPromoteAdminUser = ApiPromoteAdminUser;
type BackendDemoteAdminUser = ApiDemoteAdminUser;

export const adminUsersService: Pick<
  AdminService,
  | "listUsers"
  | "promoteToJudge"
  | "demoteJudge"
  | "createJudge"
  | "createAdmin"
  | "promoteToAdmin"
  | "demoteAdmin"
  | "banParticipant"
  | "unbanParticipant"
> = {
  async listUsers() {
    try {
      const users = await apiRequest<BackendListUsers>("/admin/users");
      return users.map(mapApiAdminDashboardUserToDomainUser);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar la lista de usuarios."));
    }
  },
  async promoteToJudge(userId) {
    try {
      const user = await apiRequest<BackendJudgeUser>(`/admin/users/${userId}/promote-judge`, {
        method: "PATCH",
      });
      return mapApiJudgeUserToDomainUser(user);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo promover al usuario a juez."));
    }
  },
  async demoteJudge(userId) {
    try {
      const user = await apiRequest<BackendJudgeUser>(`/admin/users/${userId}/demote-judge`, {
        method: "PATCH",
      });
      return mapApiJudgeUserToDomainUser(user);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo quitar el rol de juez."));
    }
  },
  async createJudge(payload) {
    try {
      const user = await apiRequest<BackendAdminManagedUser>("/admin/judges", {
        method: "POST",
        body: mapCreateAdminPayloadToApiRequest(payload),
      });
      return mapApiAdminManagedUserToDomainUser(user);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo crear el juez."));
    }
  },
  async createAdmin(payload) {
    try {
      const user = await apiRequest<BackendAdminManagedUser>("/admin/admins", {
        method: "POST",
        body: mapCreateAdminPayloadToApiRequest(payload),
      });
      return mapApiAdminManagedUserToDomainUser(user);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo crear el admin."));
    }
  },
  async promoteToAdmin(userId) {
    try {
      const user = await apiRequest<BackendPromoteAdminUser>(`/admin/users/${userId}/promote-admin`, {
        method: "PATCH",
      });
      return mapApiAdminManagedUserToDomainUser(user);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo promover al usuario a admin."));
    }
  },
  async demoteAdmin(userId) {
    try {
      const user = await apiRequest<BackendDemoteAdminUser>(`/admin/users/${userId}/demote-admin`, {
        method: "PATCH",
      });
      return mapApiAdminManagedUserToDomainUser(user);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo quitar el rol admin."));
    }
  },
  async banParticipant(userId) {
    try {
      const user = await apiRequest<BackendBanParticipantUser>(`/admin/users/${userId}/ban`, {
        method: "PATCH",
      });
      return mapApiAdminDashboardUserToDomainUser(user);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo banear al participante."));
    }
  },
  async unbanParticipant(userId) {
    try {
      const user = await apiRequest<BackendUnbanParticipantUser>(`/admin/users/${userId}/unban`, {
        method: "PATCH",
      });
      return mapApiAdminDashboardUserToDomainUser(user);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo quitar la suspension."));
    }
  },
};
