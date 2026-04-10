import type { AdminSectionId } from "./admin-access-matrix";

export const adminSectionRouteById: Record<AdminSectionId, string> = {
  inicio: "/admin/inicio",
  participantes: "/admin/participantes",
  eventos: "/admin/eventos",
  jueces: "/admin/jueces",
  clubes: "/admin/clubes",
  categorias: "/admin/categorias",
  admins: "/admin/admins",
  permisos: "/admin/permisos",
  ajustes: "/admin/ajustes",
};

export const adminDefaultRoute = adminSectionRouteById.inicio;

export const adminPermissionsManagerRoute = "/admin/admins/permisos";

export const isAdminSectionId = (value: string): value is AdminSectionId =>
  Object.prototype.hasOwnProperty.call(adminSectionRouteById, value);
