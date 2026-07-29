import { useMemo, useRef, useState } from 'react';
import { formatHHMM, parseTimeInput } from '../utils/datetime';

/** All half-hour times, '00:00' … '23:30'. */
const PRESETS = Array.from({ length: 48 }, (_, i) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(i / 2))}:${i % 2 === 0 ? '00' : '30'}`;
});

/** Loose match for filtering: "930p" matches "9:30 PM". */
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

interface TimeComboboxProps {
  /** Called with 'HH:MM' when the user picks or types a valid time. */
  onPick: (hhmm: string) => void;
  /** Times already chosen — hidden from the list. */
  exclude?: string[];
  placeholder?: string;
}

/**
 * Google-Calendar-style time picker: a text field that opens a scrollable
 * list of half-hour presets, filters as you type, and accepts precise typed
 * times ("9:44 pm") that aren't in the list. Stays open after a pick so
 * several times can be added in a row.
 */
export function TimeCombobox({
  onPick,
  exclude = [],
  placeholder = 'Add a time…',
}: TimeComboboxProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => {
    const q = normalize(query);
    const matches = PRESETS.filter(
      (t) =>
        !exclude.includes(t) &&
        (q === '' ||
          normalize(formatHHMM(t)).startsWith(q) ||
          normalize(t).startsWith(q))
    );
    // A precisely-typed time ("9:44 pm") that isn't a preset goes on top.
    const typed = parseTimeInput(query);
    if (typed && !matches.includes(typed) && !exclude.includes(typed)) {
      return [typed, ...matches];
    }
    return matches;
  }, [query, exclude]);

  const pick = (hhmm: string) => {
    onPick(hhmm);
    setQuery('');
    setHighlighted(0);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlighted((h) => Math.min(h + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (options[highlighted]) {
        pick(options[highlighted]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="time-combobox">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={query}
        placeholder={placeholder}
        aria-label="Add a time"
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlighted(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {open && options.length > 0 && (
        <ul className="time-combobox-list" role="listbox">
          {options.map((t, i) => (
            <li key={t}>
              <button
                type="button"
                role="option"
                aria-selected={i === highlighted}
                className={`time-combobox-option ${
                  i === highlighted ? 'time-combobox-option--active' : ''
                }`}
                // mousedown (not click) so the input's blur doesn't close the
                // list before the press lands.
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(t);
                }}
                onMouseEnter={() => setHighlighted(i)}
              >
                {formatHHMM(t)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
