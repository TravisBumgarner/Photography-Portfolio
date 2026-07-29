import { useState } from 'react';
import {
  useDeleteSubreddit,
  useImportSubreddits,
  useSaveSubreddit,
  useSubredditCategories,
  useSubreddits,
} from '../hooks/useSubreddits';
import type { SubredditRules } from '../api/types';

/** The `{token}`s a title template can use, for the help text. */
const TOKENS = [
  'title',
  'description',
  'location',
  'camera',
  'lens',
  'film_stock',
  'date_taken',
  'width',
  'height',
  'dimensions',
];

/**
 * Edit the per-subreddit posting rules.
 *
 * These exist because subreddit moderators enforce requirements the API won't
 * tell you about — a title format, a required flair, how often you may post.
 * The seeded values are a starting point flagged UNVERIFIED; this is where they
 * get corrected once each sub's own rules have been read.
 */
export function SubredditRulesPanel({ onClose }: { onClose: () => void }) {
  const { data: subs, isLoading } = useSubreddits();
  const { data: categories } = useSubredditCategories();
  const save = useSaveSubreddit();
  const remove = useDeleteSubreddit();
  const importSeed = useImportSubreddits();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  // Local edits per sub, so typing doesn't fire a request per keystroke.
  const [drafts, setDrafts] = useState<Record<string, Partial<SubredditRules>>>(
    {}
  );

  const draftFor = (sub: SubredditRules): SubredditRules => ({
    ...sub,
    ...(drafts[sub.name] ?? {}),
  });

  const setDraft = (name: string, patch: Partial<SubredditRules>) => {
    setDrafts((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }));
  };

  const isDirty = (name: string) =>
    Object.keys(drafts[name] ?? {}).length > 0;

  const saveSub = (sub: SubredditRules) => {
    const patch = drafts[sub.name];
    if (!patch) {
      return;
    }
    save.mutate(
      { name: sub.name, input: patch },
      {
        onSuccess: () =>
          setDrafts((prev) => {
            const next = { ...prev };
            delete next[sub.name];
            return next;
          }),
      }
    );
  };

  const addSub = () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    save.mutate(
      { name, input: { title_template: '{title}' } },
      { onSuccess: () => setNewName('') }
    );
  };

  const toggleCategory = (sub: SubredditRules, category: string) => {
    const current = draftFor(sub).categories;
    setDraft(sub.name, {
      categories: current.includes(category)
        ? current.filter((c) => c !== category)
        : [...current, category],
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal modal--accounts"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Subreddit rules"
      >
        <div className="modal-header">
          <h2>Subreddits</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="form subreddit-panel">
          <p className="muted form-hint">
            Each subreddit enforces its own rules. A title template fills in from
            the photo's metadata using{' '}
            {TOKENS.map((t, i) => (
              <span key={t}>
                {i > 0 && ' '}
                <code>{`{${t}}`}</code>
              </span>
            ))}
            . A bracket group whose tokens are all empty is dropped, so{' '}
            <code>{'{title} ({camera}, {film_stock})'}</code> works for film and
            digital alike.
          </p>

          {isLoading && <span className="muted">Loading…</span>}

          <div className="subreddit-list">
            {subs?.map((sub) => {
              const draft = draftFor(sub);
              const open = expanded === sub.name;
              const unverified = sub.notes.startsWith('UNVERIFIED');
              return (
                <div key={sub.name} className="subreddit-row">
                  <div className="subreddit-row-head">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setExpanded(open ? null : sub.name)}
                      aria-expanded={open}
                    >
                      {open ? '▾' : '▸'} r/{sub.name}
                    </button>
                    <span className="muted">
                      {draft.categories.join(', ') || 'no categories'}
                      {unverified && ' · ⚠ unverified'}
                    </span>
                    {isDirty(sub.name) && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={save.isPending}
                        onClick={() => saveSub(sub)}
                      >
                        Save
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={remove.isPending}
                      onClick={() => {
                        if (window.confirm(`Remove rules for r/${sub.name}?`)) {
                          remove.mutate(sub.name);
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  {open && (
                    <div className="subreddit-row-body">
                      <label className="field">
                        <span className="field-label">Title template</span>
                        <input
                          type="text"
                          value={draft.title_template}
                          placeholder="{title}, {location}"
                          onChange={(e) =>
                            setDraft(sub.name, { title_template: e.target.value })
                          }
                        />
                      </label>

                      <div className="field">
                        <span className="field-label">Categories</span>
                        <div className="reddit-category-chips">
                          {categories?.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              className={
                                draft.categories.includes(category.name)
                                  ? 'chip chip--on'
                                  : 'chip'
                              }
                              onClick={() => toggleCategory(sub, category.name)}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="subreddit-fields">
                        <label className="field">
                          <span className="field-label">Max title length</span>
                          <input
                            type="number"
                            min={1}
                            max={300}
                            value={draft.max_title_length}
                            onChange={(e) =>
                              setDraft(sub.name, {
                                max_title_length: Number(e.target.value),
                              })
                            }
                          />
                        </label>
                        <label className="field">
                          <span className="field-label">
                            Stagger (min)
                            <span className="muted"> gap after previous</span>
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={draft.stagger_minutes}
                            onChange={(e) =>
                              setDraft(sub.name, {
                                stagger_minutes: Number(e.target.value),
                              })
                            }
                          />
                        </label>
                        <label className="field">
                          <span className="field-label">
                            Min interval (days)
                            <span className="muted"> 0 = no limit</span>
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={draft.min_interval_days}
                            onChange={(e) =>
                              setDraft(sub.name, {
                                min_interval_days: Number(e.target.value),
                              })
                            }
                          />
                        </label>
                      </div>

                      <label className="field">
                        <span className="field-label">
                          Flair id
                          <span className="muted">
                            {' '}
                            required by some subs; find it in the sub's flair list
                          </span>
                        </span>
                        <input
                          type="text"
                          value={draft.flair_id ?? ''}
                          onChange={(e) =>
                            setDraft(sub.name, {
                              flair_id: e.target.value || null,
                            })
                          }
                        />
                      </label>

                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={draft.requires_flair}
                          onChange={(e) =>
                            setDraft(sub.name, {
                              requires_flair: e.target.checked,
                            })
                          }
                        />
                        <span>
                          Requires a flair — refuse to publish without one
                        </span>
                      </label>

                      <label className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={draft.comment_body}
                          onChange={(e) =>
                            setDraft(sub.name, {
                              comment_body: e.target.checked,
                            })
                          }
                        />
                        <span>
                          Post the description as a first comment (an image
                          submission can't carry body text)
                        </span>
                      </label>

                      <label className="field">
                        <span className="field-label">Notes</span>
                        <textarea
                          rows={2}
                          value={draft.notes}
                          placeholder="What this sub's rules actually are, once checked."
                          onChange={(e) =>
                            setDraft(sub.name, { notes: e.target.value })
                          }
                        />
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="settings-add-time">
            <input
              type="text"
              value={newName}
              placeholder="Add a subreddit (r/name or a URL)"
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={save.isPending || !newName.trim()}
              onClick={addSub}
            >
              Add
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={importSeed.isPending}
              title="Add anything in config/subreddits.json that isn't here yet. Never overwrites your edits."
              onClick={() => importSeed.mutate()}
            >
              {importSeed.isPending ? 'Importing…' : 'Import from config'}
            </button>
          </div>

          <div className="form-error-slot">
            {save.isError && (
              <span className="state-error">{save.error.message}</span>
            )}
            {remove.isError && (
              <span className="state-error">{remove.error.message}</span>
            )}
            {importSeed.data && (
              <span className="muted">
                Added {importSeed.data.added.subreddits} subreddit(s) and{' '}
                {importSeed.data.added.categories} category(ies).
              </span>
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
