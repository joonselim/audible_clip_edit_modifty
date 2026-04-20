'use client'

import { useEffect, useRef, useState } from 'react'
import {
  formatLongClock,
  oneSentenceRange,
  twoSentenceRange,
  paragraphRange
} from '@/lib/book'
import type { BookTranscript, ListenBook } from '@/lib/book'
import {
  MODE_LABEL,
  MODE_LABEL_FALLBACK,
  MODE_ORDER
} from './Player'
import type { Clip, ClipMode } from './Player'

/* ----------------------------------------------------------
 * EditClipScreen
 *
 * Mirrors the real Audible edit-clip screen (waveform + drag
 * handles + Current Position pin) and adds two layers:
 *   1. A three-way mode toggle at the top
 *      (1 sentence · 2 sentences · paragraph) that re-snaps the
 *      range to the matching semantic boundary.
 *   2. Boundary-aware labels *below* each handle — e.g.
 *      "start of paragraph", "end of sentence" — so the user
 *      understands what the snap corresponds to.
 *
 * When a title has no transcript, the mode toggle falls back to
 * approximate time windows (`~8s`, `~15s`, `~60s`) and no
 * boundary labels are shown — the waveform works on its own.
 * ----------------------------------------------------------*/

export function EditClipScreen({
  book,
  clip,
  isPreviewing,
  onPreview,
  onSave,
  onDelete,
  onClose
}: {
  book: ListenBook
  clip: Clip
  isPreviewing: boolean
  onPreview: (clipStart: number, clipEnd: number) => void
  onSave: (c: Clip) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [mode, setMode] = useState<ClipMode>(clip.mode)
  const [range, setRange] = useState({ start: clip.startTime, end: clip.endTime })
  const [label, setLabel] = useState(clip.label ?? '')
  const [note, setNote] = useState(clip.note ?? '')

  // "Current Position" is the playhead time captured when +Clip was pressed.
  // It's an independent anchor — it does NOT move when the user drags the
  // end handle or switches mode.
  const [anchorTime] = useState(clip.endTime)

  const hasTranscript = book.transcript.hasTranscript

  const switchMode = (next: ClipMode) => {
    if (next === mode) return
    if (hasTranscript) {
      // Snap to real sentence/paragraph boundaries so boundary labels appear.
      const t = book.transcript
      let r: { start: number; end: number }
      if (next === 'one-sentence')   r = oneSentenceRange(t, anchorTime)
      else if (next === 'two-sentences') r = twoSentenceRange(t, anchorTime)
      else                           r = paragraphRange(t, anchorTime)
      setRange({ start: r.start, end: r.end })
    } else {
      const fallback = { 'one-sentence': 8, 'two-sentences': 15, paragraph: 45 }
      setRange(r => ({ start: Math.max(0, r.end - fallback[next]), end: r.end }))
    }
    setMode(next)
  }

  const save = () => {
    onSave({
      ...clip,
      mode,
      startTime: range.start,
      endTime: range.end,
      label: label.trim() || undefined,
      note: note.trim() || undefined
    })
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col bg-ink text-neutral-100 fade-in-plain">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-2 -ml-2 text-neutral-200"
        >
          <XIcon />
        </button>
        <h3 className="text-[15px] font-semibold">Edit clip</h3>
        <button
          onClick={save}
          className="p-2 -mr-2 text-[14px] font-semibold text-white"
        >
          Save
        </button>
      </div>

      {/* Mode toggle */}
      <div className="px-4 pt-1 pb-3">
        <div className="flex rounded-full bg-panel2 p-1 text-[12px]">
          {MODE_ORDER.map(m => (
            <ModePill
              key={m}
              active={mode === m}
              onClick={() => switchMode(m)}
            >
              {hasTranscript ? MODE_LABEL[m] : MODE_LABEL_FALLBACK[m]}
            </ModePill>
          ))}
        </div>
      </div>

      {/* Chapter meta */}
      <div className="px-5 pb-2">
        <h2 className="text-[22px] font-bold leading-tight">{clip.chapterTitle}</h2>
        <p className="text-[13px] text-neutral-400">{book.title}</p>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">
        {!hasTranscript && <NoTranscriptNotice />}

        <WaveformPane
          start={range.start}
          end={range.end}
          anchorTime={anchorTime}
          onChange={next => setRange(next)}
          duration={book.chapter.duration}
          transcript={hasTranscript ? book.transcript : null}
        />

        {/* Time range */}
        <p className="mt-5 text-[14px] font-medium text-white">
          {formatLongClock(range.start)} – {formatLongClock(range.end)}
          <span className="ml-2 text-[13px] text-neutral-500">
            ({Math.round(range.end - range.start)}s)
          </span>
        </p>

        {/* Play button */}
        <div className="my-5 flex justify-center">
          <button
            onClick={() => onPreview(range.start, range.end)}
            aria-label={isPreviewing ? 'Pause preview' : 'Preview clip'}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-ink shadow-lg active:scale-95"
          >
            {isPreviewing ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>

        {/* Name */}
        <label className="block text-[13px] font-semibold">
          Clip name <span className="text-neutral-500">(optional)</span>
        </label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value.slice(0, 32))}
          placeholder="Label your clip so it's easier to find."
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-panel px-3 py-2.5 text-[14px] placeholder:text-neutral-500 focus:border-white/20 focus:outline-none"
        />
        <p className="mt-1 text-right text-[11px] text-neutral-500">
          {label.length} / 32
        </p>

        {/* Note */}
        <label className="mt-2 block text-[13px] font-semibold">
          Your note <span className="text-neutral-500">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Write a short description of your clip here."
          rows={3}
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-panel px-3 py-2.5 text-[14px] placeholder:text-neutral-500 focus:border-white/20 focus:outline-none"
        />

        {/* Delete */}
        <div className="mt-8 mb-4 flex justify-center">
          <button
            onClick={() => onDelete(clip.id)}
            className="text-[15px] font-semibold text-neutral-300 active:scale-95"
          >
            Delete clip
          </button>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------
 * Mode toggle pill
 * ----------------------------------------------------------*/
function ModePill({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full py-1.5 text-[12px] font-medium transition-colors ${
        active ? 'bg-white text-ink' : 'text-neutral-400'
      }`}
    >
      {children}
    </button>
  )
}

/* ----------------------------------------------------------
 * Waveform with boundary-aware labels
 *
 * Zoom rule: selection ≈ 50% of the visible window. After the user
 * finishes a handle drag, we wait 500 ms and then smoothly animate
 * `visibleWindow` (and re-center `windowStart`) so that a shorter
 * selection gets a zoomed-in view — making per-second adjustments
 * actually feasible. The user can also drag the faded (outside)
 * region to pan the window without re-triggering zoom.
 * ----------------------------------------------------------*/

const ZOOM_RATIO = 0.5 // selection target = 50% of visible window
const MIN_VISIBLE = 4 // seconds
const ZOOM_DELAY_MS = 500
const ZOOM_DURATION_MS = 300
const BARS_PER_SECOND = 2 // waveform density along the time axis

function targetWindowFor(selLen: number, duration: number) {
  return Math.max(MIN_VISIBLE, Math.min(duration, selLen / ZOOM_RATIO))
}
function clampWindowStart(ws: number, vw: number, duration: number) {
  return Math.max(0, Math.min(ws, Math.max(0, duration - vw)))
}

/* Deterministic bar height at a given integer index. Heights are stable
 * across zoom changes — a given second of audio always draws the same bar.
 * Uses a Mulberry-style scramble so consecutive indices don't form an
 * accidental visual pattern. */
function heightForBarIndex(i: number): number {
  let x = (i + 0x9e3779b9) | 0
  x = Math.imul(x ^ (x >>> 15), 2246822519) | 0
  x = Math.imul(x ^ (x >>> 13), 3266489917) | 0
  x = x ^ (x >>> 16)
  const n = (x >>> 0) / 0xffffffff
  return 0.25 + n * 0.75
}

/* Pick a human-friendly tick interval so we get ~4-6 labels on screen. */
function niceTickInterval(visibleSeconds: number): number {
  const raw = visibleSeconds / 5
  const choices = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600]
  for (const v of choices) {
    if (v >= raw) return v
  }
  return choices[choices.length - 1]
}

function formatTick(t: number): string {
  // Integer seconds for ranges inside a single minute, m:ss for longer ranges.
  if (t < 60) return String(Math.round(t))
  const m = Math.floor(t / 60)
  const s = Math.round(t % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

function WaveformPane({
  start,
  end,
  anchorTime,
  onChange,
  duration,
  transcript
}: {
  start: number
  end: number
  anchorTime: number
  onChange: (r: { start: number; end: number }) => void
  duration: number
  transcript: BookTranscript | null
}) {

  // Dynamic zoom window + pan offset.
  const [visibleWindow, setVisibleWindow] = useState(() =>
    targetWindowFor(end - start, duration)
  )
  const [windowStart, setWindowStart] = useState(() => {
    const vw = targetWindowFor(end - start, duration)
    return clampWindowStart((start + end) / 2 - vw / 2, vw, duration)
  })
  const windowEnd = windowStart + visibleWindow
  const pct = (t: number) => ((t - windowStart) / visibleWindow) * 100

  const containerRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'start' | 'end' | 'pan' | null>(null)
  const panOrigin = useRef<{ x: number; windowStart: number } | null>(null)
  const animRef = useRef<number | null>(null)
  const zoomTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const cancelAnim = () => {
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
    if (zoomTimerRef.current !== null) {
      clearTimeout(zoomTimerRef.current)
      zoomTimerRef.current = null
    }
  }

  const animateTo = (
    targetVW: number,
    targetWS: number,
    durationMs = ZOOM_DURATION_MS
  ) => {
    cancelAnim()
    const fromVW = visibleWindow
    const fromWS = windowStart
    if (Math.abs(targetVW - fromVW) < 0.1 && Math.abs(targetWS - fromWS) < 0.1) {
      return
    }
    const startTime = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setVisibleWindow(fromVW + (targetVW - fromVW) * eased)
      setWindowStart(fromWS + (targetWS - fromWS) * eased)
      if (t < 1) {
        animRef.current = requestAnimationFrame(tick)
      } else {
        animRef.current = null
      }
    }
    animRef.current = requestAnimationFrame(tick)
  }

  // Schedule zoom-to-fit after the user releases a handle.
  // Triggers whenever selection length changes and we're not mid-drag.
  const selLen = end - start
  useEffect(() => {
    if (isDragging) return
    const targetVW = targetWindowFor(selLen, duration)
    if (Math.abs(targetVW - visibleWindow) < 0.5) return
    cancelAnim()
    zoomTimerRef.current = setTimeout(() => {
      const targetWS = clampWindowStart(
        (start + end) / 2 - targetVW / 2,
        targetVW,
        duration
      )
      animateTo(targetVW, targetWS)
    }, ZOOM_DELAY_MS)
    return cancelAnim
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selLen, isDragging])

  useEffect(() => () => cancelAnim(), [])

  const onHandleDown = (side: 'start' | 'end') => (e: React.PointerEvent) => {
    e.stopPropagation()
    ;(e.target as Element).setPointerCapture(e.pointerId)
    cancelAnim()
    dragging.current = side
    setIsDragging(true)
  }
  const onBgPointerDown = (e: React.PointerEvent) => {
    // Only pan when the user grabs the faded (outside) area. If they land
    // on the selection or a handle, that child's onPointerDown wins.
    if (!containerRef.current) return
    ;(e.target as Element).setPointerCapture(e.pointerId)
    cancelAnim()
    dragging.current = 'pan'
    panOrigin.current = { x: e.clientX, windowStart }
    setIsDragging(true)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if (dragging.current === 'pan' && panOrigin.current) {
      const dx = e.clientX - panOrigin.current.x
      const dt = -(dx / rect.width) * visibleWindow
      setWindowStart(
        clampWindowStart(panOrigin.current.windowStart + dt, visibleWindow, duration)
      )
      return
    }
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const t = windowStart + ratio * visibleWindow
    if (dragging.current === 'start') {
      onChange({ start: Math.min(t, end - 1), end })
    } else if (dragging.current === 'end') {
      onChange({ start, end: Math.max(t, start + 1) })
    }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = null
    panOrigin.current = null
    setIsDragging(false)
    ;(e.target as Element).releasePointerCapture?.(e.pointerId)
  }

  // Labels only appear when the handle is within ±0.6 s of a real sentence
  // boundary — so dragging away from a boundary hides the label.
  const TOLERANCE = 0.6
  const startLabel = transcript?.sentences.some(s => Math.abs(s.startTime - start) <= TOLERANCE)
    ? 'start of sentence' : null
  const endLabel = transcript?.sentences.some(s => Math.abs(s.endTime - end) <= TOLERANCE)
    ? 'end of sentence' : null

  // Bars are anchored to absolute time, so zooming in spaces them apart.
  const firstBarIdx = Math.max(0, Math.floor(windowStart * BARS_PER_SECOND) - 1)
  const lastBarIdx = Math.min(
    Math.ceil(duration * BARS_PER_SECOND),
    Math.ceil(windowEnd * BARS_PER_SECOND) + 1
  )
  const barIndices: number[] = []
  for (let i = firstBarIdx; i <= lastBarIdx; i++) barIndices.push(i)

  // Time-ruler ticks — integer multiples of a zoom-adaptive interval.
  const tickInterval = niceTickInterval(visibleWindow)
  const firstTick = Math.ceil(windowStart / tickInterval) * tickInterval
  const ticks: number[] = []
  for (let t = firstTick; t <= windowEnd + 0.001; t += tickInterval) {
    if (t >= 0 && t <= duration) ticks.push(t)
  }

  // Current Position label is rendered *outside* the waveform's
  // overflow-hidden container so it's never clipped. If the anchor is
  // outside the visible window we still show the label pinned to the
  // nearest edge — it's meant to always be visible as an anchor indicator.
  const anchorRawPct = pct(anchorTime)
  const anchorClampedPct = Math.max(0, Math.min(100, anchorRawPct))
  const anchorInView = anchorRawPct >= 0 && anchorRawPct <= 100
  const anchorTranslateX =
    anchorClampedPct < 12 ? '0%' : anchorClampedPct > 88 ? '-100%' : '-50%'

  return (
    <div className="relative mt-4 pb-8">
      {/* Current Position label — always rendered, clamped to the edges
          when the anchor sits outside the visible window. */}
      <div className="relative h-7">
        <div
          className="pointer-events-none absolute bottom-0 flex flex-col items-center text-[11px] italic text-neutral-200"
          style={{
            left: `${anchorClampedPct}%`,
            transform: `translateX(${anchorTranslateX})`
          }}
        >
          <span className="whitespace-nowrap font-serif">Current Position</span>
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-white" />
        </div>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onBgPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-32 touch-none select-none cursor-grab active:cursor-grabbing overflow-hidden"
      >
        {/* Bars positioned by absolute time — sparser when zoomed in,
            denser when zoomed out. */}
        {barIndices.map(i => {
          const t = i / BARS_PER_SECOND
          const h = heightForBarIndex(i)
          const inside = t >= start && t <= end
          return (
            <span
              key={i}
              className={`pointer-events-none absolute top-1/2 w-[3px] rounded-full ${
                inside ? 'bg-sky-300' : 'bg-sky-500/30'
              }`}
              style={{
                left: `${pct(t)}%`,
                height: `${h * 100}%`,
                transform: `translate(-50%, -50%)`
              }}
            />
          )
        })}

        {/* Selection overlay — swallows pointerdown so panning only starts
            when the user grabs the faded (outside) area. */}
        <div
          onPointerDown={e => e.stopPropagation()}
          className="absolute inset-y-0 border-x-2 border-sky-300/70 bg-sky-400/10"
          style={{ left: `${pct(start)}%`, width: `${pct(end) - pct(start)}%` }}
        />

        {/* Handles */}
        <div
          className="absolute top-1/2 -translate-y-1/2 flex h-10 w-5 cursor-ew-resize items-center justify-center rounded bg-sky-300 text-ink shadow-md"
          style={{ left: `calc(${pct(start)}% - 10px)` }}
          onPointerDown={onHandleDown('start')}
        >
          <HandleChevron flip={false} />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 flex h-10 w-5 cursor-ew-resize items-center justify-center rounded bg-sky-300 text-ink shadow-md"
          style={{ left: `calc(${pct(end)}% - 10px)` }}
          onPointerDown={onHandleDown('end')}
        >
          <HandleChevron flip />
        </div>

        {/* Current Position — vertical line only runs through the waveform
            when the anchor is in view. The text label lives outside the
            overflow-hidden container so it's never clipped. */}
        {anchorInView && (
          <div
            className="pointer-events-none absolute inset-y-0 w-px bg-white/60"
            style={{ left: `${anchorRawPct}%` }}
          />
        )}
      </div>

      {/* Time ruler — second markers that adapt to the current zoom.
          Short window → every 1-2 s. Long window → every 30 s or minute. */}
      <div className="relative mt-2 h-4">
        {ticks.map(t => (
          <div
            key={t}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${pct(t)}%`, transform: 'translateX(-50%)' }}
          >
            <span className="h-1.5 w-px bg-neutral-500" />
            <span className="mt-0.5 text-[10px] tabular-nums text-neutral-400">
              {formatTick(t)}
            </span>
          </div>
        ))}
      </div>

      {/* Boundary labels BELOW the waveform, aligned with each handle.
          Intentionally distinct from "Current Position" above, so the
          user can tell the difference between *where I tapped* and
          *what semantic boundary this handle snaps to*.

          When the two labels would overlap horizontally (short clip),
          we stagger them vertically — start on top, end below. */}
      {(() => {
        if (!startLabel && !endLabel) return null
        const bothPresent = !!startLabel && !!endLabel
        const handlesClose = bothPresent && pct(end) - pct(start) < 32
        return (
          <div className={`relative mt-2 ${handlesClose ? 'h-16' : 'h-8'}`}>
            {startLabel && (
              <BoundaryTag
                left={pct(start)}
                row={0}
                align={pct(start) < 15 ? 'left' : 'center'}
              >
                {startLabel}
              </BoundaryTag>
            )}
            {endLabel && (
              <BoundaryTag
                left={pct(end)}
                row={handlesClose ? 1 : 0}
                align={pct(end) > 85 ? 'right' : 'center'}
              >
                {endLabel}
              </BoundaryTag>
            )}
          </div>
        )
      })()}
    </div>
  )
}

function BoundaryTag({
  left,
  row,
  align,
  children
}: {
  left: number
  row: 0 | 1
  align: 'left' | 'center' | 'right'
  children: React.ReactNode
}) {
  const translate =
    align === 'left' ? '0' : align === 'right' ? '-100%' : '-50%'
  // row 0: label sits right below the waveform.
  // row 1: label sits further below, with a longer connector reaching up.
  return (
    <div
      className="absolute top-0 flex flex-col items-center"
      style={{ left: `${left}%`, transform: `translateX(${translate})` }}
    >
      <span
        className="w-px bg-amber/40"
        style={{ height: row === 0 ? 8 : 40 }}
      />
      <span className="mt-1 whitespace-nowrap rounded-full border border-amber/40 bg-amber/10 px-2 py-0.5 text-[10px] font-medium text-amber">
        {children}
      </span>
    </div>
  )
}


/* ----------------------------------------------------------
 * Misc
 * ----------------------------------------------------------*/

function NoTranscriptNotice() {
  return (
    <div className="mb-3 rounded-lg border border-white/5 bg-panel px-3 py-2 text-[12px] text-neutral-400">
      <span className="mr-1 text-neutral-300">ⓘ</span>
      Transcript not available for this title — using a time window.
    </div>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
function PlayIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor">
      <path d="M2 1l14 8-14 8V1z" />
    </svg>
  )
}
function PauseIcon() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="currentColor">
      <rect x="2" y="1" width="4" height="16" rx="1" />
      <rect x="10" y="1" width="4" height="16" rx="1" />
    </svg>
  )
}
function HandleChevron({ flip }: { flip: boolean }) {
  return (
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      <path
        d="M5.5 1.5L1.5 6l4 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
