import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import type { CropRect } from '../api/types';

/** Instagram's valid feed aspect ratios (width / height). Portrait 4:5 is the
 * default — it keeps the most of a too-tall photo. */
const PRESETS: { label: string; aspect: number }[] = [
  { label: '4:5', aspect: 0.8 },
  { label: '1:1', aspect: 1 },
  { label: '1.91:1', aspect: 1.91 },
];

/** Composition guides drawn inside the crop box: the fractional positions of
 * the vertical/horizontal lines for each style. */
const OVERLAYS: { key: string; label: string; lines: number[] }[] = [
  { key: 'thirds', label: 'Thirds', lines: [1 / 3, 2 / 3] },
  { key: 'grid', label: 'Grid', lines: [0.25, 0.5, 0.75] },
  { key: 'golden', label: 'Golden', lines: [0.382, 0.618] },
  { key: 'center', label: 'Center', lines: [0.5] },
  { key: 'off', label: 'Off', lines: [] },
];

/** The largest box of a given aspect ratio that fits inside `dw × dh`. */
function maxFitBox(dw: number, dh: number, aspect: number) {
  // Wider image than the box → the box is limited by height, and vice versa.
  if (dw / dh > aspect) {
    return { w: dh * aspect, h: dh };
  }
  return { w: dw, h: dw / aspect };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(v, hi));
}

/**
 * Crop a photo for Instagram: pick an aspect ratio (within IG's 4:5–1.91:1
 * range), a size, and drag to frame it. Reports the crop rectangle in the
 * image's natural pixels; the original is never modified (only Instagram uses
 * the crop, Bluesky keeps the full frame).
 */
/** Snap an arbitrary aspect ratio to the nearest supported preset. */
function nearestPreset(aspect: number) {
  return PRESETS.reduce((best, p) =>
    Math.abs(p.aspect - aspect) < Math.abs(best.aspect - aspect) ? p : best
  ).aspect;
}

export function ImageCropModal({
  imageUrl,
  initialRect,
  saving,
  error,
  onCrop,
  onCancel,
}: {
  imageUrl: string;
  /** A prior crop (original natural pixels) to restore, or null to start fresh. */
  initialRect?: CropRect | null;
  saving: boolean;
  error?: string | null;
  onCrop: (rect: CropRect) => void;
  onCancel: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  // Displayed image size (CSS px) — the coordinate space the crop box lives in.
  const [disp, setDisp] = useState<{ w: number; h: number } | null>(null);
  const [aspect, setAspect] = useState(
    initialRect ? nearestPreset(initialRect.width / initialRect.height) : 0.8
  );
  const [size, setSize] = useState(1); // fraction of the max-fit box (0.3–1)
  const [pos, setPos] = useState({ x: 0, y: 0 }); // top-left of the box, CSS px
  const [overlay, setOverlay] = useState('thirds');
  const drag = useRef<{ px: number; py: number; ox: number; oy: number } | null>(
    null
  );

  const box = useMemo(() => {
    if (!disp) {
      return { w: 0, h: 0 };
    }
    const max = maxFitBox(disp.w, disp.h, aspect);
    return { w: max.w * size, h: max.h * size };
  }, [disp, aspect, size]);

  // Re-clamp (and center on first sizing) whenever the box or image resizes.
  useEffect(() => {
    if (!disp) {
      return;
    }
    setPos((prev) => ({
      x: clamp(prev.x, 0, disp.w - box.w),
      y: clamp(prev.y, 0, disp.h - box.h),
    }));
  }, [disp, box.w, box.h]);

  const measure = () => {
    const el = imgRef.current;
    if (el && el.clientWidth) {
      setDisp((prev) => {
        const next = { w: el.clientWidth, h: el.clientHeight };
        return prev && prev.w === next.w && prev.h === next.h ? prev : next;
      });
    }
  };

  const onImgLoad = () => {
    const el = imgRef.current;
    if (!el || !el.naturalWidth) {
      return;
    }
    const w = el.clientWidth;
    const h = el.clientHeight;
    setDisp({ w, h });

    if (initialRect) {
      // Restore a prior crop: map its natural-pixel rect back to display px
      // and recover the aspect/size/position the box model uses.
      const scale = el.naturalWidth / w;
      const a = nearestPreset(initialRect.width / initialRect.height);
      const max = maxFitBox(w, h, a);
      setAspect(a);
      setSize(clamp(initialRect.width / scale / max.w, 0.3, 1));
      setPos({ x: initialRect.x / scale, y: initialRect.y / scale });
      return;
    }
    // Fresh crop: center the max-fit box.
    const max = maxFitBox(w, h, aspect);
    setPos({ x: (w - max.w) / 2, y: (h - max.h) / 2 });
  };

  useEffect(() => {
    // A cached image can be `complete` before onLoad wires up — size it now.
    if (imgRef.current?.complete && imgRef.current.clientWidth) {
      onImgLoad();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!drag.current || !disp) {
      return;
    }
    const dx = e.clientX - drag.current.px;
    const dy = e.clientY - drag.current.py;
    setPos({
      x: clamp(drag.current.ox + dx, 0, disp.w - box.w),
      y: clamp(drag.current.oy + dy, 0, disp.h - box.h),
    });
  };
  const onPointerUp = (e: PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    drag.current = null;
  };

  const submit = () => {
    const el = imgRef.current;
    if (!el || !disp || !el.naturalWidth) {
      return;
    }
    // Map the box from displayed CSS px to the image's natural pixels.
    const scale = el.naturalWidth / disp.w;
    onCrop({
      x: pos.x * scale,
      y: pos.y * scale,
      width: box.w * scale,
      height: box.h * scale,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onCancel} role="presentation">
      <div
        className="modal modal--crop"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Crop for Instagram"
      >
        <div className="modal-header">
          <h2>Crop for Instagram</h2>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="muted field-help">
          Instagram needs a 4:5–1.91:1 aspect ratio. Pick a shape and drag to
          frame it — Bluesky still posts the full photo.
        </p>

        <div className="crop-stage">
          <div className="crop-canvas">
            <img
              ref={imgRef}
              src={imageUrl}
              alt=""
              className="crop-img"
              draggable={false}
              onLoad={onImgLoad}
            />
            {disp && (
              <div
                className="crop-box"
                style={{
                  left: pos.x,
                  top: pos.y,
                  width: box.w,
                  height: box.h,
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                <div className="crop-grid" aria-hidden="true">
                  {(OVERLAYS.find((o) => o.key === overlay)?.lines ?? []).map(
                    (f) => (
                      <span key={`v${f}`} className="crop-grid-v" style={{ left: `${f * 100}%` }} />
                    )
                  )}
                  {(OVERLAYS.find((o) => o.key === overlay)?.lines ?? []).map(
                    (f) => (
                      <span key={`h${f}`} className="crop-grid-h" style={{ top: `${f * 100}%` }} />
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="crop-controls">
          <div className="seg">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                className={`seg-btn ${aspect === p.aspect ? 'seg-btn--active' : ''}`}
                onClick={() => setAspect(p.aspect)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <label className="crop-size">
            <span className="muted">Size</span>
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.01}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="crop-controls">
          <span className="muted">Guides</span>
          <div className="seg">
            {OVERLAYS.map((o) => (
              <button
                key={o.key}
                type="button"
                className={`seg-btn ${overlay === o.key ? 'seg-btn--active' : ''}`}
                onClick={() => setOverlay(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {error && <span className="field-error">{error}</span>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={submit}
            disabled={saving || !disp}
          >
            {saving ? 'Cropping…' : 'Crop for Instagram'}
          </button>
        </div>
      </div>
    </div>
  );
}
