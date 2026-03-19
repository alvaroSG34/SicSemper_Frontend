import type {
  ApiAdminClub,
  ApiClubDeleteImpact,
  ApiDeleteResponse,
} from "@/application/admin/contracts/admin-clubs.contract";
import {
  mapApiClubDeleteImpact,
  mapApiClubToAdminClub,
  mapCreateClubPayloadToApiRequest,
  mapUpdateClubPayloadToApiRequest,
} from "@/application/admin/mappers/admin-clubs.mapper";
import type { AdminService } from "@/application/admin/admin.service.types";
import { apiRequest } from "@/infrastructure/api/http-client";
import { toErrorMessage } from "./admin-service.shared";

type BackendClub = ApiAdminClub;

export const adminClubsService: Pick<
  AdminService,
  "createClub" | "updateClub" | "getClubDeleteImpact" | "removeClub"
> = {
  async createClub(payload) {
    try {
      const club = await apiRequest<BackendClub>("/admin/clubs", {
        method: "POST",
        body: mapCreateClubPayloadToApiRequest(payload),
      });
      return mapApiClubToAdminClub(club, 0);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo crear el club."));
    }
  },
  async updateClub(payload) {
    try {
      const club = await apiRequest<BackendClub>(`/admin/clubs/${payload.id}`, {
        method: "PUT",
        body: mapUpdateClubPayloadToApiRequest(payload),
      });
      return mapApiClubToAdminClub(club, 0);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo actualizar el club."));
    }
  },
  async getClubDeleteImpact(clubId) {
    try {
      const impact = await apiRequest<ApiClubDeleteImpact>(`/admin/clubs/${clubId}/delete-impact`);
      return mapApiClubDeleteImpact(impact);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo calcular el impacto de eliminacion del club."));
    }
  },
  async removeClub(clubId) {
    try {
      await apiRequest<ApiDeleteResponse>(`/admin/clubs/${clubId}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo eliminar el club."));
    }
  },
};
