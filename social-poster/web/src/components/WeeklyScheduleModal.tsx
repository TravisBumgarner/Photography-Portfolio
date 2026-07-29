import { TimeCombobox } from './TimeCombobox';
import { formatHHMM } from '../utils/datetime';
import { DAY_NAMES, DAY_SHORT, timesByDay } from '../utils/schedule';
import type { BulkSchedule } from '../api/types';

interface WeeklyScheduleModalProps {
  schedule: BulkSchedule;
  /** Called with the updated schedule on every add/remove (live-saved). */
  onChange: (schedule: BulkSchedule) => void;
  onClose: () => void;
}

/**
 * Dedicated weekly posting-schedule editor: a 7-column week grid where each
 * day has its own independent posting times (Buffer-style). Changes save as
 * they're made.
 */
export function WeeklyScheduleModal({
  schedule,
  onChange,
  onClose,
}: WeeklyScheduleModalProps) {
  const byDay = timesByDay(schedule);

  const addSlot = (day: number, time: string) => {
    if (schedule.slots.some((s) => s.day === day && s.time === time)) {
      return;
    }
    onChange({
      slots: [...schedule.slots, { day, time }].sort(
        (a, b) => a.day - b.day || a.time.localeCompare(b.time)
      ),
    });
  };

  const removeSlot = (day: number, time: string) => {
    onChange({
      slots: schedule.slots.filter((s) => !(s.day === day && s.time === time)),
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal modal--schedule"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Weekly posting schedule"
      >
        <div className="modal-header">
          <h2>Weekly posting schedule</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="schedule-body">
          <p className="form-subtitle">
            Each day has its own posting times. Bulk-added photos fill these
            slots in order, week after week.
          </p>
          <div className="schedule-grid">
            {DAY_NAMES.map((name, day) => {
              const times = byDay.get(day) ?? [];
              return (
                <div
                  key={name}
                  className={`schedule-day ${
                    times.length > 0 ? 'schedule-day--active' : ''
                  }`}
                >
                  <span className="schedule-day-name" title={name}>
                    {DAY_SHORT[day]}
                  </span>
                  <div className="schedule-day-times">
                    {times.map((time) => (
                      <span key={time} className="bulk-time-chip">
                        {formatHHMM(time)}
                        <button
                          type="button"
                          className="bulk-time-remove"
                          onClick={() => removeSlot(day, time)}
                          aria-label={`Remove ${formatHHMM(time)} on ${name}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <TimeCombobox
                    onPick={(time) => addSlot(day, time)}
                    exclude={times}
                    placeholder="Add…"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
