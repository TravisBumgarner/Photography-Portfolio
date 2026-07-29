import { useEffect, useMemo, useState } from 'react';
import { usePosts, useSendTargetNow, useDeleteTarget } from '../hooks/usePosts';
import { useAccounts } from '../hooks/useAccounts';
import type { Post, Target } from '../api/types';
import { PlatformBadge } from './Badges';
import {
  ROW_STATUS_LABEL,
  ROW_STATUS_RANK,
  rowActions,
  rowStatus,
  type RowStatus,
} from '../utils/posts';
import { formatDateTime, parseISO } from '../utils/datetime';

interface ActivityViewProps {
  onEditPost: (post: Post) => void;
}

/** One table row: a single photo×account record. */
interface Row {
  post: Post;
  target: Target;
  status: RowStatus;
}

type SortKey = 'caption' | 'scheduled' | 'account' | 'status';
type SortDir = 'asc' | 'desc';

const COMPARATORS: Record<SortKey, (a: Row, b: Row) => number> = {
  caption: (a, b) => a.post.caption.localeCompare(b.post.caption),
  scheduled: (a, b) => a.post.scheduled_at.localeCompare(b.post.scheduled_at),
  account: (a, b) => a.target.username.localeCompare(b.target.username),
  status: (a, b) => ROW_STATUS_RANK[a.status] - ROW_STATUS_RANK[b.status],
};

const ALL_STATUSES: RowStatus[] = [
  'queued',
  'sending',
  'missed',
  'errored',
  'posted',
];

function truncate(text: string, max = 80): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

/**
 * Activity: one row per photo×account record (queued / sending / missed /
 * posted / errored), filterable by account and status, sortable by column.
 * Actions are gated by each record's status.
 */
export function ActivityView({ onEditPost }: ActivityViewProps) {
  const { data: posts, isLoading, isError, error } = usePosts();
  const { data: accounts } = useAccounts();
  const sendTarget = useSendTargetNow();
  const deleteTarget = useDeleteTarget();

  const [accountFilter, setAccountFilter] = useState<'all' | number>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | RowStatus>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'status',
    dir: 'asc',
  });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const rows = useMemo<Row[]>(() => {
    const all = (posts ?? []).flatMap((post) =>
      post.targets.map((target) => ({
        post,
        target,
        status: rowStatus(post.scheduled_at, target.status),
      })),
    );
    const filtered = all.filter(
      (r) =>
        (accountFilter === 'all' || r.target.account_id === accountFilter) &&
        (statusFilter === 'all' || r.status === statusFilter),
    );
    const cmp = COMPARATORS[sort.key];
    const factor = sort.dir === 'asc' ? 1 : -1;
    return filtered.sort(
      (a, b) =>
        factor * cmp(a, b) ||
        a.post.scheduled_at.localeCompare(b.post.scheduled_at),
    );
  }, [posts, accountFilter, statusFilter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    );

  // Only rows whose status allows deletion are selectable.
  const deletableIds = useMemo(
    () => rows.filter((r) => rowActions(r.status).canDelete).map((r) => r.target.id),
    [rows],
  );

  // Drop selections that fall out of view (filters/sort) or become undeletable.
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const allowed = new Set(deletableIds);
      const next = new Set([...prev].filter((id) => allowed.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [deletableIds]);

  const allSelected =
    deletableIds.length > 0 && deletableIds.every((id) => selectedIds.has(id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const toggleRow = (id: number) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(deletableIds));

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Delete ${ids.length} record${ids.length === 1 ? '' : 's'}? This can't be undone.`,
      )
    ) {
      return;
    }
    setBulkError(null);
    setBulkDeleting(true);
    try {
      await Promise.all(ids.map((id) => deleteTarget.mutateAsync(id)));
      setSelectedIds(new Set());
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : 'Bulk delete failed.');
    } finally {
      setBulkDeleting(false);
    }
  };

  const sortableHeader = (key: SortKey, label: string) => (
    <th>
      <button type="button" className="th-sort" onClick={() => toggleSort(key)}>
        {label}
        {sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : ''}
      </button>
    </th>
  );

  if (isLoading) {
    return <div className="state-msg">Loading…</div>;
  }
  if (isError) {
    return (
      <div className="state-msg state-error">
        Failed to load posts: {error.message}
      </div>
    );
  }

  return (
    <div className="activity">
      <div className="activity-filters">
        <label className="filter">
          <span className="filter-label">Account</span>
          <select
            value={accountFilter === 'all' ? 'all' : String(accountFilter)}
            onChange={(e) =>
              setAccountFilter(
                e.target.value === 'all' ? 'all' : Number(e.target.value),
              )
            }
          >
            <option value="all">All accounts</option>
            {accounts?.map((a) => (
              <option key={a.id} value={a.id}>
                @{a.username} ({a.platform})
              </option>
            ))}
          </select>
        </label>

        <label className="filter">
          <span className="filter-label">Status</span>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'all' | RowStatus)
            }
          >
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ROW_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedIds.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            disabled={bulkDeleting}
            onClick={handleBulkDelete}
          >
            {bulkDeleting ? 'Deleting…' : `Delete ${selectedIds.size}`}
          </button>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="state-msg">No records match.</div>
      ) : (
        <table className="queue-table">
          <thead>
            <tr>
              <th className="queue-select">
                <input
                  type="checkbox"
                  aria-label="Select all deletable rows"
                  checked={allSelected}
                  disabled={deletableIds.length === 0}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                />
              </th>
              <th>Image</th>
              {sortableHeader('caption', 'Caption')}
              {sortableHeader('scheduled', 'Scheduled')}
              {sortableHeader('account', 'Account')}
              {sortableHeader('status', 'Status')}
              <th>Details</th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ post, target, status }) => {
              const actions = rowActions(status);
              return (
                <tr
                  key={target.id}
                  className={
                    status === 'errored' || status === 'missed'
                      ? 'queue-row--overdue'
                      : undefined
                  }
                >
                  <td className="queue-select">
                    {actions.canDelete && (
                      <input
                        type="checkbox"
                        aria-label={`Select @${target.username} record`}
                        checked={selectedIds.has(target.id)}
                        onChange={() => toggleRow(target.id)}
                      />
                    )}
                  </td>
                  <td>
                    <img className="queue-thumb" src={post.image_url} alt="" />
                  </td>
                  <td className="queue-caption">
                    {target.caption ? (
                      truncate(target.caption)
                    ) : (
                      <span className="muted">(no caption)</span>
                    )}
                  </td>
                  <td className="queue-when">
                    {formatDateTime(parseISO(post.scheduled_at))}
                  </td>
                  <td>
                    @{target.username}{' '}
                    <PlatformBadge platform={target.platform} />
                  </td>
                  <td>
                    <span className={`status-badge row-status-${status}`}>
                      {ROW_STATUS_LABEL[status]}
                    </span>
                  </td>
                  <td className="queue-caption">
                    {target.error ? (
                      <span className="state-error">{target.error}</span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="queue-actions">
                      {actions.canEdit && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => onEditPost(post)}
                        >
                          Edit
                        </button>
                      )}
                      {actions.canSend && (
                        <button
                          type="button"
                          className="btn btn-sm"
                          disabled={sendTarget.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `${actions.isRetry ? 'Retry' : 'Publish'} @${target.username} now?`,
                              )
                            ) {
                              sendTarget.mutate(target.id);
                            }
                          }}
                        >
                          {actions.isRetry ? 'Retry' : 'Send now'}
                        </button>
                      )}
                      {actions.canDelete && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          disabled={deleteTarget.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `Delete the @${target.username} record for this photo?`,
                              )
                            ) {
                              deleteTarget.mutate(target.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {sendTarget.isError && (
        <div className="state-msg state-error">
          Send failed: {sendTarget.error.message}
        </div>
      )}
      {deleteTarget.isError && !bulkDeleting && (
        <div className="state-msg state-error">
          Delete failed: {deleteTarget.error.message}
        </div>
      )}
      {bulkError && (
        <div className="state-msg state-error">
          Bulk delete failed: {bulkError}
        </div>
      )}
    </div>
  );
}
