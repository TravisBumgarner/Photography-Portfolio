import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
} from '../hooks/useAccounts';
import type { CreateAccountInput, Platform } from '../api/types';

interface AccountsPanelProps {
  onClose: () => void;
}

const schema = z
  .object({
    platform: z.enum(['instagram', 'bluesky']),
    ig_user_id: z.string().optional(),
    access_token: z.string().optional(),
    handle: z.string().optional(),
    app_password: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.platform === 'instagram') {
      if (!value.ig_user_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ig_user_id'],
          message: 'Instagram user ID is required.',
        });
      }
      if (!value.access_token) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['access_token'],
          message: 'Access token is required.',
        });
      }
    } else {
      if (!value.handle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['handle'],
          message: 'Handle is required.',
        });
      }
      if (!value.app_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['app_password'],
          message: 'App password is required.',
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

function buildInput(values: FormValues): CreateAccountInput {
  if (values.platform === 'instagram') {
    return {
      platform: 'instagram',
      ig_user_id: values.ig_user_id,
      access_token: values.access_token,
    };
  }
  return {
    platform: 'bluesky',
    handle: values.handle,
    app_password: values.app_password,
  };
}

export function AccountsPanel({ onClose }: AccountsPanelProps) {
  const { data: accounts, isLoading, isError, error } = useAccounts();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      platform: 'instagram',
      ig_user_id: '',
      access_token: '',
      handle: '',
      app_password: '',
    },
  });

  const values = watch();
  const platform = values.platform as Platform;

  // Are all required credential fields for the selected platform filled in?
  // Drives the Log in button's disabled state so empty submits are blocked.
  const hasRequiredCreds =
    platform === 'instagram'
      ? Boolean(values.ig_user_id?.trim() && values.access_token?.trim())
      : Boolean(values.handle?.trim() && values.app_password?.trim());

  // Switching platform keeps whatever the user typed (react-hook-form retains
  // unmounted field values), but clear the stale login receipt/error from a
  // previous attempt so it doesn't look like it applies to the new platform.
  useEffect(() => {
    createAccount.reset();
    // Only react to platform changes; createAccount identity churns each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  const onSubmit = handleSubmit((values) => {
    createAccount.mutate(buildInput(values), {
      onSuccess: () =>
        reset({
          platform: values.platform,
          ig_user_id: '',
          access_token: '',
          handle: '',
          app_password: '',
        }),
    });
  });

  const added = createAccount.data;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal modal--accounts"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Accounts"
      >
        <div className="modal-header">
          <h2>Accounts</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="accounts-body">
          <div className="accounts-col accounts-connected">
            <h3 className="form-subtitle">Connected accounts</h3>
            <div className="accounts-list">
          {isLoading && <div className="state-msg">Loading accounts…</div>}
          {isError && (
            <div className="state-msg state-error">{error.message}</div>
          )}
          {!isLoading && (accounts?.length ?? 0) === 0 && (
            <div className="muted">No accounts yet.</div>
          )}
          {accounts?.map((account) => (
            <div key={account.id} className="account-row">
              <div className="account-row-info">
                <strong>@{account.username}</strong>
                <span className="muted">
                  {account.display_name ? `${account.display_name} · ` : ''}
                  {account.platform}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={deleteAccount.isPending}
                onClick={() => {
                  if (window.confirm(`Delete account "${account.username}"?`)) {
                    deleteAccount.mutate(account.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          ))}
            </div>
          </div>

          <form className="accounts-col form accounts-add" onSubmit={onSubmit} noValidate>
            <div className="accounts-add-scroll">
          <h3 className="form-subtitle">Add an account</h3>
          <p className="muted form-hint">
            Logging in verifies the credentials and saves the account.
          </p>

          <label className="field">
            <span className="field-label">Platform</span>
            <select {...register('platform')}>
              <option value="instagram">Instagram</option>
              <option value="bluesky">Bluesky</option>
            </select>
          </label>

          {platform === 'instagram' && (
            <>
              <label className="field">
                <span className="field-label">Instagram user ID</span>
                <input
                  type="text"
                  autoComplete="off"
                  {...register('ig_user_id')}
                />
                {errors.ig_user_id && (
                  <span className="field-error">
                    {errors.ig_user_id.message}
                  </span>
                )}
              </label>
              <label className="field">
                <span className="field-label">Access token</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  {...register('access_token')}
                />
                <span className="field-help">
                  Generate a long-lived token and your Instagram user ID in the
                  Meta app dashboard under{' '}
                  <strong>Instagram → API setup with Instagram login</strong>.
                </span>
                {errors.access_token && (
                  <span className="field-error">
                    {errors.access_token.message}
                  </span>
                )}
              </label>
            </>
          )}

          {platform === 'bluesky' && (
            <>
              <label className="field">
                <span className="field-label">Handle</span>
                <input
                  type="text"
                  placeholder="name.bsky.social"
                  autoComplete="off"
                  {...register('handle')}
                />
                {errors.handle && (
                  <span className="field-error">
                    {errors.handle.message}
                  </span>
                )}
              </label>
              <label className="field">
                <span className="field-label">App password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  {...register('app_password')}
                />
                <span className="field-help">
                  Bluesky requires an <strong>app password</strong>, not
                  your main account password. Create one in Bluesky settings.
                </span>
                {errors.app_password && (
                  <span className="field-error">
                    {errors.app_password.message}
                  </span>
                )}
              </label>
            </>
          )}

          {/* Always-present slot so an error appearing doesn't shift layout. */}
          <div className="form-error-slot">
            {createAccount.isError && (
              <span className="state-error">
                {createAccount.error.message}
              </span>
            )}
          </div>

          {added && (
            <div className="login-receipt">
              {added.avatar_url && (
                <img
                  className="login-receipt-avatar"
                  src={added.avatar_url}
                  alt=""
                />
              )}
              <div>
                <div className="login-receipt-name">
                  ✓ Logged in as @{added.username}
                  {added.display_name ? ` (${added.display_name})` : ''}
                </div>
                <div className="muted">
                  {(added.follower_count ?? 0).toLocaleString()} followers ·{' '}
                  {(added.post_count ?? 0).toLocaleString()} posts
                </div>
              </div>
            </div>
          )}

            </div>

            <div className="modal-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createAccount.isPending || !hasRequiredCreds}
              >
                {createAccount.isPending ? 'Logging in…' : 'Log in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
