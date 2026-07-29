import { useMemo, useRef, useState } from 'react';
import type { DragEvent, MouseEvent as ReactMouseEvent } from 'react';
import { usePosts, useUpdatePost } from '../hooks/usePosts';
import type { Post } from '../api/types';
import { PlatformBadge } from './Badges';
import {
  dateToDatetimeLocal,
  formatTime,
  localDayKey,
  moveToDay,
  parseISO,
  toApiISO,
} from '../utils/datetime';
import { postStatus, POST_STATUS_LABEL } from '../utils/posts';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DND_MIME = 'application/x-post-id';
const MONTHS_SHOWN = 4;

interface CalendarCell {
  date: Date;
  key: string;
  inMonth: boolean;
}

interface CalendarViewProps {
  onEditPost: (post: Post) => void;
  /** Open the new-post modal prefilled to a day (datetime-local string). */
  onAddPost: (scheduledAtLocal: string) => void;
}

/**
 * Build a week-aligned grid covering exactly the weeks the given month touches
 * (no extra trailing week). Cells outside the month are included only to keep
 * the weekday columns aligned and are rendered blank.
 */
function buildCells(viewDate: Date): CalendarCell[] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const start = new Date(firstOfMonth);
  start.setDate(1 - firstOfMonth.getDay()); // back up to Sunday

  const lastOfMonth = new Date(year, month + 1, 0);
  const end = new Date(lastOfMonth);
  end.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay())); // up to Saturday

  const cells: CalendarCell[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    cells.push({
      date: new Date(cursor),
      key: localDayKey(cursor),
      inMonth: cursor.getMonth() === month,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return cells;
}

function uniquePlatforms(post: Post): Post['targets'][number]['platform'][] {
  return Array.from(new Set(post.targets.map((t) => t.platform)));
}

export function CalendarView({ onEditPost, onAddPost }: CalendarViewProps) {
  const { data: posts, isLoading, isError, error } = usePosts();
  const updatePost = useUpdatePost();
  const [baseDate, setBaseDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  // Floating image preview shown while hovering a chip. Suppressed during a
  // drag (tracked via a ref so it's readable inside mouse-enter handlers).
  const [preview, setPreview] = useState<{
    post: Post;
    left: number;
    top: number;
  } | null>(null);
  const draggingRef = useRef(false);

  const showPreview = (post: Post, e: ReactMouseEvent<HTMLDivElement>) => {
    if (draggingRef.current) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const width = 260;
    const height = 260;
    let left = rect.right + 8;
    if (left + width > window.innerWidth) {
      left = Math.max(8, rect.left - width - 8);
    }
    const top = Math.min(Math.max(8, rect.top), window.innerHeight - height - 8);
    setPreview({ post, left, top });
  };

  const months = useMemo(
    () =>
      Array.from(
        { length: MONTHS_SHOWN },
        (_, i) =>
          new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1)
      ),
    [baseDate]
  );

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of posts ?? []) {
      const key = localDayKey(parseISO(post.scheduled_at));
      const list = map.get(key);
      if (list) {
        list.push(post);
      } else {
        map.set(key, [post]);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
    }
    return map;
  }, [posts]);

  const goToMonth = (delta: number) => {
    setBaseDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
  };

  // Clicking an (addable) day opens the new-post modal prefilled to 9am that
  // day — or, if 9am has already passed today, an hour from now.
  const handleAddOnDay = (cellDate: Date) => {
    const when = new Date(cellDate);
    when.setHours(9, 0, 0, 0);
    if (when.getTime() <= Date.now()) {
      when.setTime(Date.now() + 60 * 60 * 1000);
    }
    onAddPost(dateToDatetimeLocal(when));
  };

  const todayKey = localDayKey(new Date());

  const handleDrop = (cellKey: string, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverKey(null);
    if (cellKey < todayKey) {
      return; // can't reschedule into the past
    }
    const raw = e.dataTransfer.getData(DND_MIME);
    const postId = Number(raw);
    if (!raw || Number.isNaN(postId)) {
      return;
    }
    const post = posts?.find((p) => p.id === postId);
    if (!post) {
      return;
    }
    const original = parseISO(post.scheduled_at);
    if (localDayKey(original) === cellKey) {
      return; // dropped on same day, nothing to do
    }
    let moved = moveToDay(original, cellKey);
    // Dropping keeps the original time-of-day, so a move onto *today* can land
    // in the past (e.g. an overdue post whose time has already passed today).
    // We can't read the dragged post's time during dragover to disable the
    // cell per-post, so rather than silently no-op, nudge it a couple minutes
    // into the future — clearly upcoming (not instantly "overdue") and the
    // publisher sends it on its next tick.
    if (moved.getTime() <= Date.now()) {
      moved = new Date(Date.now() + 2 * 60 * 1000);
    }
    updatePost.mutate({
      id: postId,
      input: { scheduled_at: toApiISO(moved) },
    });
  };

  if (isLoading) {
    return <div className="state-msg">Loading calendar…</div>;
  }
  if (isError) {
    return (
      <div className="state-msg state-error">
        Failed to load posts: {error.message}
      </div>
    );
  }

  const rangeLabel = `${months[0].toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  })} – ${months[months.length - 1].toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  })}`;

  const renderMonth = (monthDate: Date) => {
    const cells = buildCells(monthDate);
    const monthLabel = monthDate.toLocaleString(undefined, {
      month: 'long',
      year: 'numeric',
    });
    return (
      <div className="calendar-month" key={monthLabel}>
        <h3 className="calendar-month-title">{monthLabel}</h3>
        <div className="calendar-grid calendar-weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d} className="weekday">
              {d}
            </div>
          ))}
        </div>
        <div className="calendar-grid calendar-body">
          {cells.map((cell) => {
            // Days from the previous/next month are shown as empty placeholders
            // only to keep the weekday columns aligned.
            if (!cell.inMonth) {
              return (
                <div key={cell.key} className="day-cell day-cell--blank" />
              );
            }
            const isPast = cell.key < todayKey;
            const droppable = !isPast;
            const dayPosts = postsByDay.get(cell.key) ?? [];
            const classes = [
              'day-cell',
              droppable ? 'day-cell--addable' : '',
              cell.key === todayKey ? 'day-cell--today' : '',
              isPast ? 'day-cell--past' : '',
              cell.key === dragOverKey ? 'day-cell--dragover' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <div
                key={cell.key}
                className={classes}
                onClick={
                  droppable ? () => handleAddOnDay(cell.date) : undefined
                }
                onDragOver={(e) => {
                  if (!droppable) {
                    return;
                  }
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverKey !== cell.key) {
                    setDragOverKey(cell.key);
                  }
                }}
                onDragLeave={() => {
                  setDragOverKey((curr) =>
                    curr === cell.key ? null : curr
                  );
                }}
                onDrop={(e) => droppable && handleDrop(cell.key, e)}
              >
                <div className="day-number">{cell.date.getDate()}</div>
                <div className="day-posts">
                  {dayPosts.map((post) => {
                    const status = postStatus(post);
                    const overdue = status === 'overdue';
                    // Posts that are already (partly) posted or actively sending
                    // can't be rescheduled — locking the drag prevents moving a
                    // photo whose send has happened or is in flight.
                    const locked =
                      status === 'submitted' ||
                      status === 'partial' ||
                      status === 'imminent';
                    const flag =
                      status === 'submitted'
                        ? '✓ '
                        : status === 'overdue' || status === 'errored'
                          ? '⚠ '
                          : '';
                    return (
                      <div
                        key={post.id}
                        className={`post-chip post-chip--${status}${
                          locked ? ' post-chip--locked' : ''
                        }`}
                        draggable={!locked}
                        onDragStart={(e) => {
                          if (locked) {
                            e.preventDefault();
                            return;
                          }
                          draggingRef.current = true;
                          setPreview(null);
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData(DND_MIME, String(post.id));
                        }}
                        onDragEnd={() => {
                          draggingRef.current = false;
                        }}
                        onMouseEnter={(e) => showPreview(post, e)}
                        onMouseLeave={() => setPreview(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPost(post);
                        }}
                        title={
                          overdue
                            ? 'Missed — the server may have been down. Open to send now or reschedule.'
                            : `${POST_STATUS_LABEL[status]}${
                                post.caption ? ` — ${post.caption}` : ''
                              }`
                        }
                      >
                        <img className="chip-thumb" src={post.image_url} alt="" />
                        <span className="chip-time">
                          {flag}
                          {formatTime(parseISO(post.scheduled_at))}
                        </span>
                        <span className="chip-platforms">
                          {uniquePlatforms(post).map((p) => (
                            <PlatformBadge key={p} platform={p} />
                          ))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => goToMonth(-1)}
        >
          ‹ Prev
        </button>
        <h2 className="calendar-title">{rangeLabel}</h2>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => goToMonth(1)}
        >
          Next ›
        </button>
      </div>

      <div className="calendar-months">{months.map(renderMonth)}</div>

      {preview && (
        <div
          className="chip-preview"
          style={{ left: preview.left, top: preview.top }}
        >
          <img src={preview.post.image_url} alt="" />
          {preview.post.caption && (
            <div className="chip-preview-caption">{preview.post.caption}</div>
          )}
        </div>
      )}

      {updatePost.isError && (
        <div className="state-msg state-error">
          Reschedule failed: {updatePost.error.message}
        </div>
      )}
    </div>
  );
}
