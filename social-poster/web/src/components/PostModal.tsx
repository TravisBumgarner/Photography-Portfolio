import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAccounts } from '../hooks/useAccounts';
import {
  useCreatePost,
  useDeletePost,
  useEditPost,
  useSendPostNow,
  useSnapshotEngagement,
} from '../hooks/usePosts';
import { useSettings } from '../hooks/useSettings';
import { useGenerateCaptions } from '../hooks/useTagging';
import {
  apiISOToDatetimeLocal,
  dateToDatetimeLocal,
  datetimeLocalToApiISO,
  formatHHMM,
} from '../utils/datetime';
import { isOverdue } from '../utils/posts';
import type { Captions, Platform, Post } from '../api/types';

interface PostModalProps {
  onClose: () => void;
  /** When provided, the modal edits this post instead of creating a new one. */
  post?: Post;
  /** Prefill the scheduled time (datetime-local) when creating a new post. */
  initialScheduledAt?: string;
}

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: 'Instagram',
  bluesky: 'Bluesky',
};

const ALL_PLATFORMS: Platform[] = ['instagram', 'bluesky'];

interface FormValues {
  image?: FileList;
  scheduled_at: string;
  account_ids: number[];
  captionInstagram?: string;
  captionBluesky?: string;
  featured_by?: string;
}

const CAPTION_FIELD: Record<Platform, 'captionInstagram' | 'captionBluesky'> = {
  instagram: 'captionInstagram',
  bluesky: 'captionBluesky',
};

export function PostModal({ onClose, post, initialScheduledAt }: PostModalProps) {
  const isEdit = Boolean(post);
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: settings } = useSettings();
  const createPost = useCreatePost();
  const editPost = useEditPost();
  const sendNow = useSendPostNow();
  const deletePost = useDeletePost();
  const captionGen = useGenerateCaptions();
  const snapshot = useSnapshotEngagement();

  // Published account records, preferring the fresh copy a snapshot returned
  // (the parent's `post` prop may be stale until the posts query refetches).
  const postedTargets = (snapshot.data?.post ?? post)?.targets.filter(
    (t) => t.status === 'posted'
  ) ?? [];

  // Image is required when creating; when editing we keep the existing image
  // unless a new one is uploaded, and we don't force the time back into the
  // future (the post may already exist with a past/now time).
  const schema = useMemo(
    () =>
      z
        .object({
          image: z.custom<FileList>().optional(),
          scheduled_at: z.string().min(1, 'A scheduled time is required.'),
          account_ids: z.array(z.number()).min(1, 'Select at least one account.'),
          captionInstagram: z.string().max(2200, 'Caption is too long.').optional(),
          captionBluesky: z.string().max(2200, 'Caption is too long.').optional(),
          featured_by: z.string().max(2000, 'Too long.').optional(),
        })
        .superRefine((val, ctx) => {
          const hasNewImage =
            val.image instanceof FileList && val.image.length > 0;
          if (!isEdit && !hasNewImage) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['image'],
              message: 'An image is required.',
            });
          }
          if (
            !isEdit &&
            val.scheduled_at &&
            new Date(val.scheduled_at).getTime() <= Date.now()
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ['scheduled_at'],
              message: 'Scheduled time must be in the future.',
            });
          }
        }),
    [isEdit]
  );

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduled_at: post
        ? apiISOToDatetimeLocal(post.scheduled_at)
        : initialScheduledAt ??
          // Default a new post to an hour out so it's valid immediately, rather
          // than defaulting to "now" (which fails the must-be-future check).
          dateToDatetimeLocal(new Date(Date.now() + 60 * 60 * 1000)),
      account_ids: post ? post.targets.map((t) => t.account_id) : [],
      captionInstagram: post?.captions.instagram ?? '',
      captionBluesky: post?.captions.bluesky ?? '',
      featured_by: post?.featured_by ?? '',
    },
  });

  const selectedIds = watch('account_ids');
  const watchedImage = watch('image');
  const scheduledAt = watch('scheduled_at');

  // Register fields RHF can't see via a plain input (managed manually).
  useEffect(() => {
    register('account_ids');
  }, [register]);

  // Live preview of a freshly-selected image file (object URL, revoked on change).
  const [filePreview, setFilePreview] = useState<string | null>(null);
  useEffect(() => {
    const file =
      watchedImage instanceof FileList && watchedImage.length > 0
        ? watchedImage[0]
        : null;
    if (!file) {
      setFilePreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [watchedImage]);

  const commonTimes = settings?.common_times ?? [];

  // Apply a preset 'HH:MM' to the scheduled date, keeping the date (or today's
  // if none chosen yet).
  const applyPresetTime = (hhmm: string) => {
    const current = getValues('scheduled_at');
    const datePart = current
      ? current.slice(0, 10)
      : apiISOToDatetimeLocal(new Date().toISOString()).slice(0, 10);
    setValue('scheduled_at', `${datePart}T${hhmm}`, { shouldValidate: true });
  };

  // Which platforms are represented by the selected accounts — drives which
  // per-platform caption fields are shown.
  const selectedPlatforms = useMemo(() => {
    const set = new Set<Platform>();
    for (const id of selectedIds) {
      const account = accounts?.find((a) => a.id === id);
      if (account) {
        set.add(account.platform);
      }
    }
    return set;
  }, [selectedIds, accounts]);

  const toggleAccount = (id: number, checked: boolean) => {
    const next = checked
      ? [...selectedIds, id]
      : selectedIds.filter((existing) => existing !== id);
    setValue('account_ids', next, { shouldValidate: true });
  };

  const allSelected =
    (accounts?.length ?? 0) > 0 && selectedIds.length === accounts!.length;

  const toggleAllAccounts = () => {
    setValue('account_ids', allSelected ? [] : (accounts ?? []).map((a) => a.id), {
      shouldValidate: true,
    });
  };

  // Run the tagging script on a newly-chosen photo and pre-fill any caption
  // field the user hasn't written yet (never clobbers typed text).
  const imageField = register('image');
  const onImageChosen = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) {
      return;
    }
    captionGen.mutate(file, {
      onSuccess: ({ captions }) => {
        if (captions.instagram && !getValues('captionInstagram')) {
          setValue('captionInstagram', captions.instagram);
        }
        if (captions.bluesky && !getValues('captionBluesky')) {
          setValue('captionBluesky', captions.bluesky);
        }
      },
    });
  };

  const buildCaptions = (values: FormValues): Captions => {
    const captions: Captions = {};
    if (selectedPlatforms.has('instagram')) {
      captions.instagram = values.captionInstagram ?? '';
    }
    if (selectedPlatforms.has('bluesky')) {
      captions.bluesky = values.captionBluesky ?? '';
    }
    return captions;
  };

  const onSubmit = handleSubmit((values) => {
    const captions = buildCaptions(values);
    const scheduled_at = datetimeLocalToApiISO(values.scheduled_at);
    const image =
      values.image && values.image.length > 0 ? values.image[0] : undefined;

    if (isEdit && post) {
      editPost.mutate(
        {
          id: post.id,
          input: {
            image,
            captions,
            scheduled_at,
            account_ids: values.account_ids,
            featured_by: values.featured_by ?? '',
          },
        },
        { onSuccess: () => onClose() }
      );
      return;
    }
    if (!image) {
      return;
    }
    createPost.mutate(
      { image, captions, scheduled_at, account_ids: values.account_ids },
      { onSuccess: () => onClose() }
    );
  });

  const mutation = isEdit ? editPost : createPost;

  // Mirror the schema's required rules so the submit button can't be clicked
  // until the post is actually schedulable.
  const hasImage = isEdit || (watchedImage instanceof FileList && watchedImage.length > 0);
  const hasTime =
    Boolean(scheduledAt) &&
    (isEdit || new Date(scheduledAt).getTime() > Date.now());
  const canSubmit = hasImage && hasTime && selectedIds.length >= 1;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal modal--post"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit post' : 'New post'}
      >
        <div className="modal-header">
          <h2>{isEdit ? 'Edit post' : 'New post'}</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="form" onSubmit={onSubmit} noValidate>
          {isEdit && post && isOverdue(post) && (
            <div className="overdue-banner">
              ⚠ This post missed its scheduled time — the server may have been
              down. Send it now, or pick a future time and save.
            </div>
          )}

          <div className="post-modal-body">
            {/* LEFT: image preview + picker */}
            <div className="post-modal-image">
              <div className="post-image-frame">
                {filePreview || (isEdit && post) ? (
                  <img
                    className="post-preview"
                    src={filePreview ?? post!.image_url}
                    alt=""
                  />
                ) : (
                  <span className="post-image-placeholder">
                    No image selected yet
                  </span>
                )}
              </div>
              <label className="field">
                <span className="field-label">
                  {isEdit ? 'Replace image (optional)' : 'Image *'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  {...imageField}
                  onChange={(e) => {
                    void imageField.onChange(e);
                    onImageChosen(e.target.files);
                  }}
                />
                {errors.image && (
                  <span className="field-error">{errors.image.message}</span>
                )}
                {captionGen.isPending && (
                  <span className="muted">Generating captions…</span>
                )}
                {!captionGen.isPending && captionGen.data?.error && (
                  <span className="muted">
                    No captions from metadata: {captionGen.data.error}
                  </span>
                )}
              </label>
            </div>

            {/* RIGHT: scrollable metadata */}
            <div className="post-modal-meta">
              <div className="field">
                <div className="field-label-row">
                  <span className="field-label">Accounts *</span>
                  {(accounts?.length ?? 0) > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={toggleAllAccounts}
                    >
                      {allSelected ? 'Clear' : 'Select all'}
                    </button>
                  )}
                </div>
                {accountsLoading && <span className="muted">Loading…</span>}
                {!accountsLoading && (accounts?.length ?? 0) === 0 && (
                  <span className="muted">
                    No accounts yet — add one in Accounts first.
                  </span>
                )}
                <div className="checkbox-list">
                  {accounts?.map((account) => (
                    <label key={account.id} className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(account.id)}
                        onChange={(e) =>
                          toggleAccount(account.id, e.target.checked)
                        }
                      />
                      <span>
                        {account.username}{' '}
                        <span className="muted">({account.platform})</span>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.account_ids && (
                  <span className="field-error">
                    {errors.account_ids.message}
                  </span>
                )}
              </div>

              {selectedPlatforms.size === 0 ? (
                <p className="muted field-help">
                  Select an account to write its caption — @-mentions differ per
                  platform, so each gets its own.
                </p>
              ) : (
                ALL_PLATFORMS.filter((p) => selectedPlatforms.has(p)).map(
                  (platform) => (
                    <label key={platform} className="field">
                      <span className="field-label">
                        {PLATFORM_LABEL[platform]} caption
                      </span>
                      <textarea
                        rows={6}
                        placeholder={`Write the ${PLATFORM_LABEL[platform]} caption (optional)…`}
                        {...register(CAPTION_FIELD[platform])}
                      />
                      {errors[CAPTION_FIELD[platform]] && (
                        <span className="field-error">
                          {errors[CAPTION_FIELD[platform]]?.message}
                        </span>
                      )}
                    </label>
                  )
                )
              )}

              <div className="field">
                <span className="field-label">Scheduled time *</span>
                <input type="datetime-local" {...register('scheduled_at')} />
                {commonTimes.length > 0 && (
                  <select
                    className="time-preset"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        applyPresetTime(e.target.value);
                      }
                    }}
                    aria-label="Quick time"
                  >
                    <option value="">Quick time…</option>
                    {commonTimes.map((t) => (
                      <option key={t} value={t}>
                        {formatHHMM(t)}
                      </option>
                    ))}
                  </select>
                )}
                {errors.scheduled_at && (
                  <span className="field-error">
                    {errors.scheduled_at.message}
                  </span>
                )}
                {/* Explain a disabled submit immediately, before any submit
                    attempt, so a past/now time isn't "blocked for no reason". */}
                {!errors.scheduled_at &&
                  !isEdit &&
                  Boolean(scheduledAt) &&
                  new Date(scheduledAt).getTime() <= Date.now() && (
                    <span className="field-error">
                      Scheduled time must be in the future — pick a later time.
                    </span>
                  )}
              </div>

              {isEdit && post && postedTargets.length > 0 && (
                <div className="field">
                  <div className="field-label-row">
                    <span className="field-label">Engagement</span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      disabled={
                        snapshot.isPending ||
                        !postedTargets.some((t) => t.remote_id)
                      }
                      onClick={() => snapshot.mutate(post.id)}
                    >
                      {snapshot.isPending ? 'Refreshing…' : '↻ Refresh stats'}
                    </button>
                  </div>
                  <ul className="engagement-list">
                    {postedTargets.map((t) => (
                      <li key={t.id} className="engagement-row">
                        <span>
                          {t.username}{' '}
                          <span className="muted">({t.platform})</span>
                        </span>
                        {t.engagement ? (
                          <span>
                            ❤️ {t.engagement.likes ?? '–'} · 💬{' '}
                            {t.engagement.comments ?? '–'}
                            {t.engagement.reposts != null && (
                              <> · 🔁 {t.engagement.reposts}</>
                            )}{' '}
                            <span className="muted">
                              as of {t.engagement.recorded_at.slice(0, 10)}
                            </span>
                          </span>
                        ) : t.remote_id ? (
                          <span className="muted">no stats yet — refresh</span>
                        ) : (
                          <span className="muted">
                            published before stats tracking
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  {snapshot.isError && (
                    <span className="field-error">
                      {snapshot.error.message}
                    </span>
                  )}
                  {snapshot.data?.results.some((r) => !r.ok) && (
                    <span className="field-error">
                      {snapshot.data.results
                        .filter((r) => !r.ok)
                        .map((r) => `${r.username}: ${r.error}`)
                        .join('; ')}
                    </span>
                  )}
                </div>
              )}

              {isEdit && (
                <label className="field">
                  <span className="field-label">Featured by</span>
                  <textarea
                    rows={2}
                    placeholder="Log feature-hub pickups, e.g. @moodygrams 2026-07-12"
                    {...register('featured_by')}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Always rendered so an error appearing doesn't shift the layout. */}
          <div className="form-error-slot">
            {mutation.isError && (
              <span className="state-error">{mutation.error.message}</span>
            )}
            {sendNow.isError && (
              <span className="state-error">{sendNow.error.message}</span>
            )}
            {deletePost.isError && (
              <span className="state-error">{deletePost.error.message}</span>
            )}
          </div>

          <div className="modal-actions">
            {isEdit && post && (
              <button
                type="button"
                className="btn btn-danger modal-action-delete"
                disabled={deletePost.isPending}
                onClick={() => {
                  if (window.confirm('Delete this post? This cannot be undone.')) {
                    deletePost.mutate(post.id, { onSuccess: () => onClose() });
                  }
                }}
              >
                {deletePost.isPending ? 'Deleting…' : 'Delete'}
              </button>
            )}
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            {isEdit && post && (
              <button
                type="button"
                className="btn"
                disabled={sendNow.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      'Send this post now? It will publish on the next run (within a minute).'
                    )
                  ) {
                    sendNow.mutate(post.id, { onSuccess: () => onClose() });
                  }
                }}
              >
                {sendNow.isPending ? 'Sending…' : 'Send now'}
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit || mutation.isPending}
            >
              {mutation.isPending
                ? isEdit
                  ? 'Saving…'
                  : 'Scheduling…'
                : isEdit
                  ? 'Save changes'
                  : 'Schedule post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
