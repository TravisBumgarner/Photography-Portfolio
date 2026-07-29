import type { Platform, TagPill, TagPool } from '../api/types';

// Mirrors of the backend caption rules (scripts/tagging.py).
const IG_HASHTAG_CAP = 5;
const IG_MENTION_CAP = 3;
const BSKY_CHAR_LIMIT = 300;

/** Join a caption prefix with a tag line, dropping either if empty. */
function captionText(prefix: string, tagTexts: string[]): string {
  return [prefix, tagTexts.join(' ')].filter(Boolean).join('\n');
}

/**
 * Ensure a pool has an explicit selection. Pools tagged before `selected`
 * existed have no boolean flags at all — for those, apply the default posting
 * set (select everything, then let the caps trim to the top-N). Pools the user
 * has touched (any boolean flag present) are returned unchanged.
 */
export function withSelection(platform: Platform, pool: TagPool): TagPool {
  if (pool.tags.some((t) => typeof t.selected === 'boolean')) {
    return pool;
  }
  return {
    ...pool,
    tags: enforceCaps(
      platform,
      pool.prefix,
      pool.tags.map((t) => ({ ...t, selected: true }))
    ),
  };
}

/** The caption for a platform from the pool's currently-selected tags, in order. */
export function captionFromPool(platform: Platform, pool: TagPool): string {
  void platform;
  const line = pool.tags.filter((t) => t.selected).map((t) => t.text);
  return captionText(pool.prefix, line);
}

/**
 * Enforce the platform caps by DESELECTING overflow only — never selects
 * anything. So removing a tag from the posting set leaves a smaller set (no
 * auto-promotion); promoting one past the cap bumps the last of that type.
 * Returns a new tags array.
 */
export function enforceCaps(
  platform: Platform,
  prefix: string,
  tags: TagPill[]
): TagPill[] {
  const out = tags.map((t) => ({ ...t }));
  if (platform === 'instagram') {
    let hashtags = 0;
    let mentions = 0;
    for (const tag of out) {
      if (!tag.selected) {
        continue;
      }
      if (tag.text.startsWith('#')) {
        if (hashtags >= IG_HASHTAG_CAP) {
          tag.selected = false;
        } else {
          hashtags += 1;
        }
      } else if (tag.text.startsWith('@')) {
        if (mentions >= IG_MENTION_CAP) {
          tag.selected = false;
        } else {
          mentions += 1;
        }
      }
    }
  } else {
    const fits = () =>
      captionText(
        prefix,
        out.filter((t) => t.selected).map((t) => t.text)
      ).length <= BSKY_CHAR_LIMIT;
    for (let i = out.length - 1; i >= 0 && !fits(); i--) {
      if (out[i].selected) {
        out[i].selected = false;
      }
    }
  }
  return out;
}
