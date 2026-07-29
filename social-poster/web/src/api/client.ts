import type {
  Account,
  AddAccountResult,
  ApproveIngestInput,
  Captions,
  CreateAccountInput,
  CreatePostInput,
  CropRect,
  EditPostInput,
  EngagementSnapshotResult,
  IngestItem,
  LogEntry,
  Post,
  Settings,
  TagCheckResult,
  TagPools,
  TaggingPreview,
  UpdatePostInput,
} from './types';

const BASE = '/api';

/**
 * Extract a human-readable error message from a non-2xx response body.
 * Backend may return JSON `{ error: string }` / `{ message: string }` or plain text.
 */
async function extractError(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) {
    return `Request failed with status ${res.status}`;
  }
  try {
    const body = JSON.parse(text) as { error?: string; message?: string };
    return body.error ?? body.message ?? text;
  } catch {
    return text;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(await extractError(res));
  }
  // 204 No Content (e.g. DELETE) has no body.
  if (res.status === 204) {
    return undefined as T;
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// --- Accounts ---------------------------------------------------------------

export function getAccounts(): Promise<Account[]> {
  return request<Account[]>('/accounts');
}

export function createAccount(
  input: CreateAccountInput
): Promise<AddAccountResult> {
  return request<AddAccountResult>('/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function deleteAccount(id: number): Promise<void> {
  return request<void>(`/accounts/${id}`, { method: 'DELETE' });
}

// --- Posts ------------------------------------------------------------------

export function getPosts(): Promise<Post[]> {
  return request<Post[]>('/posts');
}

export function createPost(input: CreatePostInput): Promise<Post> {
  const form = new FormData();
  form.append('image', input.image);
  form.append('captions', JSON.stringify(input.captions));
  form.append('scheduled_at', input.scheduled_at);
  form.append('account_ids', JSON.stringify(input.account_ids));
  return request<Post>('/posts', {
    method: 'POST',
    body: form,
  });
}

export function editPost(id: number, input: EditPostInput): Promise<Post> {
  const form = new FormData();
  if (input.image) {
    form.append('image', input.image);
  }
  form.append('captions', JSON.stringify(input.captions));
  form.append('scheduled_at', input.scheduled_at);
  form.append('account_ids', JSON.stringify(input.account_ids));
  if (input.featured_by !== undefined) {
    form.append('featured_by', input.featured_by);
  }
  return request<Post>(`/posts/${id}`, {
    method: 'PUT',
    body: form,
  });
}

/** Fetch fresh engagement counts for a post's published targets. */
export function snapshotPostEngagement(
  id: number
): Promise<{ results: EngagementSnapshotResult[]; post: Post }> {
  return request<{ results: EngagementSnapshotResult[]; post: Post }>(
    `/posts/${id}/engagement/snapshot`,
    { method: 'POST' }
  );
}

/** Make a post due now; the publisher sends it on its next tick (≤1 min). */
export function sendPostNow(id: number): Promise<Post> {
  return request<Post>(`/posts/${id}/send-now`, { method: 'POST' });
}

/** Publish a single account's record (photo×account) now / retry it. */
export function sendTargetNow(targetId: number): Promise<Post> {
  return request<Post>(`/post-targets/${targetId}/send-now`, {
    method: 'POST',
  });
}

/** Delete a single account's record; removes the photo if it was the last. */
export function deleteTarget(targetId: number): Promise<void> {
  return request<void>(`/post-targets/${targetId}`, { method: 'DELETE' });
}

export function updatePost(
  id: number,
  input: UpdatePostInput
): Promise<Post> {
  return request<Post>(`/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function deletePost(id: number): Promise<void> {
  return request<void>(`/posts/${id}`, { method: 'DELETE' });
}

// --- Bulk ingestion -----------------------------------------------------------

export function getIngestItems(): Promise<IngestItem[]> {
  return request<IngestItem[]>('/ingest');
}

/** Stage photos for review. Captions are filled in by the tagging script. */
export function uploadIngestImages(files: File[]): Promise<IngestItem[]> {
  const form = new FormData();
  for (const file of files) {
    form.append('images', file);
  }
  return request<IngestItem[]>('/ingest', { method: 'POST', body: form });
}

export function updateIngestItem(
  id: number,
  captions: Captions,
  tagPools?: TagPools
): Promise<IngestItem> {
  return request<IngestItem>(`/ingest/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(
      tagPools ? { captions, tag_pools: tagPools } : { captions }
    ),
  });
}

export function deleteIngestItem(id: number): Promise<void> {
  return request<void>(`/ingest/${id}`, { method: 'DELETE' });
}

/** Make (or replace) an item's Instagram-cropped variant from a crop rect. */
export function cropIngestImage(
  id: number,
  rect: CropRect
): Promise<IngestItem> {
  return request<IngestItem>(`/ingest/${id}/crop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rect),
  });
}

/** Convert approved staged items into scheduled posts (all-or-nothing). */
export function approveIngest(input: ApproveIngestInput): Promise<Post[]> {
  return request<Post[]>('/ingest/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

/** Run the tagging script on a photo (no staging) to pre-fill captions. */
export function generateCaptions(image: File): Promise<TaggingPreview> {
  const form = new FormData();
  form.append('image', image);
  return request<TaggingPreview>('/tagging/preview', {
    method: 'POST',
    body: form,
  });
}

/** Check a batch of photos for Lightroom keywords not yet registered in the
 * tag tree (no staging). */
export function checkTags(files: File[]): Promise<TagCheckResult> {
  const form = new FormData();
  for (const file of files) {
    form.append('images', file);
  }
  return request<TagCheckResult>('/tagging/check', {
    method: 'POST',
    body: form,
  });
}

// --- Logs -------------------------------------------------------------------

export function getLogs(): Promise<LogEntry[]> {
  return request<LogEntry[]>('/logs');
}

// --- Settings ---------------------------------------------------------------

export function getSettings(): Promise<Settings> {
  return request<Settings>('/settings');
}

export function updateSettings(input: Partial<Settings>): Promise<Settings> {
  return request<Settings>('/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
