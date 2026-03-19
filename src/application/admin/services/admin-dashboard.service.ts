import type {
  ApiAdminDashboardResponse,
  ApiAdminDashboardSummaryResponse,
} from "@/application/admin/contracts/admin-dashboard.contract";
import {
  buildCatalogFromApiAdminDashboard,
  mapApiAdminDashboardActivityToActivityLogItem,
  mapApiAdminDashboardClubToAdminClub,
} from "@/application/admin/mappers/admin-dashboard.mapper";
import {
  mapApiJudgeAssignmentToJudgeAssignmentScope,
} from "@/application/admin/mappers/admin-judges.mapper";
import { mapApiSystemPermissionToAdminPermission } from "@/application/admin/mappers/admin-permissions.mapper";
import { mapApiAdminDashboardUserToDomainUser } from "@/application/admin/mappers/admin-users.mapper";
import type { AdminService } from "@/application/admin/admin.service.types";
import { getDashboardSnapshot, getDashboardSummarySnapshot, getPermissionsSnapshot, toErrorMessage } from "./admin-service.shared";

type DashboardSnapshot = ApiAdminDashboardResponse;
type DashboardSummarySnapshot = ApiAdminDashboardSummaryResponse;

export const adminDashboardService: Pick<
  AdminService,
  "getDashboardSummaryData" | "getDashboardData" | "listCatalog"
> = {
  async getDashboardSummaryData() {
    try {
      const summary: DashboardSummarySnapshot = await getDashboardSummarySnapshot();
      return {
        kpis: {
          activeUsers: summary.kpis.activeUsers,
          activeEvents: summary.kpis.activeEvents,
          openIncidents: summary.kpis.openIncidents,
        },
        effectivePermissions: summary.effectivePermissions,
        alerts: summary.alerts,
        activity: summary.activity.map(mapApiAdminDashboardActivityToActivityLogItem),
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el resumen del dashboard admin."));
    }
  },
  async getDashboardData() {
    try {
      const dashboard: DashboardSnapshot = await getDashboardSnapshot();
      const catalog = buildCatalogFromApiAdminDashboard(dashboard);
      let permissionsPayload = dashboard.permissions;

      if (!permissionsPayload) {
        try {
          const items = await getPermissionsSnapshot();
          permissionsPayload = {
            total: items.length,
            items,
          };
        } catch {
          permissionsPayload = {
            total: 0,
            items: [],
          };
        }
      }

      return {
        kpis: {
          activeUsers: dashboard.kpis.activeUsers,
          activeEvents: dashboard.kpis.activeEvents,
          openIncidents: dashboard.kpis.openIncidents,
        },
        effectivePermissions: dashboard.effectivePermissions,
        users: dashboard.users.map(mapApiAdminDashboardUserToDomainUser),
        activity: dashboard.activity.map(mapApiAdminDashboardActivityToActivityLogItem),
        alerts: dashboard.alerts,
        assignments: dashboard.assignments.map(mapApiJudgeAssignmentToJudgeAssignmentScope),
        clubs: dashboard.clubs.map((club) =>
          mapApiAdminDashboardClubToAdminClub(club, dashboard.users),
        ),
        permissions: {
          total: permissionsPayload.total,
          items: permissionsPayload.items.map(mapApiSystemPermissionToAdminPermission),
        },
        catalog,
      };
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el dashboard admin."));
    }
  },
  async listCatalog() {
    try {
      const dashboard = await getDashboardSnapshot();
      return buildCatalogFromApiAdminDashboard(dashboard);
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo cargar el catalogo admin."));
    }
  },
};
