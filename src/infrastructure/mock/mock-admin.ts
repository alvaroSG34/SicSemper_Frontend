import type {
  ActivityLogItem,
  CatalogCategory,
  CatalogEvent,
  CatalogSubcategory,
  JudgeAssignmentScope,
  SystemAlert,
} from "@/domain/admin/admin.types";

const idCounters: Record<string, number> = {
  ev: 20,
  cat: 30,
  sub: 40,
  asg: 50,
  act: 60,
  alt: 70,
};

const nextId = (prefix: keyof typeof idCounters): string => {
  idCounters[prefix] += 1;
  return `${prefix}-${idCounters[prefix]}`;
};

const nowIso = () => new Date().toISOString();

export const mockCatalogEvents: CatalogEvent[] = [
  { id: "ev-1", name: "Copa Nacional de Modelismo 2026", status: "ACTIVO", place: "Centro de Convenciones Norte", startDate: "2026-03-20", endDate: "2026-03-23", description: "Evento principal de modelismo con evaluaciones por categoria y exhibicion de maquetas.", createdAt: "2026-01-10T12:00:00.000Z", updatedAt: "2026-01-10T12:00:00.000Z" },
  { id: "ev-2", name: "Gran Premio de Modelismo Naval", status: "ACTIVO", place: "Campus Tecnologico Sur", startDate: "2026-04-05", endDate: "2026-04-06", description: "Competencia enfocada en construccion, detallado y presentacion de maquetas navales.", createdAt: "2026-01-12T09:30:00.000Z", updatedAt: "2026-01-12T09:30:00.000Z" },
  { id: "ev-3", name: "Concurso Latinoamericano de Dioramas", status: "PAUSADO" },
];

export const mockCatalogCategories: CatalogCategory[] = [
  { id: "cat-1", eventId: "ev-1", name: "Aviones", parentId: null },
  { id: "cat-2", eventId: "ev-1", name: "Tanques", parentId: null },
  { id: "cat-3", eventId: "ev-2", name: "Barcos", parentId: null },
  { id: "cat-4", eventId: "ev-3", name: "Dioramas", parentId: null },
];

export const mockCatalogSubcategories: CatalogSubcategory[] = [
  { id: "sub-1", categoryId: "cat-1", name: "Monoplaza" },
  { id: "sub-2", categoryId: "cat-1", name: "Biplaza" },
  { id: "sub-3", categoryId: "cat-2", name: "Blindados livianos" },
  { id: "sub-4", categoryId: "cat-3", name: "Fragatas" },
  { id: "sub-5", categoryId: "cat-4", name: "Escena urbana" },
];

export const mockJudgeAssignments: JudgeAssignmentScope[] = [
  {
    id: "asg-1",
    judgeUserId: "u-2",
    eventId: "ev-1",
    categoryId: "cat-1",
    subcategoryId: "sub-1",
    createdAt: nowIso(),
  },
  {
    id: "asg-2",
    judgeUserId: "u-2",
    eventId: "ev-2",
    categoryId: "cat-3",
    subcategoryId: "sub-4",
    createdAt: nowIso(),
  },
];

export const mockActivityLog: ActivityLogItem[] = [
  {
    id: "act-1",
    title: "Nuevo participante registrado",
    detail: "Carlos Mendoza se registró y validó correo.",
    createdAt: nowIso(),
  },
  {
    id: "act-2",
    title: "Evento actualizado",
    detail: "Copa Nacional de Modelismo 2026 cambio a estado ACTIVO.",
    createdAt: nowIso(),
  },
];

export const mockSystemAlerts: SystemAlert[] = [
  {
    id: "alt-1",
    title: "Incidencia en cola de evaluación",
    detail: "4 maquetas sin juez asignado en categoria Aviones.",
    severity: "ALTA",
    status: "ABIERTA",
    createdAt: nowIso(),
  },
  {
    id: "alt-2",
    title: "Carga alta de revisiones",
    detail: "Se detectó pico de actividad en la franja 18:00-20:00.",
    severity: "MEDIA",
    status: "EN_PROGRESO",
    createdAt: nowIso(),
  },
  {
    id: "alt-3",
    title: "Sincronización de catálogo completada",
    detail: "Última actualización aplicada correctamente.",
    severity: "BAJA",
    status: "RESUELTA",
    createdAt: nowIso(),
  },
];

export const createCatalogEventId = () => nextId("ev");
export const createCategoryId = () => nextId("cat");
export const createSubcategoryId = () => nextId("sub");
export const createAssignmentId = () => nextId("asg");
export const createActivityId = () => nextId("act");
export const createAlertId = () => nextId("alt");

const cloneEvent = (event: CatalogEvent): CatalogEvent => ({ ...event });
const cloneCategory = (category: CatalogCategory): CatalogCategory => ({ ...category });
const cloneSubcategory = (subcategory: CatalogSubcategory): CatalogSubcategory => ({ ...subcategory });
const cloneAssignment = (assignment: JudgeAssignmentScope): JudgeAssignmentScope => ({ ...assignment });
const cloneActivity = (item: ActivityLogItem): ActivityLogItem => ({ ...item });
const cloneAlert = (alert: SystemAlert): SystemAlert => ({ ...alert });

export const getClonedAdminCatalog = () => ({
  events: mockCatalogEvents.map(cloneEvent),
  categories: mockCatalogCategories.map(cloneCategory),
  subcategories: mockCatalogSubcategories.map(cloneSubcategory),
});

export const getClonedJudgeAssignments = () => mockJudgeAssignments.map(cloneAssignment);
export const getClonedActivityLog = () => mockActivityLog.map(cloneActivity);
export const getClonedSystemAlerts = () => mockSystemAlerts.map(cloneAlert);
