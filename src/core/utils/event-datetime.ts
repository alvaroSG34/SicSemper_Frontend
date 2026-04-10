export const EVENT_TIME_ZONE = 'America/La_Paz';

const LA_PAZ_OFFSET_MINUTES = -4 * 60;

type ParsedDate = {
  year: number;
  month: number;
  day: number;
};

type ParsedTime = {
  hours: number;
  minutes: number;
};

export type EventLocalDateTime = {
  date: string;
  time: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat('es-BO', {
  timeZone: EVENT_TIME_ZONE,
  dateStyle: 'medium',
  timeStyle: 'short',
});

const dateOnlyFormatter = new Intl.DateTimeFormat('es-BO', {
  timeZone: EVENT_TIME_ZONE,
  dateStyle: 'medium',
});

const timeOnlyFormatter = new Intl.DateTimeFormat('es-BO', {
  timeZone: EVENT_TIME_ZONE,
  timeStyle: 'short',
});

const parseDate = (value: string): ParsedDate | null => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
};

const parseTime = (value: string): ParsedTime | null => {
  const match = value.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return { hours, minutes };
};

const pad = (value: number) => String(value).padStart(2, '0');

const toDateKeyInTimeZone = (value: Date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);

  const year = parts.find((part) => part.type === 'year')?.value ?? '';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';

  if (!year || !month || !day) {
    return '';
  }

  return `${year}-${month}-${day}`;
};

const parseEventDateInputToDate = (value?: string | null): Date | null => {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const dateParts = parseDate(trimmed);
  if (dateParts) {
    const normalizedIso = combineLaPazDateAndTimeToUtcIso(trimmed, '00:00');
    return normalizedIso ? new Date(normalizedIso) : null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
};

export const combineLaPazDateAndTimeToUtcIso = (
  date: string,
  time: string,
): string | null => {
  const parsedDate = parseDate(date);
  const parsedTime = parseTime(time);

  if (!parsedDate || !parsedTime) {
    return null;
  }

  const localAsUtcMs = Date.UTC(
    parsedDate.year,
    parsedDate.month - 1,
    parsedDate.day,
    parsedTime.hours,
    parsedTime.minutes,
    0,
    0,
  );
  const utcMs = localAsUtcMs - LA_PAZ_OFFSET_MINUTES * 60 * 1000;

  return new Date(utcMs).toISOString();
};

export const splitUtcIsoToLaPazDateAndTime = (
  value?: string | null,
): EventLocalDateTime => {
  if (!value) {
    return { date: '', time: '' };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { date: '', time: '' };
  }

  const dateOnly = parseDate(trimmed);
  if (dateOnly) {
    return {
      date: trimmed,
      time: '00:00',
    };
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return { date: '', time: '' };
  }

  const localMs = parsed.getTime() + LA_PAZ_OFFSET_MINUTES * 60 * 1000;
  const localDate = new Date(localMs);

  return {
    date: `${localDate.getUTCFullYear()}-${pad(localDate.getUTCMonth() + 1)}-${pad(localDate.getUTCDate())}`,
    time: `${pad(localDate.getUTCHours())}:${pad(localDate.getUTCMinutes())}`,
  };
};

export const toLaPazDateTimeTimestamp = (
  date: string,
  time: string,
): number | null => {
  const iso = combineLaPazDateAndTimeToUtcIso(date, time);
  if (!iso) {
    return null;
  }

  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.getTime();
};

export const formatEventDateTimeInLaPaz = (
  value?: string | null,
  fallback = '--',
) => {
  const date = parseEventDateInputToDate(value);
  if (!date) {
    return fallback;
  }

  return dateTimeFormatter.format(date);
};

export const formatEventDateRangeInLaPaz = (
  startDate?: string | null,
  endDate?: string | null,
  fallback = '--',
) => {
  const start = parseEventDateInputToDate(startDate);
  const end = parseEventDateInputToDate(endDate);

  if (!start && !end) {
    return fallback;
  }

  if (start && !end) {
    return formatEventDateTimeInLaPaz(startDate, fallback);
  }

  if (!start && end) {
    return formatEventDateTimeInLaPaz(endDate, fallback);
  }

  if (!start || !end) {
    return fallback;
  }

  const startDateKey = toDateKeyInTimeZone(start);
  const endDateKey = toDateKeyInTimeZone(end);

  if (startDateKey && startDateKey === endDateKey) {
    return `${dateOnlyFormatter.format(start)}, ${timeOnlyFormatter.format(start)} - ${timeOnlyFormatter.format(end)}`;
  }

  return `${dateTimeFormatter.format(start)} - ${dateTimeFormatter.format(end)}`;
};
