import type { RedditSuggestions, SubredditRules } from '../api/types';

/** One chosen subreddit: its title, and an offset if the user overrode it. */
export interface RedditChoice {
  title: string;
  /** Minutes after the post's scheduled time. Undefined lets the server
   * assign the stagger from each sub's own rules. */
  delay_minutes?: number;
}

/** The Reddit selection for one photo, keyed by bare subreddit name. */
export type RedditSelection = Record<string, RedditChoice>;

/** Reddit's own hard cap on a submission title; a sub's own may be lower. */
export const REDDIT_TITLE_LIMIT = 300;

/** Look up a sub's rules by name, case-insensitively (Reddit names aren't
 * case-sensitive but display casing varies). */
export function findRules(
  name: string,
  subs: SubredditRules[] | undefined
): SubredditRules | undefined {
  return subs?.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

/** The effective title limit for a sub: its own, never above Reddit's. */
export function titleLimit(rules: SubredditRules | undefined): number {
  return Math.min(rules?.max_title_length ?? REDDIT_TITLE_LIMIT, REDDIT_TITLE_LIMIT);
}

/** The pre-rendered title for a sub, or '' when the photo has no suggestion. */
export function suggestedTitle(
  name: string,
  suggestions?: Partial<RedditSuggestions>
): string {
  const titles = suggestions?.titles ?? {};
  const exact = titles[name];
  if (exact !== undefined) {
    return exact;
  }
  // Titles are keyed by the sub's stored casing; be forgiving about it.
  const hit = Object.keys(titles).find(
    (key) => key.toLowerCase() === name.toLowerCase()
  );
  return hit ? titles[hit] : '';
}

/**
 * Whether every chosen sub has a usable title and flair.
 *
 * Mirrors the server's own validation so the submit button can't be clicked
 * into a 400 — and, in the bulk flow, so one bad photo doesn't reject the whole
 * all-or-nothing batch after the click.
 */
export function redditSelectionIsValid(
  value: RedditSelection,
  subs: SubredditRules[] | undefined
): boolean {
  return Object.entries(value).every(([name, choice]) => {
    const rules = findRules(name, subs);
    const flairOk = !rules?.requires_flair || Boolean(rules?.flair_id);
    return (
      choice.title.trim().length > 0 &&
      choice.title.length <= titleLimit(rules) &&
      flairOk
    );
  });
}
