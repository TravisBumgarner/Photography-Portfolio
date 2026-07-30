export type Platform = 'instagram' | 'bluesky' | 'reddit';

export type TargetStatus = 'scheduled' | 'posted' | 'failed';

export interface Account {
  id: number;
  platform: Platform;
  username: string;
  display_name: string | null;
}

/** Returned by POST /api/accounts — the saved account plus a profile receipt. */
export interface AddAccountResult extends Account {
  avatar_url: string | null;
  follower_count: number | null;
  post_count: number | null;
}

/** Latest engagement snapshot for a published target. Null counts mean the
 * platform doesn't expose that metric (e.g. Instagram share counts). */
export interface Engagement {
  likes: number | null;
  comments: number | null;
  reposts: number | null;
  recorded_at: string;
}

export interface Target {
  /** The post_target row id — the unit of a photo×destination record. On
   * Reddit a destination is one subreddit, so one account can hold several. */
  id: number;
  account_id: number;
  platform: Platform;
  username: string;
  /** On Reddit this is the description, posted as a first comment (an image
   * submission is a link post and can't carry body text). */
  caption: string;
  /** Bare subreddit name for Reddit destinations; null on every other platform. */
  subreddit: string | null;
  /** Reddit submission title, rendered from the sub's template then editable. */
  title: string;
  flair_id: string | null;
  /** Offset in minutes from the post's scheduled_at. Reddit destinations are
   * spread out because simultaneous multi-sub submission reads as spam. */
  delay_minutes: number;
  /** scheduled_at + delay_minutes — when this destination actually goes out. */
  due_at: string | null;
  status: TargetStatus;
  error: string | null;
  posted_at: string | null;
  /** Platform id of the published item (IG media id / Bluesky at:// URI /
   * Reddit submission id); null before publish or for posts published before
   * ids were captured. */
  remote_id: string | null;
  engagement: Engagement | null;
}

/** Per-platform captions, e.g. `{ instagram: '…', bluesky: '…' }`. Lossy for
 * Reddit, where several destinations share the platform — anything
 * per-destination must read `Post.targets`. */
export type Captions = Partial<Record<Platform, string>>;

/** One destination to create or keep on a post. Reddit needs one entry per
 * subreddit; omit `delay_minutes` to let the server assign the stagger. */
export interface TargetInput {
  account_id: number;
  caption: string;
  subreddit?: string;
  title?: string;
  flair_id?: string | null;
  delay_minutes?: number;
}

/** Per-subreddit posting rules. Moderators enforce these, so a target that
 * breaks one is refused at schedule time rather than failing at publish. */
export interface SubredditRules {
  id: number | null;
  /** Bare name, no `r/` prefix. */
  name: string;
  /** Category quick-selects this sub belongs to. */
  categories: string[];
  /** Title template with `{token}` placeholders — `{title}`, `{location}`,
   * `{camera}`, `{film_stock}`, `{dimensions}`, … Empty means "use the photo
   * title as-is". */
  title_template: string;
  flair_id: string | null;
  flair_text: string | null;
  requires_flair: boolean;
  max_title_length: number;
  allow_tags: boolean;
  /** Whether the description may be posted as a first comment. */
  comment_body: boolean;
  /** Minimum days between our posts here; 0 disables the check. */
  min_interval_days: number;
  /** Default spacing when this sub is one of several on a photo. */
  stagger_minutes: number;
  notes: string;
}

/** A category quick-select: picking it selects every sub in `subreddits`.
 * `keyword_prefixes` are Lightroom hierarchy prefixes, so a photo's own
 * keywords decide which categories are suggested for it. */
export interface SubredditCategory {
  id: number;
  name: string;
  keyword_prefixes: string[];
  subreddits: string[];
}

/** Subreddits suggested for a photo, with a title pre-rendered for every
 * configured sub (not just the suggested ones) so picking any is instant. */
export interface RedditSuggestions {
  categories: string[];
  subreddits: string[];
  titles: Record<string, string>;
  error?: string | null;
}

export interface Post {
  id: number;
  /** Representative caption (first non-empty) for compact display. */
  caption: string;
  captions: Captions;
  scheduled_at: string;
  image_url: string;
  created_at: string;
  /** Free-text log of feature-hub pickups (e.g. "@moodygrams 2026-07-12"). */
  featured_by: string;
  targets: Target[];
  /** Only on the send-now response: destinations still waiting on their
   * stagger offset, which a later publisher tick will send. */
  staggered_pending?: number;
}

/** One row of the append-only publish audit log. */
export interface LogEntry {
  id: number;
  post_id: number | null;
  platform: Platform;
  username: string;
  status: 'posted' | 'failed';
  error: string | null;
  image_url: string | null;
  caption: string | null;
  attempted_at: string;
}

export interface CreateAccountInput {
  platform: Platform;
  ig_user_id?: string;
  access_token?: string;
  handle?: string;
  app_password?: string;
  /** Reddit "script" app credentials (reddit.com/prefs/apps) plus the owning
   * account's own login. */
  client_id?: string;
  client_secret?: string;
  username?: string;
  password?: string;
}

export interface CreatePostInput {
  image: File;
  scheduled_at: string;
  /** One entry per destination. Required for Reddit, which needs a subreddit
   * and title per entry. */
  targets: TargetInput[];
}

/** Full edit of an existing post. Image is optional (omit to keep current). */
export interface EditPostInput {
  image?: File;
  scheduled_at: string;
  targets: TargetInput[];
  featured_by?: string;
}

export interface UpdatePostInput {
  scheduled_at?: string;
  caption?: string;
  featured_by?: string;
}

/** Per-target outcome of an engagement snapshot run. */
export interface EngagementSnapshotResult {
  target_id: number;
  platform: Platform;
  username: string;
  subreddit: string | null;
  ok: boolean;
  error: string | null;
}

/** One weekly posting slot: a day paired with a local 'HH:MM' time.
 * `day` uses `Date.getDay()` numbering (0 = Sunday … 6 = Saturday). */
export interface ScheduleSlot {
  day: number;
  time: string;
}

/**
 * Weekly slot template for bulk ingestion — per-day posting times (each day
 * has its own, independent times). Photos fill the resulting slots in order,
 * repeating weekly as needed.
 */
export interface BulkSchedule {
  slots: ScheduleSlot[];
}

/** App settings. `common_times` are 'HH:MM' presets for the schedule dropdown. */
export interface Settings {
  common_times: string[];
  bulk_schedule: BulkSchedule;
}

export type IngestTagStatus = 'pending' | 'tagged' | 'failed';

/** One candidate tag in the draggable pill editor. `priority` hubs get a star;
 * `mention` (@-tags) are capped separately from hashtags; `selected` is whether
 * it currently posts (the user toggles this by dragging pills between groups). */
export interface TagPill {
  text: string;
  priority: boolean;
  mention: boolean;
  selected: boolean;
}

/** The tag pool for one platform: the fixed caption `prefix` (title,
 * description, gear line) plus the ordered candidate tags. */
export interface TagPool {
  prefix: string;
  tags: TagPill[];
}

/** Per-platform tag pools driving the pill editor. Empty/absent when tagging
 * couldn't build them; the caption textarea still works. */
export type TagPools = Partial<Record<Platform, TagPool>>;

/** A bulk-uploaded photo staged for review before becoming a scheduled post. */
export interface IngestItem {
  id: number;
  image_url: string;
  /** The Instagram-cropped variant, if the user made one — Instagram posts
   * this while Bluesky keeps the original framing. Null when uncropped. */
  ig_image_url: string | null;
  /** The crop rectangle (original natural pixels) behind `ig_image_url`, so
   * re-opening the cropper restores the previous framing. Null when uncropped. */
  ig_crop: CropRect | null;
  /** True when the original is outside Instagram's aspect range and hasn't
   * been cropped yet: Instagram targets need a crop before this can post. */
  needs_ig_crop: boolean;
  /** Per-platform captions generated by the tagging script (then user-edited). */
  captions: Captions;
  /** Structured tag pools for the draggable pill editor. */
  tag_pools: TagPools;
  /** `{subreddit: title}` — the keys ARE this photo's Reddit selection, so an
   * empty object means it isn't going to Reddit. */
  titles: Record<string, string>;
  /** Subs proposed from this photo's own keywords, with titles pre-rendered.
   * A proposal, not a selection. Empty when tagging found no usable metadata. */
  reddit_suggestions: Partial<RedditSuggestions>;
  tag_status: IngestTagStatus;
  tag_error: string | null;
  created_at: string;
}

/** A crop rectangle in the image's display pixels (post-EXIF-orientation). */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ApproveIngestInput {
  account_ids: number[];
  items: {
    id: number;
    scheduled_at: string;
    captions: Captions;
    /** `{subreddit: title}` for this photo; omit to use its stored selection. */
    titles?: Record<string, string>;
  }[];
}

/** Result of running the tagging script on a photo. `error` is set (and
 * captions empty) when the photo lacks usable Lightroom metadata. */
export interface TaggingPreview {
  captions: Captions;
  error: string | null;
}

/** A node in the tag-status tree: a keyword hierarchy level, flagged as
 * existing in the tag tree (green) or needing to be made (red). The tree is
 * pruned to branches that lead to a missing node. */
export interface TagNode {
  name: string;
  exists: boolean;
  children: TagNode[];
}

/** Per-photo metadata outcome. `error` is set when the photo lacks usable
 * Lightroom metadata (no XMP / no keywords). */
export interface TagCheckFile {
  filename: string;
  error: string | null;
}

/** Result of checking a batch of photos: the merged hierarchy tree of tags
 * that need making (with existing breadcrumb ancestors), the flat `A|B|C`
 * worklist, and per-photo errors. */
export interface TagCheckResult {
  tree: TagNode[];
  missing: string[];
  files: TagCheckFile[];
}
