import { useRef, useState } from 'react';
import { useCheckTags } from '../hooks/useTagging';
import type { TagCheckResult, TagNode } from '../api/types';

/** Render one level of the tag-status tree. Existing nodes are green
 * breadcrumbs; nodes that need making are red and bold. Depth drives the
 * indent and the `→` connector, so the hierarchy reads as a tree. */
function TagTree({ nodes, depth = 0 }: { nodes: TagNode[]; depth?: number }) {
  return (
    <ul className="tagtree">
      {nodes.map((node) => (
        <li key={node.name}>
          <span
            className={`tagtree-node ${
              node.exists ? 'tagtree-node--exists' : 'tagtree-node--missing'
            }`}
            style={{ paddingLeft: `${depth * 20}px` }}
          >
            {depth > 0 && <span className="tagtree-arrow">→ </span>}
            {node.name}
          </span>
          {node.children.length > 0 && (
            <TagTree nodes={node.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Tag Checker: drop a batch of Lightroom exports and see which
 * `cameracoffeewander|...` keywords aren't registered in the tag tree yet,
 * shown as a tree — existing levels in green for context, the tags that still
 * need adding to `config/tags.json` in red. Nothing is staged or scheduled.
 * Dropped photos accumulate so you can feed exports in waves.
 */
export function TagCheckerModal({ onClose }: { onClose: () => void }) {
  const check = useCheckTags();
  // Every photo dropped so far — resent on each drop so the server rebuilds the
  // full merged tree over the whole batch.
  const [photos, setPhotos] = useState<File[]>([]);
  const [result, setResult] = useState<TagCheckResult | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const onFilesChosen = (chosen: FileList | null) => {
    const images = Array.from(chosen ?? []).filter(
      (f) => f.type.startsWith('image/') || /\.avif$/i.test(f.name)
    );
    if (images.length > 0) {
      const batch = [...photos, ...images];
      setPhotos(batch);
      check.mutate(batch, { onSuccess: setResult });
    }
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  const clear = () => {
    setPhotos([]);
    setResult(null);
  };

  const copyMissing = () => {
    if (result) {
      void navigator.clipboard?.writeText(
        result.missing.map((m) => m.split('|').join(' > ')).join('\n')
      );
    }
  };

  const missingCount = result?.missing.length ?? 0;
  const erroredFiles = result?.files.filter((f) => f.error) ?? [];

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal modal--bulk"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Tag checker"
      >
        <div className="modal-header">
          <h2>Tag Checker</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div
          className={`bulk-review ${dragOver ? 'bulk-review--dragover' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              setDragOver(false);
            }
          }}
          onDrop={(e) => {
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

          <p className="muted field-help">
            Drop photos to see which <code>cameracoffeewander</code> keywords
            still need adding to <code>config/tags.json</code>.{' '}
            <span className="tagtree-node--exists">Green</span> already exists;{' '}
            <span className="tagtree-node--missing">red</span> needs to be made.
          </p>

          {check.isPending && (
            <div className="tagcheck-processing" role="status" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              Checking {photos.length} photo{photos.length === 1 ? '' : 's'}…
            </div>
          )}

          {result && (
            <div className="tagcheck-summary">
              <div className="field-label-row">
                <span className="field-label">
                  {missingCount === 0
                    ? 'Nothing to make — all keywords exist ✓'
                    : `${missingCount} tag${missingCount === 1 ? '' : 's'} to make`}
                </span>
                {missingCount > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={copyMissing}
                  >
                    Copy
                  </button>
                )}
              </div>
              {missingCount > 0 && <TagTree nodes={result.tree} />}
            </div>
          )}

          {erroredFiles.length > 0 && (
            <div className="tagcheck-errors">
              {erroredFiles.map((file, index) => (
                <div key={`${file.filename}:${index}`} className="muted">
                  {file.filename}: {file.error}
                </div>
              ))}
            </div>
          )}

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
            {check.isPending
              ? 'Checking…'
              : photos.length === 0
                ? 'Drop photos here, or click to browse'
                : `Drop more photos, or click to browse (${photos.length} checked)`}
          </div>

          {check.isError && (
            <span className="field-error">{check.error.message}</span>
          )}
        </div>

        <div className="modal-actions">
          {photos.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={clear}>
              Clear
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
