import type { Platform, Post, Target, TargetStatus } from '../api/types';
import { POST_STATUS_LABEL, postStatus } from '../utils/posts';

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'IG',
  bluesky: 'BS',
  reddit: 'RD',
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  return (
    <span className={`platform-badge platform-${platform}`} title={platform}>
      {PLATFORM_LABEL[platform]}
    </span>
  );
}

// Per-account status. Internal DB values stay 'scheduled'/'posted'/'failed';
// these are the user-facing labels.
const STATUS_LABEL: Record<TargetStatus, string> = {
  scheduled: 'Queued',
  posted: 'Posted',
  failed: 'Errored',
};

/** A single status pill for one account's send result. */
export function StatusPill({ status }: { status: TargetStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/** One destination row: where it goes + platform, with its status as a pill.
 * A Reddit destination is named by its subreddit, not the account — several
 * share one account and the sub is what distinguishes them. */
export function AccountTarget({ target }: { target: Target }) {
  return (
    <div className="account-target">
      <span className="account-target-name">
        {target.subreddit ? `r/${target.subreddit}` : `@${target.username}`}{' '}
        <PlatformBadge platform={target.platform} />
        {target.delay_minutes > 0 && (
          <span className="muted" title="Staggered so the subs don't post at once">
            {' '}
            +{target.delay_minutes}m
          </span>
        )}
      </span>
      <span
        title={
          target.status === 'failed' && target.error
            ? target.error
            : undefined
        }
      >
        <StatusPill status={target.status} />
      </span>
    </div>
  );
}

/** Rolled-up status for the whole photo. */
export function PostStatusBadge({ post }: { post: Post }) {
  const status = postStatus(post);
  return (
    <span className={`status-badge post-status-${status}`}>
      {POST_STATUS_LABEL[status]}
    </span>
  );
}
