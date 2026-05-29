import type { JudgePermissionCode } from '@/domain/admin/admin.types';

type JudgePermissionCatalogEntry = {
  label: string;
  description: string;
};

const JUDGE_PERMISSION_CATALOG: Record<JudgePermissionCode, JudgePermissionCatalogEntry> = {
  JUDGE_DASHBOARD_READ: {
    label: 'Ver panel de juez',
    description: 'Permite abrir el panel principal y las notificaciones del juez.',
  },
  JUDGE_REVIEW_START: {
    label: 'Iniciar evaluaciones',
    description: 'Permite comenzar revision y guardar avances de evaluacion.',
  },
  JUDGE_REVIEW_COMPLETE: {
    label: 'Enviar evaluaciones',
    description: 'Permite enviar la evaluacion final de una maqueta.',
  },
  JUDGE_MODELS_READ: {
    label: 'Ver maquetas asignadas',
    description: 'Permite consultar maquetas y categorias asignadas para calificar.',
  },
};

export const getJudgePermissionLabel = (code: JudgePermissionCode) =>
  JUDGE_PERMISSION_CATALOG[code].label;

export const getJudgePermissionDescription = (code: JudgePermissionCode) =>
  JUDGE_PERMISSION_CATALOG[code].description;

export const getJudgePermissionSearchText = (code: JudgePermissionCode) =>
  `${code} ${getJudgePermissionLabel(code)} ${getJudgePermissionDescription(code)}`.toLowerCase();
