import { useEffect, useMemo, useRef, useState } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import {
  useApproveIngest,
  useCropIngestImage,
  useDeleteIngestItem,
  useIngestItems,
  useUpdateIngestItem,
  useUploadIngestImages,
} from '../hooks/useIngest';
import { usePosts } from '../hooks/usePosts';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import { WeeklyScheduleModal } from './WeeklyScheduleModal';
import { TagPillEditor } from './TagPillEditor';
import { ImageCropModal } from './ImageCropModal';
import {
  dateToDatetimeLocal,
  formatDateTime,
  formatHHMM,
  toApiISO,
} from '../utils/datetime';
import { DAY_SHORT, generateSlots, timesByDay } from '../utils/schedule';
import { captionFromPool, withSelection } from '../utils/tags';
import type {
  BulkSchedule,
  Captions,
  IngestItem,
  Platform,
  TagPool,
  TagPools,
} from '../api/types';

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  bluesky: 'Bluesky',
};

const ALL_PLATFORMS: Platform[] = ['instagram', 'bluesky'];

// Remembers the last-checked target accounts across sessions.
const ACCOUNTS_STORAGE_KEY = 'social-poster:bulk-account-ids';

function loadSavedAccountIds(): number[] | null {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(ACCOUNTS_STORAGE_KEY) ?? ''
    );
    return Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every((x) => typeof x === 'number')
      ? parsed
      : null;
  } catch {
    return null;
  }
}

function saveAccountIds(ids: number[]) {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage full/unavailable — remembering the selection is best-effort.
  }
}

/**
 * Bulk ingestion: pick a weekly schedule template and target accounts, drop a
 * batch of photos, review the captions the tagging script generated (photos
 * are matched to the next free slots in upload order), then approve to
 * schedule everything at once.
 */
export function BulkAddModal({ onClose }: { onClose: () => void }) {
  const { data: accounts } = useAccounts();
  const { data: settings } = useSettings();
  const { data: posts } = usePosts();
  const { data: items = [], isLoading: itemsLoading } = useIngestItems();
  const updateSettings = useUpdateSettings();
  const upload = useUploadIngestImages();
  const updateItem = useUpdateIngestItem();
  const deleteItem = useDeleteIngestItem();
  const cropImage = useCropIngestImage();
  const approve = useApproveIngest();

  // Schedule template — seeded from the saved setting once it loads, then
  // edited locally and persisted on every change.
  const [schedule, setSchedule] = useState<BulkSchedule | null>(null);
  useEffect(() => {
    if (schedule === null && settings) {
      setSchedule(settings.bulk_schedule);
    }
  }, [settings, schedule]);
  const effectiveSchedule = useMemo(
    () => schedule ?? { slots: [] },
    [schedule]
  );

  const saveSchedule = (next: BulkSchedule) => {
    setSchedule(next);
    updateSettings.mutate({ bulk_schedule: next });
  };

  const [showSchedule, setShowSchedule] = useState(false);
  const [showIgPreview, setShowIgPreview] = useState(false);
  // The item whose Instagram crop the user is editing (null = cropper closed).
  const [cropItemId, setCropItemId] = useState<number | null>(null);
  // The item whose framing preview is open in a centered modal (null = closed).
  const [previewItemId, setPreviewItemId] = useState<number | null>(null);

  // Where slot-filling starts. 'now' = next free slot from now; 'afterLast' =
  // append strictly after the current queue's last post; 'custom' = a picked
  // datetime. Occupied slots are always skipped regardless of mode.
  const [startMode, setStartMode] = useState<'now' | 'afterLast' | 'custom'>(
    'now'
  );
  const [customStart, setCustomStart] = useState('');

  // Target accounts — the last-used selection (localStorage), else all.
  const [accountIds, setAccountIds] = useState<number[] | null>(null);
  useEffect(() => {
    if (accountIds === null && accounts) {
      const saved = loadSavedAccountIds()?.filter((id) =>
        accounts.some((a) => a.id === id)
      );
      setAccountIds(
        saved && saved.length > 0 ? saved : accounts.map((a) => a.id)
      );
    }
  }, [accounts, accountIds]);
  const selectedIds = useMemo(() => accountIds ?? [], [accountIds]);

  const toggleAccount = (id: number) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setAccountIds(next);
    saveAccountIds(next);
  };

  const selectedPlatforms = useMemo(() => {
    const set = new Set<Platform>();
    for (const id of selectedIds) {
      const account = accounts?.find((a) => a.id === id);
      if (account) {
        set.add(account.platform);
      }
    }
    return ALL_PLATFORMS.filter((p) => set.has(p));
  }, [selectedIds, accounts]);

  // Free-text caption edits keyed by `${itemId}:${platform}` — the fallback for
  // items/platforms that have no structured tag pool (e.g. tagging failed).
  const [edits, setEdits] = useState<Record<string, string>>({});
  // Per-item tag pools the user has reordered / whose prefix they've edited;
  // falls back to the server's pools until then.
  const [poolEdits, setPoolEdits] = useState<Record<number, TagPools>>({});

  const poolsForItem = (item: IngestItem): TagPools =>
    poolEdits[item.id] ?? item.tag_pools ?? {};
  const poolFor = (item: IngestItem, platform: Platform) => {
    const pool = poolsForItem(item)[platform];
    return pool ? withSelection(platform, pool) : undefined;
  };

  // A platform's caption comes from its pool (prefix + active tags) when one
  // exists, else the free-text edit / server caption.
  const captionValue = (item: IngestItem, platform: Platform) => {
    const pool = poolFor(item, platform);
    if (pool) {
      return captionFromPool(platform, pool);
    }
    return edits[`${item.id}:${platform}`] ?? item.captions[platform] ?? '';
  };

  const captionsFrom = (item: IngestItem, pools: TagPools): Captions => {
    const captions: Captions = {};
    for (const platform of selectedPlatforms) {
      const pool = pools[platform];
      captions[platform] = pool
        ? captionFromPool(platform, withSelection(platform, pool))
        : edits[`${item.id}:${platform}`] ?? item.captions[platform] ?? '';
    }
    return captions;
  };

  const captionsFor = (item: IngestItem): Captions =>
    captionsFrom(item, poolsForItem(item));

  // Persist the current captions (+ pools) so a closed modal keeps review work.
  const commit = (item: IngestItem, pools: TagPools) => {
    updateItem.mutate({
      id: item.id,
      captions: { ...item.captions, ...captionsFrom(item, pools) },
      tagPools: { ...item.tag_pools, ...pools },
    });
  };
  const persistCaption = (item: IngestItem) => commit(item, poolsForItem(item));

  // Prefix keystrokes update local state only (persist on blur); a pill reorder
  // is a discrete action, so it updates state and persists immediately.
  const setPoolLocal = (item: IngestItem, platform: Platform, next: TagPool) =>
    setPoolEdits((prev) => ({
      ...prev,
      [item.id]: { ...poolsForItem(item), [platform]: next },
    }));
  const reorderPool = (item: IngestItem, platform: Platform, next: TagPool) => {
    const pools = { ...poolsForItem(item), [platform]: next };
    setPoolEdits((prev) => ({ ...prev, [item.id]: pools }));
    commit(item, pools);
  };

  const fileInput = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const onFilesChosen = (files: FileList | null) => {
    const images = Array.from(files ?? []).filter(
      (f) => f.type.startsWith('image/') || /\.avif$/i.test(f.name)
    );
    if (images.length > 0) {
      upload.mutate(images);
    }
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  // Display order — null means upload order. Shuffling reorders which photo
  // lands in which slot; new uploads append and deleted items drop out.
  const [order, setOrder] = useState<number[] | null>(null);
  const orderedItems = useMemo(() => {
    if (order === null) {
      return items;
    }
    const byId = new Map(items.map((item) => [item.id, item]));
    const known = order.flatMap((id) => byId.get(id) ?? []);
    const inOrder = new Set(order);
    return [...known, ...items.filter((item) => !inOrder.has(item.id))];
  }, [items, order]);

  const shuffleOrder = () => {
    const ids = orderedItems.map((item) => item.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    setOrder(ids);
  };

  // Slot assignment: photos fill the next free slots in display order.
  // Occupied = already-scheduled posts, so bulk batches never double-book.
  const occupied = useMemo(
    () => new Set((posts ?? []).map((p) => p.scheduled_at)),
    [posts]
  );
  // The furthest-out scheduled post — where the current queue ends, so it's
  // clear when this batch will start landing. ISO strings sort lexically.
  const lastScheduledAt = useMemo(() => {
    const times = (posts ?? []).map((p) => p.scheduled_at).sort();
    return times.length > 0 ? times[times.length - 1] : null;
  }, [posts]);
  // Resolve the start-date toggle into the Date slot-filling begins after.
  // Computed inside the slots memo so `now` is only sampled when deps change.
  // Always clamped to now so a last-post/custom time in the past never
  // schedules into the past.
  const slots = useMemo(() => {
    const now = new Date();
    let from = now;
    if (startMode === 'afterLast' && lastScheduledAt) {
      from = new Date(lastScheduledAt);
    } else if (startMode === 'custom' && customStart) {
      from = new Date(customStart);
    }
    if (from.getTime() < now.getTime()) {
      from = now;
    }
    return generateSlots(effectiveSchedule, items.length, occupied, from);
  }, [
    effectiveSchedule,
    items.length,
    occupied,
    startMode,
    customStart,
    lastScheduledAt,
  ]);

  // When the last photo in this batch posts — i.e. when the queue runs dry.
  // Only meaningful once every photo has a slot.
  const queueEmptiesAt = useMemo(
    () =>
      items.length > 0 && slots.length === items.length
        ? slots[slots.length - 1]
        : null,
    [items.length, slots]
  );

  const igSelected = selectedPlatforms.includes('instagram');
  // Items that would fail Instagram's aspect rule until cropped. Only matters
  // when an Instagram account is targeted.
  const uncroppedItems = useMemo(
    () => (igSelected ? items.filter((i) => i.needs_ig_crop) : []),
    [igSelected, items]
  );

  const anyPending = items.some((i) => i.tag_status === 'pending');
  const scheduleEmpty = effectiveSchedule.slots.length === 0;
  const scheduleByDay = useMemo(
    () => timesByDay(effectiveSchedule),
    [effectiveSchedule]
  );
  const canApprove =
    items.length > 0 &&
    selectedIds.length > 0 &&
    slots.length === items.length &&
    !anyPending &&
    uncroppedItems.length === 0 &&
    !approve.isPending;

  const onApprove = () => {
    approve.mutate(
      {
        account_ids: selectedIds,
        items: orderedItems.map((item, index) => ({
          id: item.id,
          scheduled_at: toApiISO(slots[index]),
          captions: captionsFor(item),
        })),
      },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <>
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal modal--bulk"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Bulk add posts"
      >
        <div className="modal-header">
          <h2>Bulk add posts</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="bulk-body">
          {/* LEFT: schedule template + accounts + upload */}
          <div className="bulk-config">
            <div className="field">
              <span className="field-label">Last scheduled post</span>
              {lastScheduledAt ? (
                <span>{formatDateTime(new Date(lastScheduledAt))}</span>
              ) : (
                <span className="muted">No posts scheduled yet</span>
              )}
            </div>

            <div className="field">
              <span className="field-label">Start filling from</span>
              <div className="seg">
                <button
                  type="button"
                  className={`seg-btn ${startMode === 'now' ? 'seg-btn--active' : ''}`}
                  onClick={() => setStartMode('now')}
                >
                  Now
                </button>
                <button
                  type="button"
                  className={`seg-btn ${startMode === 'afterLast' ? 'seg-btn--active' : ''}`}
                  onClick={() => setStartMode('afterLast')}
                  disabled={!lastScheduledAt}
                  title={
                    lastScheduledAt
                      ? undefined
                      : 'No scheduled posts to start after'
                  }
                >
                  After last post
                </button>
                <button
                  type="button"
                  className={`seg-btn ${startMode === 'custom' ? 'seg-btn--active' : ''}`}
                  onClick={() => {
                    if (!customStart) {
                      setCustomStart(dateToDatetimeLocal(new Date()));
                    }
                    setStartMode('custom');
                  }}
                >
                  Custom
                </button>
              </div>
              {startMode === 'custom' && (
                <input
                  type="datetime-local"
                  value={customStart}
                  min={dateToDatetimeLocal(new Date())}
                  onChange={(e) => setCustomStart(e.target.value)}
                />
              )}
              <span className="muted field-help">
                Occupied slots are always skipped, so nothing double-books.
                Start is clamped to now — nothing schedules in the past.
              </span>
            </div>

            <div className="field">
              <span className="field-label">Queue empties</span>
              {queueEmptiesAt ? (
                <span>{formatDateTime(queueEmptiesAt)}</span>
              ) : (
                <span className="muted">
                  {items.length === 0
                    ? 'Drop photos to see when the queue runs dry'
                    : 'Set the schedule to fill every photo'}
                </span>
              )}
            </div>

            <div className="field">
              <div className="field-label-row">
                <span className="field-label">Weekly schedule</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setShowSchedule(true)}
                >
                  Edit
                </button>
              </div>
              {scheduleEmpty ? (
                <span className="muted">
                  No posting times yet — click Edit to set up the weekly
                  schedule.
                </span>
              ) : (
                <div className="schedule-summary">
                  {[...scheduleByDay.entries()]
                    .sort(([a], [b]) => a - b)
                    .map(([day, times]) => (
                      <div key={day} className="schedule-summary-row">
                        <span className="schedule-summary-day">
                          {DAY_SHORT[day]}
                        </span>
                        <span>{times.map(formatHHMM).join(', ')}</span>
                      </div>
                    ))}
                </div>
              )}
              {!scheduleEmpty && (
                <span className="muted field-help">
                  Photos fill these slots in order, week after week.
                </span>
              )}
            </div>

            <div className="field">
              <span className="field-label">Accounts</span>
              <div className="checkbox-list">
                {accounts?.map((account) => (
                  <label key={account.id} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(account.id)}
                      onChange={() => toggleAccount(account.id)}
                    />
                    <span>
                      {account.username}{' '}
                      <span className="muted">({account.platform})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: photo drop target + review list. The whole column
              accepts drops; click-to-browse is the empty state and the
              "add more" strip so clicks never fight the caption fields. */}
          <div
            className={`bulk-review ${dragOver ? 'bulk-review--dragover' : ''}`}
            onDragOver={(e) => {
              // Only react to file drags — not pill reordering inside a photo.
              if (!e.dataTransfer.types.includes('Files')) {
                return;
              }
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOver(false);
              }
            }}
            onDrop={(e) => {
              if (!e.dataTransfer.types.includes('Files')) {
                return;
              }
              e.preventDefault();
              setDragOver(false);
              onFilesChosen(e.dataTransfer.files);
            }}
          >
            <input
              ref={fileInput}
              type="file"
              accept="image/*,.avif"
              multiple
              hidden
              onChange={(e) => onFilesChosen(e.target.files)}
            />
            {itemsLoading && <span className="muted">Loading…</span>}
            {!itemsLoading && items.length === 0 && (
              <div
                className="bulk-dropzone bulk-dropzone--fill"
                role="button"
                tabIndex={0}
                onClick={() => fileInput.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInput.current?.click();
                  }
                }}
              >
                {upload.isPending
                  ? 'Uploading…'
                  : 'Drop photos here, or click to browse'}
              </div>
            )}
            {items.length > 0 && (
              <div className="bulk-review-toolbar">
                {items.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={shuffleOrder}
                  >
                    🔀 Shuffle order
                  </button>
                )}
                {selectedPlatforms.includes('instagram') && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowIgPreview(true)}
                  >
                    📷 Instagram preview
                  </button>
                )}
              </div>
            )}
            {orderedItems.map((item, index) => (
              <div key={item.id} className="bulk-item">
                <div className="bulk-item-aside">
                  <img
                    className="bulk-item-thumb"
                    src={item.ig_image_url ?? item.image_url}
                    alt=""
                    role="button"
                    tabIndex={0}
                    title="Click to preview framing"
                    onClick={() => setPreviewItemId(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setPreviewItemId(item.id);
                      }
                    }}
                  />
                  {igSelected &&
                    (item.needs_ig_crop ? (
                      <button
                        type="button"
                        className="crop-warn"
                        onClick={() => setCropItemId(item.id)}
                      >
                        <span className="crop-warn-title">
                          ⚠ Crop for Instagram
                        </span>
                        <span className="crop-warn-sub">
                          Too tall/wide — click to crop
                        </span>
                      </button>
                    ) : item.ig_image_url ? (
                      <button
                        type="button"
                        className="crop-done"
                        onClick={() => setCropItemId(item.id)}
                        title="Re-crop the Instagram image"
                      >
                        ✓ Cropped · re-crop
                      </button>
                    ) : null)}
                </div>
                <div className="bulk-item-main">
                  <div className="bulk-item-header">
                    <span className="bulk-item-slot">
                      {slots[index]
                        ? formatDateTime(slots[index])
                        : 'No slot — set the schedule'}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => deleteItem.mutate(item.id)}
                      aria-label="Discard photo"
                    >
                      ✕
                    </button>
                  </div>
                  {item.tag_status === 'pending' && (
                    <span className="muted">Generating captions…</span>
                  )}
                  {item.tag_status === 'failed' && (
                    <span className="field-error">
                      Tagging failed: {item.tag_error} — write the captions
                      below.
                    </span>
                  )}
                  {item.tag_status !== 'pending' &&
                    selectedPlatforms.map((platform) => {
                      const pool = poolFor(item, platform);
                      return (
                        <div key={platform} className="field">
                          <span className="field-label">
                            {PLATFORM_LABEL[platform]} caption
                          </span>
                          {pool ? (
                            <>
                              <textarea
                                className="bulk-prefix"
                                rows={3}
                                value={pool.prefix}
                                onChange={(e) =>
                                  setPoolLocal(item, platform, {
                                    ...pool,
                                    prefix: e.target.value,
                                  })
                                }
                                onBlur={() => persistCaption(item)}
                              />
                              <TagPillEditor
                                platform={platform}
                                pool={pool}
                                onReorder={(tags) =>
                                  reorderPool(item, platform, {
                                    ...pool,
                                    tags,
                                  })
                                }
                              />
                            </>
                          ) : (
                            <textarea
                              rows={6}
                              value={captionValue(item, platform)}
                              onChange={(e) =>
                                setEdits((prev) => ({
                                  ...prev,
                                  [`${item.id}:${platform}`]: e.target.value,
                                }))
                              }
                              onBlur={() => persistCaption(item)}
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
            {items.length > 0 && (
              <div
                className="bulk-dropzone"
                role="button"
                tabIndex={0}
                onClick={() => fileInput.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInput.current?.click();
                  }
                }}
              >
                {upload.isPending
                  ? 'Uploading…'
                  : 'Drop more photos, or click to browse'}
              </div>
            )}
            {upload.isError && (
              <span className="field-error">{upload.error.message}</span>
            )}
          </div>
        </div>

        <div className="form-error-slot">
          {approve.isError && (
            <span className="state-error">{approve.error.message}</span>
          )}
          {!approve.isError && anyPending && (
            <span className="muted">Waiting for captions to generate…</span>
          )}
          {!approve.isError && !anyPending && uncroppedItems.length > 0 && (
            <span className="state-error">
              {uncroppedItems.length} photo
              {uncroppedItems.length === 1 ? '' : 's'} need cropping for
              Instagram before scheduling.
            </span>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canApprove}
            onClick={onApprove}
          >
            {approve.isPending
              ? 'Scheduling…'
              : `Schedule ${items.length} post${items.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>

    {showSchedule && (
      <WeeklyScheduleModal
        schedule={effectiveSchedule}
        onChange={saveSchedule}
        onClose={() => setShowSchedule(false)}
      />
    )}

    {previewItemId !== null &&
      (() => {
        const previewItem = items.find((i) => i.id === previewItemId);
        if (!previewItem) {
          return null;
        }
        return (
          <div
            className="modal-backdrop"
            onClick={() => setPreviewItemId(null)}
            role="presentation"
          >
            <div
              className="modal modal--thumb-preview"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Framing preview"
            >
              <div className="modal-header">
                <h2>
                  {previewItem.ig_image_url
                    ? 'Instagram crop'
                    : 'Full frame — no crop'}
                </h2>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setPreviewItemId(null)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <img
                className="thumb-preview-img"
                src={previewItem.ig_image_url ?? previewItem.image_url}
                alt=""
              />
            </div>
          </div>
        );
      })()}

    {cropItemId !== null &&
      (() => {
        const cropItem = items.find((i) => i.id === cropItemId);
        if (!cropItem) {
          return null;
        }
        return (
          <ImageCropModal
            imageUrl={cropItem.image_url}
            initialRect={cropItem.ig_crop}
            saving={cropImage.isPending}
            error={cropImage.error?.message ?? null}
            onCancel={() => {
              cropImage.reset();
              setCropItemId(null);
            }}
            onCrop={(rect) =>
              cropImage.mutate(
                { id: cropItem.id, rect },
                {
                  onSuccess: () => {
                    cropImage.reset();
                    setCropItemId(null);
                  },
                }
              )
            }
          />
        );
      })()}

    {showIgPreview && (
      <div
        className="modal-backdrop"
        onClick={() => setShowIgPreview(false)}
        role="presentation"
      >
        <div
          className="modal modal--ig-preview"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Instagram grid preview"
        >
          <div className="modal-header">
            <h2>Instagram preview</h2>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowIgPreview(false)}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p className="muted field-help ig-preview-hint">
            How the batch lands on your profile grid — most recent (last
            scheduled) first.
          </p>
          <div className="ig-grid">
            {[...orderedItems].reverse().map((item) => (
              <div key={item.id} className="ig-grid-cell">
                <img src={item.ig_image_url ?? item.image_url} alt="" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
