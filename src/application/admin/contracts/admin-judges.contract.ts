import type { components, operations } from '@/infrastructure/api/generated/backend-api.types';

export type ApiJudgeAssignmentScope = components['schemas']['JudgeAssignmentScope'];
export type ApiCreateJudgeAssignmentRequest =
  operations['adminCreateJudgeAssignment']['requestBody']['content']['application/json'];
export type ApiSyncJudgeAssignmentsRequest =
  operations['adminSyncJudgeAssignments']['requestBody']['content']['application/json'];
export type ApiJudgeAssignmentSyncSummary =
  operations['adminSyncJudgeAssignments']['responses'][200]['content']['application/json'];
export type ApiJudgeUser =
  operations['adminPromoteToJudge']['responses']['200']['content']['application/json'];
export type ApiJudgePermissionEntry = components['schemas']['JudgePermissionEntry'];
export type ApiJudgePermissionActionRequest =
  operations['adminGrantJudgePermission']['requestBody']['content']['application/json'];
