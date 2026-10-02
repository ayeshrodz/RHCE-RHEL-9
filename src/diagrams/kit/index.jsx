// Diagram kit: small SVG primitives that share one visual language.
// Flat pastel fills, hairline strokes, 14px titles / 12px subtitles, and
// colour "tones" that re-map automatically in dark mode (see diagrams.css).
import { createContext, useContext, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, RotateCcw, X } from 'lucide-react';

import { useOverlay } from '@/hooks/useOverlay';
import { formatCopy } from '@/components/interactive/TeachingContent';
import { interfaceContent } from '@/lib/course';

const MarkerContext = createContext('dg');

export function Diagram({ width = 680, height, title, caption, children, below, className = '', expandable = true }) {
  const uid = useId().replace(/:/g, '');
  const [zoom, setZoom] = useState(false);
  const [fit, setFit] = useState(true);
  const dialogRef = useRef(null);
  const copy = interfaceContent.Diagram.text;
  useOverlay(dialogRef, zoom, () => setZoom(false));

  const svg = (suffix) => {
    const markerId = `${uid}-${suffix}`;
    return (
      <MarkerContext.Provider value={markerId}>
        <svg viewBox={`0 0 ${width} ${height}`} className="dg" role="img" aria-label={title}>
          <defs>
            <marker id={`${markerId}-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M1 1.5 L9 5 L1 8.5" className="dg-head" />
            </marker>
            <marker id={`${markerId}-h`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M1 1.5 L9 5 L1 8.5" className="dg-head is-hot" />
            </marker>
            <marker
              id={`${markerId}-ok`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M1 1.5 L9 5 L1 8.5" className="dg-head is-ok" />
            </marker>
            <marker id={`${markerId}-bad`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="9" markerHeight="9" orient="auto">
              <path d="M2 2 L8 8 M8 2 L2 8" className="dg-head is-bad" />
            </marker>
          </defs>
          {children}
        </svg>
      </MarkerContext.Provider>
    );
  };

  return (
    <figure className={`diagram ${className}`}>
      <div className="diagram-canvas">
        <div className="diagram-tools">
          {expandable && (
            <button
              className="diagram-zoom"
              onClick={() => {
                setFit(true);
                setZoom(true);
              }}
              aria-label={copy.enlarge}
            >
              <Maximize2 size={14} />
            </button>
          )}
        </div>
        <div className="diagram-viewport">{svg('inline')}</div>
        {below}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
      {zoom && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={title} onClick={() => setZoom(false)}>
          <div ref={dialogRef} tabIndex={-1} className="lightbox-body" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-toolbar">
              <span>{title}</span>
              <button className="btn btn-sm" aria-pressed={!fit} onClick={() => setFit((v) => !v)}>
                {fit ? copy.zoom : copy.fit}
              </button>
            </div>
            <button className="icon-btn lightbox-close" onClick={() => setZoom(false)} aria-label={copy.close}>
              <X size={18} />
            </button>
            <div className={`lightbox-viewport ${fit ? 'is-fit' : ''}`} tabIndex={0} role="region" aria-label={title}>
              {svg('expanded')}
            </div>
            {caption && <p className="lightbox-caption">{caption}</p>}
          </div>
        </div>
      )}
    </figure>
  );
}

/** Rounded box with a title and optional subtitle line(s). */
export function Node({ x, y, w, h, tone = 'gray', title, sub, active, dim, onClick, mono, rx = 8, titleSize, align = 'middle' }) {
  const lines = sub == null ? [] : Array.isArray(sub) ? sub : [sub];
  const lineH = 16;
  const block = 18 + lines.length * lineH;
  const top = y + h / 2 - block / 2 + 13;
  const tx = align === 'start' ? x + 14 : x + w / 2;
  const interactive = !!onClick;

  return (
    <g
      className={`dg-node t-${tone} ${active ? 'is-active' : ''} ${dim ? 'is-dim' : ''} ${interactive ? 'is-clickable' : ''}`}
      onClick={onClick}
      onKeyDown={interactive ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-pressed={interactive ? !!active : undefined}
    >
      <rect x={x} y={y} width={w} height={h} rx={rx} />
      {title && (
        <text
          x={tx}
          y={top}
          textAnchor={align}
          className={`dg-title ${mono ? 'is-mono' : ''}`}
          style={titleSize ? { fontSize: titleSize } : undefined}
        >
          {title}
        </text>
      )}
      {lines.map((line, i) => (
        <text key={i} x={tx} y={top + 18 + i * lineH} textAnchor={align} className="dg-sub">
          {line}
        </text>
      ))}
    </g>
  );
}

/** Dashed container that groups other nodes. */
export function Group({ x, y, w, h, tone = 'gray', label, sub, active, dim, solid }) {
  return (
    <g className={`dg-group t-${tone} ${active ? 'is-active' : ''} ${dim ? 'is-dim' : ''} ${solid ? 'is-solid' : ''}`}>
      <rect x={x} y={y} width={w} height={h} rx={12} />
      {label && (
        <text x={x + 14} y={y + 22} className="dg-group-label">
          {label}
        </text>
      )}
      {sub && (
        <text x={x + w - 14} y={y + 22} textAnchor="end" className="dg-group-sub">
          {sub}
        </text>
      )}
    </g>
  );
}

/** Line with an arrowhead. `points` is [[x,y], ...]; corners are softly rounded. */
// variant: 'ok' draws a green allowed path; 'bad' a red path ending in an ✗ (blocked).
export function Arrow({
  points,
  label,
  labelAt = 0.5,
  labelDx = 0,
  labelDy = -7,
  hot,
  dashed,
  both,
  dim,
  variant,
  labelAnchor = 'middle',
}) {
  const uid = useContext(MarkerContext);
  const d = roundedPath(points, 8);
  const [lx, ly] = pointAlong(points, labelAt);
  const marker = `url(#${uid}-${variant ?? (hot ? 'h' : 'a')})`;
  return (
    <g className={`dg-arrow ${hot ? 'is-hot' : ''} ${variant ? `is-${variant}` : ''} ${dim ? 'is-dim' : ''}`}>
      <path d={d} className={dashed ? 'is-dashed' : ''} markerEnd={marker} markerStart={both ? marker : undefined} />
      {label && (
        <text x={lx + labelDx} y={ly + labelDy} textAnchor={labelAnchor} className="dg-arrow-label">
          {label}
        </text>
      )}
    </g>
  );
}

export function Label({ x, y, children, anchor = 'middle', size, muted, weight, mono, className = '' }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className={`dg-label ${muted ? 'is-muted' : ''} ${mono ? 'is-mono' : ''} ${className}`}
      style={{ fontSize: size, fontWeight: weight }}
    >
      {children}
    </text>
  );
}

/** Small numbered circle, used to mark steps on a diagram. */
export function Badge({ x, y, n, hot }) {
  return (
    <g className={`dg-badge ${hot ? 'is-hot' : ''}`}>
      <circle cx={x} cy={y} r={10} />
      <text x={x} y={y + 4} textAnchor="middle">
        {n}
      </text>
    </g>
  );
}

/* ---------- step-through helpers for animated / staged diagrams ---------- */

export function useStepper(count, initial = 0) {
  const [step, setStep] = useState(initial);
  return {
    step,
    setStep,
    next: () => setStep((s) => Math.min(s + 1, count - 1)),
    prev: () => setStep((s) => Math.max(s - 1, 0)),
    reset: () => setStep(initial),
    count,
  };
}

export function StepDots({ steps, active, onSelect, className = '' }) {
  const text = interfaceContent.Diagram.text;
  return (
    <div className={`step-dots ${className}`} role="group" aria-label={text.steps}>
      {steps.map((item, index) => (
        <button
          key={index}
          aria-pressed={index === active}
          aria-label={formatCopy(text.stepLabel, [index + 1, item.title])}
          className={index === active ? 'is-active' : index < active ? 'is-past' : ''}
          onClick={() => onSelect(index)}
        />
      ))}
    </div>
  );
}

export function StepControls({ stepper, steps }) {
  const { step, next, prev, reset, count, setStep } = stepper;
  const current = steps[step];
  const text = interfaceContent.Diagram.text;
  return (
    <div className="step-controls">
      <div className="step-text" aria-live="polite">
        <span className="step-index">{formatCopy(text.position, [step + 1, count])}</span>
        <strong key={`t-${step}`} className="step-swap">
          {current.title}
        </strong>
        {current.text && (
          <span key={`x-${step}`} className="step-swap">
            {current.text}
          </span>
        )}
      </div>
      <div className="step-buttons">
        <StepDots steps={steps} active={step} onSelect={setStep} />
        <button className="btn btn-sm" onClick={prev} disabled={step === 0} aria-label={text.previous}>
          <ChevronLeft size={14} />
        </button>
        {step < count - 1 ? (
          <button className="btn btn-sm btn-primary" onClick={next}>
            {text.next} <ChevronRight size={14} />
          </button>
        ) : (
          <button className="btn btn-sm" onClick={reset}>
            <RotateCcw size={13} /> {text.replay}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- geometry ---------- */

function roundedPath(input, r) {
  // Drop repeated points so corner maths never divides by zero.
  const pts = input.filter((p, i) => i === 0 || p[0] !== input[i - 1][0] || p[1] !== input[i - 1][1]);
  if (pts.length < 3) return `M${pts[0][0]} ${pts[0][1]} L${pts[1][0]} ${pts[1][1]}`;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const d1 = Math.hypot(cx - px, cy - py);
    const d2 = Math.hypot(nx - cx, ny - cy);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    const ax = cx - ((cx - px) / d1) * rr;
    const ay = cy - ((cy - py) / d1) * rr;
    const bx = cx + ((nx - cx) / d2) * rr;
    const by = cy + ((ny - cy) / d2) * rr;
    d += ` L${ax} ${ay} Q${cx} ${cy} ${bx} ${by}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${last[0]} ${last[1]}`;
}

function pointAlong(pts, t) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const len = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    segs.push(len);
    total += len;
  }
  let target = total * t;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const k = segs[i] ? target / segs[i] : 0;
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    target -= segs[i];
  }
  return pts[0];
}

/** Explanation panel shown under a clickable diagram. */
export function InfoPanel({ item, hint = 'Select any box in the diagram to learn what it does.' }) {
  return (
    <div className={`dg-info ${item ? `t-${item.tone ?? 'gray'}` : ''}`} aria-live="polite">
      {item ? (
        <>
          <p key={`t-${item.title}`} className="dg-info-title">
            {item.title}
          </p>
          <p key={`x-${item.title}`} className="dg-info-text">
            {item.text}
          </p>
        </>
      ) : (
        <p className="dg-info-hint">{hint}</p>
      )}
    </div>
  );
}
