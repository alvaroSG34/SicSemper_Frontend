import { describe, expect, it } from 'vitest';
import {
  combineLaPazDateAndTimeToUtcIso,
  formatEventDateRangeInLaPaz,
  splitUtcIsoToLaPazDateAndTime,
  toLaPazDateTimeTimestamp,
} from './event-datetime';

describe('event-datetime utils', () => {
  it('converts La Paz local date/time to UTC ISO', () => {
    const result = combineLaPazDateAndTimeToUtcIso('2026-05-10', '09:00');
    expect(result).toBe('2026-05-10T13:00:00.000Z');
  });

  it('splits UTC ISO into La Paz local date/time', () => {
    const result = splitUtcIsoToLaPazDateAndTime('2026-05-10T13:00:00.000Z');
    expect(result).toEqual({
      date: '2026-05-10',
      time: '09:00',
    });
  });

  it('keeps date-only legacy values as midnight local time', () => {
    const result = splitUtcIsoToLaPazDateAndTime('2026-05-10');
    expect(result).toEqual({
      date: '2026-05-10',
      time: '00:00',
    });
  });

  it('builds comparable timestamps for validation', () => {
    const start = toLaPazDateTimeTimestamp('2026-05-10', '09:00');
    const end = toLaPazDateTimeTimestamp('2026-05-10', '10:00');
    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    expect((end ?? 0) > (start ?? 0)).toBe(true);
  });

  it('formats same-day date ranges with one date and two times', () => {
    const result = formatEventDateRangeInLaPaz(
      '2026-05-10T13:00:00.000Z',
      '2026-05-10T22:30:00.000Z',
    );

    expect(result).toContain('10');
    expect(/9:00|09:00/.test(result)).toBe(true);
    expect(/18:30|6:30/.test(result)).toBe(true);
  });
});
