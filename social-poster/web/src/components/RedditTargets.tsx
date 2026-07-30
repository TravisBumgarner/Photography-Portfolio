import { useMemo, useState } from 'react';
import { useSubredditCategories, useSubreddits } from '../hooks/useSubreddits';
import { addMinutesToApiISO, formatApiISOShort } from '../utils/datetime';
import { suggestedTitle, titleLimit, type RedditSelection } from '../utils/reddit';
import type { RedditSuggestions, SubredditRules } from '../api/types';

interface RedditTargetsProps {
  value: RedditSelection;
  onChange: (next: RedditSelection) => void;
  /** Subs proposed from the photo's keywords, with titles pre-rendered. */
  suggestions?: Partial<RedditSuggestions>;
  /** The post's scheduled time (API ISO), to show each sub's real send time. */
  scheduledAt?: string;
  /** Compact layout for the bulk-review grid. */
  compact?: boolean;
}

/**
 * Pick which subreddits a photo goes to, and edit each one's title.
 *
 * Subs differ enough that this can't be a single caption box: each has its own
 * title format, and posting one photo to several at the same moment is the spam
 * signature that gets it auto-removed. So the picker shows the per-sub title and
 * the staggered send time it will actually go out at.
 *
 * Category chips are the quick-select — "Mexico", "Film", "Nightscapes" — and
 * the ones matching this photo's own Lightroom keywords are marked as suggested.
 */
export function RedditTargets({
  value,
  onChange,
  suggestions,
  scheduledAt,
  compact = false,
}: RedditTargetsProps) {
  const { data: subs, isLoading } = useSubreddits();
  const { data: categories } = useSubredditCategories();
  const [showAll, setShowAll] = useState(false);

  const rulesByName = useMemo(() => {
    const map = new Map<string, SubredditRules>();
    for (const sub of subs ?? []) {
      map.set(sub.name.toLowerCase(), sub);
    }
    return map;
  }, [subs]);

  const suggestedCategories = new Set(
    (suggestions?.categories ?? []).map((c) => c.toLowerCase())
  );
  const suggestedSubs = suggestions?.subreddits ?? [];
  const chosen = Object.keys(value);

  const toggleSub = (name: string, on: boolean) => {
    const next = { ...value };
    if (on) {
      next[name] = next[name] ?? { title: suggestedTitle(name, suggestions) };
    } else {
      delete next[name];
    }
    onChange(next);
  };

  /** Category chip: selects every sub in it, or clears them if all are on. */
  const toggleCategory = (categoryName: string) => {
    const category = categories?.find((c) => c.name === categoryName);
    if (!category) {
      return;
    }
    const allOn = category.subreddits.every((name) => name in value);
    const next = { ...value };
    for (const name of category.subreddits) {
      if (allOn) {
        delete next[name];
      } else {
        next[name] = next[name] ?? { title: suggestedTitle(name, suggestions) };
      }
    }
    onChange(next);
  };

  const setTitle = (name: string, title: string) => {
    onChange({ ...value, [name]: { ...value[name], title } });
  };

  const setDelay = (name: string, raw: string) => {
    const parsed = raw === '' ? undefined : Math.max(0, Number(raw));
    onChange({
      ...value,
      [name]: {
        ...value[name],
        delay_minutes: Number.isNaN(parsed) ? undefined : parsed,
      },
    });
  };

  if (isLoading) {
    return <span className="muted">Loading subreddits…</span>;
  }
  if ((subs?.length ?? 0) === 0) {
    return (
      <span className="muted">
        No subreddits configured — add them in Settings first.
      </span>
    );
  }

  // Suggested subs first, then the rest behind a toggle so the common case is
  // a couple of clicks rather than scrolling a list of twenty.
  const visibleSubs = showAll
    ? (subs ?? []).map((s) => s.name)
    : Array.from(new Set([...suggestedSubs, ...chosen]));

  return (
    <div className={compact ? 'reddit-targets reddit-targets--compact' : 'reddit-targets'}>
      {(categories?.length ?? 0) > 0 && (
        <div className="reddit-category-chips">
          {categories?.map((category) => {
            const allOn =
              category.subreddits.length > 0 &&
              category.subreddits.every((name) => name in value);
            const isSuggested = suggestedCategories.has(
              category.name.toLowerCase()
            );
            return (
              <button
                key={category.id}
                type="button"
                className={[
                  'chip',
                  allOn ? 'chip--on' : '',
                  isSuggested ? 'chip--suggested' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => toggleCategory(category.name)}
                disabled={category.subreddits.length === 0}
                title={
                  category.subreddits.length === 0
                    ? 'No subreddits in this category yet'
                    : `${isSuggested ? 'Suggested for this photo. ' : ''}${category.subreddits.join(', ')}`
                }
              >
                {isSuggested && '★ '}
                {category.name}
                <span className="muted"> ({category.subreddits.length})</span>
              </button>
            );
          })}
        </div>
      )}

      {suggestions?.error && (
        <p className="muted field-help">
          No suggestions from this photo's metadata ({suggestions.error}) — pick
          subreddits by hand.
        </p>
      )}

      <div className="reddit-sub-list">
        {visibleSubs.length === 0 && (
          <span className="muted">
            No subreddits suggested for this photo — use a category chip or show
            all.
          </span>
        )}
        {visibleSubs.map((name) => {
          const rules = rulesByName.get(name.toLowerCase());
          const isOn = name in value;
          const choice = value[name];
          const limit = titleLimit(rules);
          const tooLong = isOn && choice.title.length > limit;
          const noTitle = isOn && choice.title.trim() === '';
          const needsFlair = Boolean(
            isOn && rules?.requires_flair && !rules?.flair_id
          );
          const dueAt =
            scheduledAt && isOn && choice.delay_minutes
              ? addMinutesToApiISO(scheduledAt, choice.delay_minutes)
              : scheduledAt;
          return (
            <div key={name} className={isOn ? 'reddit-sub reddit-sub--on' : 'reddit-sub'}>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={(e) => toggleSub(name, e.target.checked)}
                />
                <span>
                  r/{name}
                  {suggestedSubs.includes(name) && (
                    <span className="muted"> · suggested</span>
                  )}
                  {rules?.min_interval_days ? (
                    <span className="muted">
                      {' '}
                      · max 1 / {rules.min_interval_days}d
                    </span>
                  ) : null}
                </span>
              </label>

              {isOn && (
                <div className="reddit-sub-fields">
                  <label className="field">
                    <span className="field-label">
                      Title{' '}
                      <span className={tooLong ? 'field-error' : 'muted'}>
                        {choice.title.length}/{limit}
                      </span>
                    </span>
                    <input
                      type="text"
                      value={choice.title}
                      placeholder={
                        rules?.title_template
                          ? `Template: ${rules.title_template}`
                          : 'Submission title'
                      }
                      onChange={(e) => setTitle(name, e.target.value)}
                    />
                  </label>
                  <label className="field reddit-delay-field">
                    <span className="field-label">Offset (min)</span>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={choice.delay_minutes ?? ''}
                      placeholder="auto"
                      onChange={(e) => setDelay(name, e.target.value)}
                    />
                  </label>
                  {dueAt && (
                    <span className="muted reddit-due">
                      sends {formatApiISOShort(dueAt)}
                    </span>
                  )}
                  {noTitle && (
                    <span className="field-error">
                      r/{name} needs a title before this can be scheduled.
                    </span>
                  )}
                  {tooLong && (
                    <span className="field-error">
                      Too long for r/{name} — limit is {limit}.
                    </span>
                  )}
                  {needsFlair && (
                    <span className="field-error">
                      r/{name} requires a flair — set its flair id in Settings.
                    </span>
                  )}
                  {rules?.notes?.startsWith('UNVERIFIED') && (
                    <span className="muted reddit-note">
                      ⚠ Rules for r/{name} are unverified — check the sub before
                      posting.
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="reddit-targets-footer">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? 'Show suggested only' : `Show all ${subs?.length ?? 0}`}
        </button>
        {chosen.length > 1 && (
          <span className="muted">
            {chosen.length} subreddits, staggered so they don't post at once.
          </span>
        )}
        {chosen.length > 0 && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onChange({})}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
