import { useState } from 'react';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { formatHHMM } from '../utils/datetime';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { data: settings, isLoading } = useSettings();
  const update = useUpdateSettings();
  const [newTime, setNewTime] = useState('09:00');

  const times = settings?.common_times ?? [];

  const addTime = () => {
    if (!newTime || times.includes(newTime)) {
      return;
    }
    update.mutate({ common_times: [...times, newTime] });
  };

  const removeTime = (time: string) => {
    update.mutate({ common_times: times.filter((t) => t !== time) });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        <div className="modal-header">
          <h2>Settings</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="form">
          <h3 className="form-subtitle">Common times</h3>
          <p className="muted form-hint">
            Presets that appear as a quick-pick dropdown when scheduling a post.
          </p>

          {isLoading ? (
            <span className="muted">Loading…</span>
          ) : times.length === 0 ? (
            <span className="muted">No common times yet.</span>
          ) : (
            <div className="settings-time-list">
              {times.map((time) => (
                <div key={time} className="settings-time-row">
                  <span>{formatHHMM(time)}</span>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={update.isPending}
                    onClick={() => removeTime(time)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="settings-add-time">
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={update.isPending || !newTime || times.includes(newTime)}
              onClick={addTime}
            >
              Add time
            </button>
          </div>

          <div className="form-error-slot">
            {update.isError && (
              <span className="state-error">{update.error.message}</span>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
