export type AdminSectionId =
  | "inicio"
  | "participantes"
  | "eventos"
  | "jueces"
  | "clubes"
  | "categorias"
  | "escalas"
  | "admins"
  | "permisos"
  | "landing"
  | "ajustes";

type CrudPermissionSet = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

type SectionAccessMap = Record<AdminSectionId, boolean>;

type ModuleAccessMap = {
  users: CrudPermissionSet;
  clubs: CrudPermissionSet;
  events: CrudPermissionSet;
  categories: CrudPermissionSet;
  eventCategories: CrudPermissionSet;
  judgeAssignments: CrudPermissionSet;
  judgePermissions: CrudPermissionSet;
  adminPermissions: CrudPermissionSet;
};

export type AdminAccessMatrix = {
  effectivePermissions: string[];
  section: SectionAccessMap;
  module: ModuleAccessMap;
  canReadJudgesSection: boolean;
};

const noCrud = (): CrudPermissionSet => ({
  create: false,
  read: false,
  update: false,
  delete: false,
});

const hasPermission = (granted: Set<string>, permission: string) =>
  granted.has(permission);

const buildCrud = (granted: Set<string>, prefix: string): CrudPermissionSet => ({
  create: hasPermission(granted, `${prefix}_CREATE`),
  read: hasPermission(granted, `${prefix}_READ`),
  update: hasPermission(granted, `${prefix}_UPDATE`),
  delete: hasPermission(granted, `${prefix}_DELETE`),
});

export const createAdminAccessMatrix = (
  effectivePermissions: string[],
  isSuperadmin: boolean,
): AdminAccessMatrix => {
  const uniquePermissions = Array.from(new Set(effectivePermissions));
  const granted = new Set(uniquePermissions);
  const moduleAccess: ModuleAccessMap = {
    users: buildCrud(granted, "ADMIN_USERS"),
    clubs: buildCrud(granted, "ADMIN_CLUBS"),
    events: buildCrud(granted, "ADMIN_EVENTS"),
    categories: buildCrud(granted, "ADMIN_CATEGORIES"),
    eventCategories: buildCrud(granted, "ADMIN_EVENT_CATEGORIES"),
    judgeAssignments: buildCrud(granted, "ADMIN_JUDGE_ASSIGNMENTS"),
    judgePermissions: buildCrud(granted, "ADMIN_JUDGE_PERMISSIONS"),
    adminPermissions: buildCrud(granted, "ADMIN_ADMIN_PERMISSIONS"),
  };
  const canReadJudgesSection =
    moduleAccess.judgeAssignments.read || moduleAccess.judgePermissions.read;

  return {
    effectivePermissions: uniquePermissions,
    section: {
      inicio: true,
      participantes: moduleAccess.users.read,
      eventos: moduleAccess.events.read,
      jueces: canReadJudgesSection,
      clubes: moduleAccess.clubs.read,
      categorias: moduleAccess.categories.read,
      escalas: moduleAccess.categories.read,
      admins: isSuperadmin && moduleAccess.adminPermissions.read,
      permisos: isSuperadmin && moduleAccess.adminPermissions.read,
      landing: isSuperadmin,
      ajustes: true,
    },
    module: moduleAccess,
    canReadJudgesSection,
  };
};

export const listAvailableAdminSections = (
  matrix: AdminAccessMatrix,
): AdminSectionId[] => {
  const ordered: AdminSectionId[] = [
    "inicio",
    "participantes",
    "eventos",
    "jueces",
    "clubes",
    "categorias",
    "escalas",
    "admins",
    "permisos",
    "landing",
    "ajustes",
  ];

  return ordered.filter((section) => matrix.section[section]);
};

export const emptyAdminAccessMatrix = (): AdminAccessMatrix => ({
  effectivePermissions: [],
  section: {
    inicio: true,
    participantes: false,
    eventos: false,
    jueces: false,
    clubes: false,
    categorias: false,
    escalas: false,
    admins: false,
    permisos: false,
    landing: false,
    ajustes: true,
  },
  module: {
    users: noCrud(),
    clubs: noCrud(),
    events: noCrud(),
    categories: noCrud(),
    eventCategories: noCrud(),
    judgeAssignments: noCrud(),
    judgePermissions: noCrud(),
    adminPermissions: noCrud(),
  },
  canReadJudgesSection: false,
});
