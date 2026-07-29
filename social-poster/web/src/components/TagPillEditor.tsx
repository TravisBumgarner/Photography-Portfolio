import { useState, type DragEvent } from 'react';
import type { Platform, TagPill, TagPool } from '../api/types';
import { enforceCaps } from '../utils/tags';

/**
 * Draggable tag pills for one platform, split into a "Posting" group (the tags
 * that will post — colored, blue hashtags / teal @mentions) and a "Not posting"
 * group (grayscale). Drag a pill between the groups to include/exclude it.
 *
 * Selection is explicit (`tag.selected`): removing a tag just shrinks the
 * posting set — it never auto-promotes the next one. Promoting past a cap
 * (5 hashtags / 3 mentions on IG, 300 chars on Bluesky) bumps the last of that
 * type back down. Both groups are always shown (with a placeholder when empty)
 * so there's always somewhere to drop.
 */
export function TagPillEditor({
  platform,
  pool,
  onReorder,
}: {
  platform: Platform;
  pool: TagPool;
  onReorder: (tags: TagPill[]) => void;
}) {
  const [dragText, setDragText] = useState<string | null>(null);
  const [overText, setOverText] = useState<string | null>(null);

  // Move the dragged tag to a target position and set its selected state, then
  // enforce caps (deselect-only). `targetText` null = dropped on empty area.
  const applyDrop = (
    draggedText: string,
    targetText: string | null,
    selected: boolean
  ) => {
    let next = pool.tags.map((t) =>
      t.text === draggedText ? { ...t, selected } : { ...t }
    );
    const from = next.findIndex((t) => t.text === draggedText);
    const [moved] = next.splice(from, 1);
    if (targetText) {
      next.splice(
        next.findIndex((t) => t.text === targetText),
        0,
        moved
      );
    } else if (selected) {
      next.unshift(moved);
    } else {
      next.push(moved);
    }
    onReorder(enforceCaps(platform, pool.prefix, next));
  };

  const reset = () => {
    setDragText(null);
    setOverText(null);
  };
  const allow = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const renderPill = (tag: TagPill) => (
    <span
      key={tag.text}
      draggable
      // Stop propagation so pill drags never reach the photo/file drop handlers.
      onDragStart={(e) => {
        e.stopPropagation();
        setDragText(tag.text);
      }}
      onDragEnd={(e) => {
        e.stopPropagation();
        reset();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (overText !== tag.text) {
          setOverText(tag.text);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dragText) {
          applyDrop(dragText, tag.text, tag.selected);
        }
        reset();
      }}
      className={[
        'pill',
        tag.mention ? 'pill--mention' : 'pill--hashtag',
        tag.selected ? 'pill--active' : 'pill--muted',
        dragText === tag.text ? 'pill--dragging' : '',
        overText === tag.text && dragText ? 'pill--over' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={tag.selected ? 'Will post' : 'Not posting — drag up to include'}
    >
      <span className="pill-icon" aria-hidden="true">
        {tag.priority ? '★' : ''}
      </span>
      {tag.text}
    </span>
  );

  const posting = pool.tags.filter((t) => t.selected);
  const dropped = pool.tags.filter((t) => !t.selected);

  const groupDrop = (selected: boolean) => (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragText) {
      applyDrop(dragText, null, selected);
    }
    reset();
  };

  return (
    <div className="pillgroups">
      <div className="pillgroup">
        <span className="pillgroup-label">
          Posting <span className="pillgroup-count">{posting.length}</span>
        </span>
        <div
          className="pillrow pillrow--posting"
          onDragOver={allow}
          onDrop={groupDrop(true)}
        >
          {posting.length > 0 ? (
            posting.map(renderPill)
          ) : (
            <span className="muted pill-empty">Drag a tag here to post it.</span>
          )}
        </div>
      </div>
      <div className="pillgroup">
        <span className="pillgroup-label pillgroup-label--muted">
          Not posting
        </span>
        <div
          className="pillrow pillrow--dropped"
          onDragOver={allow}
          onDrop={groupDrop(false)}
        >
          {dropped.length > 0 ? (
            dropped.map(renderPill)
          ) : (
            <span className="muted pill-empty">Drag a tag here to drop it.</span>
          )}
        </div>
      </div>
    </div>
  );
}
