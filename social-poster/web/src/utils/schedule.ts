import type { BulkSchedule } from '../api/types';
import { toApiISO } from './datetime';

export const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Group a schedule's slots into day -> sorted 'HH:MM' times. */
export function timesByDay(schedule: BulkSchedule): Map<number, string[]> {
  const map = new Map<number, string[]>();
  for (const slot of schedule.slots) {
    const times = map.get(slot.day) ?? [];
    times.push(slot.time);
    map.set(slot.day, times);
  }
  for (const times of map.values()) {
    times.sort();
  }
  return map;
}

/**
 * Generate the next `count` free schedule slots from the weekly template.
 *
 * Walks forward day by day from `from` (local time), emitting each matching
 * day's own times, repeating weekly for as long as needed. Slots in the past
 * or whose exact timestamp is already taken (`occupiedISO`, API ISO strings)
 * are skipped. Returns fewer than `count` only if the template is empty.
 */
export function generateSlots(
  schedule: BulkSchedule,
  count: number,
  occupiedISO: ReadonlySet<string>,
  from: Date = new Date()
): Date[] {
  const byDay = timesByDay(schedule);
  if (byDay.size === 0 || count <= 0) {
    return [];
  }
  const slots: Date[] = [];
  const day = new Date(from);
  day.setHours(0, 0, 0, 0);
  // Generous hard stop (~10 years) so a degenerate occupied set can't loop forever.
  for (let i = 0; slots.length < count && i < 3700; i++) {
    for (const time of byDay.get(day.getDay()) ?? []) {
      const [hours, minutes] = time.split(':').map(Number);
      const slot = new Date(day);
      slot.setHours(hours, minutes, 0, 0);
      if (slot.getTime() > from.getTime() && !occupiedISO.has(toApiISO(slot))) {
        slots.push(slot);
        if (slots.length === count) {
          break;
        }
      }
    }
    day.setDate(day.getDate() + 1);
  }
  return slots;
}
