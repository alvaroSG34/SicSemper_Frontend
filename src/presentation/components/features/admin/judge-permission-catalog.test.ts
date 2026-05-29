import { describe, expect, it } from 'vitest';
import {
  getJudgePermissionDescription,
  getJudgePermissionLabel,
  getJudgePermissionSearchText,
} from './judge-permission-catalog';

describe('judge-permission-catalog', () => {
  it('returns friendly label and description for each judge permission', () => {
    expect(getJudgePermissionLabel('JUDGE_DASHBOARD_READ')).toBe('Ver panel de juez');
    expect(getJudgePermissionDescription('JUDGE_REVIEW_START')).toContain('guardar avances');
    expect(getJudgePermissionSearchText('JUDGE_MODELS_READ')).toContain('ver maquetas asignadas');
  });
});
