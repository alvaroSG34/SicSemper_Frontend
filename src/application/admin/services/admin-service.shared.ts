import type {
  ApiAdminDashboardResponse,
  ApiAdminDashboardSummaryResponse,
} from "@/application/admin/contracts/admin-dashboard.contract";
import type { ApiSystemPermission } from "@/application/admin/contracts/admin-permissions.contract";
import { ApiError, apiRequest } from "@/infrastructure/api/http-client";

const adminErrorMessages: Record<string, string> = {
  ACTOR_NOT_SUPERADMIN: "Solo SUPERADMIN puede ejecutar esta accion.",
  CLUB_CONTACT_EMAIL_ALREADY_IN_USE: "Ya existe un club con ese correo de contacto.",
  CLUB_HAS_EVENTS: "No puedes eliminar un club que todavia organiza eventos.",
  CATEGORY_HAS_CHILDREN: "No puedes eliminar una categoria que todavia tiene subcategorias.",
  EVENT_CATEGORY_ALREADY_EXISTS: "Esa categoria ya esta vinculada al evento.",
  JUDGE_ASSIGNMENT_ALREADY_EXISTS: "Ese alcance ya esta asignado para el juez seleccionado.",
  JUDGE_ROLE_REQUIRED: "Debes seleccionar un usuario con rol de juez.",
  USER_ALREADY_ADMIN: "El usuario ya tiene el rol ADMIN.",
  USER_IS_NOT_ADMIN: "El usuario no tiene rol ADMIN.",
  NOTIFICATION_NOT_FOUND: "La notificacion ya no esta disponible para este usuario.",
  EMAIL_ALREADY_IN_USE: "Ese correo ya esta registrado.",
  CI_ALREADY_IN_USE: "Ese CI ya esta registrado.",
  CLUB_NOT_FOUND: "El club seleccionado no existe.",
  CLUB_LOGO_FILE_REQUIRED: "Debes seleccionar un logo para continuar.",
  CLUB_LOGO_FILE_TYPE_INVALID: "Solo se permiten imagenes JPG, PNG, WEBP o GIF.",
  CLUB_LOGO_FILE_SIZE_INVALID: "El logo del club debe pesar maximo 2MB.",
  EVENT_IMAGE_FILE_REQUIRED: "Debes seleccionar una imagen para continuar.",
  EVENT_IMAGE_FILE_TYPE_INVALID: "Solo se permiten imagenes JPG, PNG o WEBP.",
  EVENT_IMAGE_FILE_SIZE_INVALID: "La imagen del evento debe pesar maximo 2MB.",
  LANDING_IMAGE_FILE_REQUIRED: "Debes seleccionar una imagen para la landing.",
  LANDING_IMAGE_FILE_TYPE_INVALID: "Solo se permiten imagenes JPG, PNG, WEBP o GIF.",
  LANDING_IMAGE_FILE_SIZE_INVALID: "La imagen de la landing debe pesar maximo 5MB.",
  SUPERADMIN_IMMUTABLE: "No se puede modificar un usuario con rol SUPERADMIN.",
  USER_NOT_FOUND: "No se encontro el usuario solicitado.",
};

export const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    if (error.code && adminErrorMessages[error.code]) {
      return adminErrorMessages[error.code];
    }

    if (error.message && error.message !== `HTTP_${error.statusCode}`) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const getDashboardSnapshot = () => apiRequest<ApiAdminDashboardResponse>("/admin/dashboard");
export const getDashboardSummarySnapshot = () =>
  apiRequest<ApiAdminDashboardSummaryResponse>("/admin/dashboard/summary");
export const getPermissionsSnapshot = () => apiRequest<ApiSystemPermission[]>("/admin/permissions");
