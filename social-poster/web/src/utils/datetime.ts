/**
 * Helpers for converting between API UTC ISO strings and local display /
 * `<input type="datetime-local">` values.
 */

/** Parse an API ISO string (UTC, `...Z`) into a Date. */
export function parseISO(iso: string): Date {
  return new Date(iso);
}

/** Format a Date as a UTC ISO string the API expects: `YYYY-MM-DDTHH:MM:SSZ`. */
export function toApiISO(date: Date): string {
  return `${date.toISOString().slice(0, 19)}Z`;
}

/** Convert a `datetime-local` value (local time, no tz) to an API UTC ISO string. */
export function datetimeLocalToApiISO(local: string): string {
  // `local` looks like "2026-06-25T14:30"; new Date() interprets it as local time.
  return toApiISO(new Date(local));
}

/** Format a local Date as a `datetime-local` value (`YYYY-MM-DDTHH:MM`). */
export function dateToDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Convert an API UTC ISO string to a local `datetime-local` value (`YYYY-MM-DDTHH:MM`). */
export function apiISOToDatetimeLocal(iso: string): string {
  return dateToDatetimeLocal(new Date(iso));
}

/** Format a 'HH:MM' 24-hour string as a friendly local-style time, e.g. "9:00 AM". */
export function formatHHMM(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/**
 * Parse a loosely-typed time ("9", "9:30", "930", "9:30 pm", "2130") into
 * 'HH:MM' 24-hour form, or null if it isn't a valid time.
 */
export function parseTimeInput(text: string): string | null {
  const cleaned = text.trim().toLowerCase();
  const match = cleaned.match(/^(\d{1,2})(?::?(\d{2}))?\s*(a|am|p|pm)?$/);
  if (!match) {
    return null;
  }
  let hours = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3];
  if (meridiem) {
    if (hours < 1 || hours > 12) {
      return null;
    }
    if (meridiem.startsWith('p') && hours !== 12) {
      hours += 12;
    }
    if (meridiem.startsWith('a') && hours === 12) {
      hours = 0;
    }
  }
  if (hours > 23 || minutes > 59) {
    return null;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}`;
}

/** Day key (`YYYY-MM-DD`) in local time for grouping posts onto calendar cells. */
export function localDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Short local time, e.g. "2:30 PM". */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Full local date + time for the queue view. */
export function formatDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Re-anchor a post's scheduled timestamp onto a different calendar day while
 * keeping its original local time-of-day. Used by drag-to-reschedule.
 * @param original the post's current scheduled Date
 * @param targetDayKey the destination day key (`YYYY-MM-DD`, local)
 */
export function moveToDay(original: Date, targetDayKey: string): Date {
  const [y, m, d] = targetDayKey.split('-').map(Number);
  const next = new Date(original);
  next.setFullYear(y, m - 1, d);
  return next;
}
