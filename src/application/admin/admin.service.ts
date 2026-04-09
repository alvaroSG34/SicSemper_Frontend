import type { AdminService } from "@/application/admin/admin.service.types";
import { adminCategoriesService } from "@/application/admin/services/admin-categories.service";
import { adminClubsService } from "@/application/admin/services/admin-clubs.service";
import { adminDashboardService } from "@/application/admin/services/admin-dashboard.service";
import { adminEventsService } from "@/application/admin/services/admin-events.service";
import { adminJudgesService } from "@/application/admin/services/admin-judges.service";
import { adminPermissionsService } from "@/application/admin/services/admin-permissions.service";
import { adminUploadsService } from "@/application/admin/services/admin-uploads.service";
import { adminUsersService } from "@/application/admin/services/admin-users.service";

export type { AdminService } from "@/application/admin/admin.service.types";

export const adminService: AdminService = {
  ...adminDashboardService,
  ...adminUploadsService,
  ...adminClubsService,
  ...adminUsersService,
  ...adminEventsService,
  ...adminCategoriesService,
  ...adminJudgesService,
  ...adminPermissionsService,
};
