import type { Post, TargetStatus } from '../api/types';
import { parseISO } from './datetime';

/**
 * The publisher runs roughly once a minute, so a post is normally a little
 * late before it's actually sent. We only treat it as "missed" once it's this
 * far past its scheduled time — comfortably longer than the publish interval —
 * to avoid flashing a warning during the normal up-to-a-minute lag.
 */
const OVERDUE_GRACE_MS = 2 * 60 * 1000;

/**
 * A post is overdue/missed if its scheduled time passed more than the grace
 * period ago and at least one target is still waiting to be sent.
 */
export function isOverdue(post: Post): boolean {
  return (
    parseISO(post.scheduled_at).getTime() < Date.now() - OVERDUE_GRACE_MS &&
    post.targets.some((t) => t.status === 'scheduled')
  );
}

/**
 * A post is "pending" while any target still awaits sending. Pending posts
 * live in the Queue (including overdue and just-"send now"ed ones); once every
 * target is sent/errored the post is resolved and moves to History. This is
 * status-based, not time-based, so a post never vanishes just because its
 * scheduled time slipped into the past.
 */
export function isPending(post: Post): boolean {
  return post.targets.some((t) => t.status === 'scheduled');
}

/** Rolled-up status for a whole post (photo), derived from its per-account targets. */
export type PostStatus =
  | 'scheduled'
  | 'imminent'
  | 'overdue'
  | 'submitted'
  | 'partial'
  | 'errored';

export const POST_STATUS_LABEL: Record<PostStatus, string> = {
  scheduled: 'Queued',
  imminent: 'Sending…',
  overdue: 'Missed',
  submitted: 'Posted',
  partial: 'Partly posted',
  errored: 'Errored',
};

/**
 * Sort rank for the rolled-up status, in lifecycle order: queued → posting →
 * missed → partly → posted → errored. Used as the default ordering and when the
 * Status column is sorted.
 */
export const POST_STATUS_RANK: Record<PostStatus, number> = {
  scheduled: 0,
  imminent: 1,
  overdue: 2,
  partial: 3,
  submitted: 4,
  errored: 5,
};

/**
 * Collapse a post's per-account target statuses into one photo-level status.
 * Errors win (most important to surface), then all-sent, then mixed; otherwise
 * it's still waiting — "imminent" once its time has arrived (the publisher
 * sends within ~a minute), then "overdue" if it slips past the grace window.
 */
export function postStatus(post: Post): PostStatus {
  const statuses = post.targets.map((t) => t.status);
  if (statuses.some((s) => s === 'failed')) {
    return 'errored';
  }
  if (statuses.length > 0 && statuses.every((s) => s === 'posted')) {
    return 'submitted';
  }
  if (statuses.some((s) => s === 'posted')) {
    return 'partial';
  }
  const due = parseISO(post.scheduled_at).getTime() <= Date.now();
  if (!due) {
    return 'scheduled';
  }
  return isOverdue(post) ? 'overdue' : 'imminent';
}

/**
 * Per-account (photo×account) status — the unit shown as one row in Activity.
 * Unlike postStatus there's no "partly": a single target is exactly one state.
 */
export type RowStatus = 'queued' | 'sending' | 'missed' | 'posted' | 'errored';

export const ROW_STATUS_LABEL: Record<RowStatus, string> = {
  queued: 'Queued',
  sending: 'Sending…',
  missed: 'Missed',
  posted: 'Posted',
  errored: 'Errored',
};

/** Lifecycle order for the default sort and the Status column sort. */
export const ROW_STATUS_RANK: Record<RowStatus, number> = {
  queued: 0,
  sending: 1,
  missed: 2,
  errored: 3,
  posted: 4,
};

/** Derive a record's status from its raw target status + the post's time. */
export function rowStatus(scheduledAt: string, status: TargetStatus): RowStatus {
  if (status === 'posted') return 'posted';
  if (status === 'failed') return 'errored';
  const when = parseISO(scheduledAt).getTime();
  const now = Date.now();
  if (when > now) return 'queued';
  return now - when > OVERDUE_GRACE_MS ? 'missed' : 'sending';
}

/**
 * Which actions a record allows, by status. "Sending" and "Posted" are locked:
 * you can't edit/send/delete something in flight or already public.
 */
export function rowActions(status: RowStatus): {
  canEdit: boolean;
  canSend: boolean;
  isRetry: boolean;
  canDelete: boolean;
} {
  const open = status === 'queued' || status === 'missed' || status === 'errored';
  return {
    canEdit: open,
    canSend: open,
    isRetry: status === 'errored',
    canDelete: open,
  };
}
