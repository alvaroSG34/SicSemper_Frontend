import type { AdminService } from "@/application/admin/admin.service.types";
import { apiRequest } from "@/infrastructure/api/http-client";
import { toErrorMessage } from "./admin-service.shared";

export const adminUploadsService: Pick<AdminService, "uploadClubLogo" | "uploadEventImage"> = {
  async uploadClubLogo(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      return await apiRequest<{ url: string }>("/admin/uploads/club-logo", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo subir el logo del club."));
    }
  },
  async uploadEventImage(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      return await apiRequest<{ url: string }>("/admin/uploads/event-image", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      throw new Error(toErrorMessage(error, "No se pudo subir la imagen del evento."));
    }
  },
};

