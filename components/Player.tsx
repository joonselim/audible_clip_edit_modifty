'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  formatLongClock,
  oneSentenceRange,
  paragraphRange,
  prideAndPrejudice,
  twoSentenceRange
} from '@/lib/book'
import type { BookTranscript, ListenBook } from '@/lib/book'
import { EditClipScreen } from './EditClipScreen'

/* ----------------------------------------------------------
 * Types shared with EditClipScreen
 * ----------------------------------------------------------*/

export type ClipMode = 'one-sentence' | 'two-sentences' | 'paragraph'

export const MODE_ORDER: ClipMode[] = [
  'one-sentence',
  'two-sentences'
]

export const MODE_LABEL: Record<ClipMode, string> = {
  'one-sentence': '1 sentence',
  'two-sentences': '2 sentences',
  paragraph: 'paragraph'
}

/** Approximate time-window labels when no transcript is available. */
export const MODE_LABEL_FALLBACK: Record<ClipMode, string> = {
  'one-sentence': '~8s',
  'two-sentences': '~15s',
  paragraph: '~60s'
}

export interface Clip {
  id: string
  chapterId: string
  chapterTitle: string
  bookTitle: string
  mode: ClipMode
  startTime: number
  endTime: number
  createdAt: number
  label?: string
  note?: string
}

const DEFAULT_MODE: ClipMode = 'two-sentences'
const START_TIME = 90

/* ----------------------------------------------------------
 * Player
 * ----------------------------------------------------------*/

export function Player() {
  const book = prideAndPrejudice
  const { transcript } = book

  const [currentTime, setCurrentTime] = useState(START_TIME)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [mode, setMode] = useState<ClipMode>(DEFAULT_MODE)
  const [clips, setClips] = useState<Clip[]>([])
  const [toastClipId, setToastClipId] = useState<string | null>(null)
  const [editingClipId, setEditingClipId] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playBtnRef = useRef<HTMLButtonElement | null>(null)
  // When this is set, playback auto-pauses the moment audio.currentTime
  // reaches it — used to stop clip preview playback at the clip's end.
  const previewEndRef = useRef<number | null>(null)

  /* ----- Audio setup (runs once on mount) -----
   * Seek to START_TIME first, then attempt autoplay. Doing this in a
   * single effect guarantees seek happens before play() is called. */
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = START_TIME
    const onTime = () => {
      setCurrentTime(a.currentTime)
      if (
        previewEndRef.current !== null &&
        a.currentTime >= previewEndRef.current
      ) {
        previewEndRef.current = null
        a.pause()
        setIsPreviewing(false)
        setIsPlaying(false)
      }
    }
    const onEnded = () => {
      previewEndRef.current = null
      setIsPreviewing(false)
      setIsPlaying(false)
    }
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('ended', onEnded)
    // Kick off autoplay after seeking.
    // Don't set isPlaying(false) on rejection — keeps the fallback gesture
    // listener active so the first user tap starts audio.
    a.play().catch(() => {})
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('ended', onEnded)
    }
  }, [])

  /* ----- Playback clock -----
   * Subsequent play/pause toggles come through here.
   * Mocks without audioSrc fall back to a 1-Hz synthetic clock. */
  useEffect(() => {
    const a = audioRef.current
    if (a) {
      if (isPlaying) {
        const p = a.play()
        if (p && typeof p.catch === 'function') {
          p.catch(() => setIsPlaying(false))
        }
      } else {
        a.pause()
      }
      return
    }
    if (!isPlaying) return
    const id = window.setInterval(() => {
      setCurrentTime(t => Math.min(t + 1, book.chapter.duration))
    }, 1000)
    return () => window.clearInterval(id)
  }, [isPlaying, book.chapter.duration])

  /* Autoplay fallback — if the browser blocked initial play() (common
   * on Safari / mobile), the very next user gesture anywhere on the
   * document kicks it off. The listener removes itself as soon as
   * playback starts. */
  useEffect(() => {
    const a = audioRef.current
    if (!a || !isPlaying) return
    if (!a.paused) return
    const kick = () => {
      a.play()
        .then(() => cleanup())
        .catch(() => {})
    }
    const cleanup = () => {
      document.removeEventListener('pointerdown', kick)
      document.removeEventListener('keydown', kick)
    }
    document.addEventListener('pointerdown', kick, { once: false })
    document.addEventListener('keydown', kick, { once: false })
    return cleanup
  }, [isPlaying])

  /* ----- Clip computation ----- */
  const computeClipRange = useCallback(
    (m: ClipMode, tapTime: number) => {
      if (m === 'one-sentence') {
        const r = oneSentenceRange(transcript, tapTime)
        return { start: r.start, end: r.end }
      }
      if (m === 'two-sentences') {
        const r = twoSentenceRange(transcript, tapTime)
        return { start: r.start, end: r.end }
      }
      const r = paragraphRange(transcript, tapTime)
      return { start: r.start, end: r.end }
    },
    [transcript]
  )

  /* ----- Save a new clip from +Clip ----- */
  const saveClip = useCallback(() => {
    const range = computeClipRange(mode, currentTime)
    const clip: Clip = {
      id: `c-${Date.now()}`,
      chapterId: book.chapter.id,
      chapterTitle: book.chapter.title,
      bookTitle: book.title,
      mode,
      startTime: range.start,
      endTime: range.end,
      createdAt: Date.now()
    }
    setClips(list => [clip, ...list])
    setToastClipId(clip.id)
  }, [computeClipRange, mode, currentTime, book])

  /* ----- Toast auto-dismiss ----- */
  useEffect(() => {
    if (!toastClipId) return
    const t = window.setTimeout(() => setToastClipId(null), 4000)
    return () => window.clearTimeout(t)
  }, [toastClipId])

  /* ----- Hint dismiss on click anywhere except the play button ----- */
  useEffect(() => {
    if (!showHint) return
    const dismiss = (e: MouseEvent) => {
      if (playBtnRef.current?.contains(e.target as Node)) return
      setShowHint(false)
    }
    document.addEventListener('click', dismiss)
    return () => document.removeEventListener('click', dismiss)
  }, [showHint])

  /* ----- Toast actions ----- */
  const widen = (direction: 'expand' | 'shrink') => {
    const clip = clips.find(c => c.id === toastClipId)
    if (!clip) return
    const currentIdx = MODE_ORDER.indexOf(clip.mode)
    const nextIdx =
      direction === 'expand'
        ? Math.min(MODE_ORDER.length - 1, currentIdx + 1)
        : Math.max(0, currentIdx - 1)
    if (nextIdx === currentIdx) return
    const nextMode = MODE_ORDER[nextIdx]
    const range = computeClipRange(nextMode, clip.endTime)
    setClips(list =>
      list.map(c =>
        c.id === clip.id
          ? { ...c, mode: nextMode, startTime: range.start, endTime: range.end }
          : c
      )
    )
  }

  /* ----- Save from Edit ----- */
  const commitEdit = (updated: Clip) => {
    setClips(list => list.map(c => (c.id === updated.id ? updated : c)))
    setEditingClipId(null)
  }

  const deleteClip = (id: string) => {
    setClips(list => list.filter(c => c.id !== id))
    setEditingClipId(null)
    setToastClipId(null)
  }

  /* Preview the current clip range from the Edit screen. Pressing the
   * preview button toggles playback — on, we seek to clip.start and
   * play up to clip.end (at which point the timeupdate handler auto-
   * pauses). On, off again stops immediately. */
  const togglePreview = useCallback(
    (clipStart: number, clipEnd: number) => {
      const a = audioRef.current
      if (!a) return
      if (isPreviewing) {
        previewEndRef.current = null
        a.pause()
        setIsPreviewing(false)
        setIsPlaying(false)
        return
      }
      a.currentTime = clipStart
      previewEndRef.current = clipEnd
      setIsPreviewing(true)
      setIsPlaying(true)
    },
    [isPreviewing]
  )

  /* ----- Derived UI state ----- */
  const remaining = Math.max(0, book.chapter.duration - currentTime)
  const progressPct = (currentTime / book.chapter.duration) * 100
  const toastClip = clips.find(c => c.id === toastClipId) ?? null
  const editingClip = clips.find(c => c.id === editingClipId) ?? null

  return (
    <div className="relative flex h-full flex-col bg-ink text-neutral-100">
      {book.audioSrc && (
        <audio
          ref={audioRef}
          src={book.audioSrc}
          preload="auto"
          autoPlay
          className="hidden"
        />
      )}

      {/* Ambient backdrop — the real Audible player has a pronounced
          light gray-blue atmosphere behind the cover that fades into ink
          by roughly the halfway mark. Two layers so the top band reads
          as genuine mist rather than a flat tint. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(165,180,200,0.75) 0%, rgba(120,135,160,0.55) 12%, rgba(70,90,115,0.3) 28%, rgba(30,41,59,0.12) 42%, rgba(13,17,23,0) 58%)'
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% -5%, rgba(200,215,230,0.35) 0%, rgba(148,163,184,0) 60%)'
        }}
      />

      {/* Top nav */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-1 text-neutral-200">
        <Link
          href="/home"
          aria-label="Close player"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
        >
          <ChevronDown />
        </Link>
        <div className="flex items-center gap-2">
          <IconButton label="Share">
            <ShareIcon />
          </IconButton>
          <IconButton label="Cast">
            <CastIcon />
          </IconButton>
          <IconButton label="More">
            <MoreIcon />
          </IconButton>
        </div>
      </div>

      {/* Cover art */}
      <div className="relative z-10 mx-auto mt-3 w-[68%] aspect-square">
        <div
          className="relative h-full w-full overflow-hidden rounded-md shadow-2xl shadow-black/60 ring-1 ring-white/5"
          style={{
            background:
              'linear-gradient(180deg, #e5e7eb 0%, #cbd5e1 32%, #94a3b8 62%, #475569 100%)'
          }}
        >
          {/* Title at top of cover */}
          <p className="absolute inset-x-0 top-[10%] text-center text-[10px] font-light tracking-[0.22em] text-ink/75">
            {book.title.toUpperCase()}
          </p>
          {/* Author + narrator at bottom */}
          <div className="absolute inset-x-0 bottom-[14%] text-center">
            <h2
              className="font-serif text-[17px] font-bold leading-tight tracking-[0.06em] text-white"
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.25)' }}
            >
              {book.author.toUpperCase()}
            </h2>
            {book.subtitle && (
              <p className="mt-1.5 text-[8.5px] italic text-white/85">
                {book.subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Large breathing gap between cover and chapter meta — the real
          Audible player has a pronounced empty-space moment here. */}
      <div className="flex-1 min-h-[24px]" />

      {/* Chapter + pill buttons */}
      <div className="relative z-10 px-5">
        <div className="flex items-center gap-2.5 text-neutral-100">
          <ChaptersIcon />
          <span className="text-[21px] font-bold">{book.chapter.title}</span>
        </div>
        <div className="mt-3.5 flex gap-2">
          <Pill>Clips &amp; notes</Pill>
          <Pill>Title Details</Pill>
          <Pill>Listen log</Pill>
        </div>
      </div>

      {/* Progress bar — thicker, no handle dot (matches real Audible) */}
      <div className="relative z-10 mt-6 px-5">
        <div className="relative h-[4px] overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-amber"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-400">
          <span>{formatLongClock(currentTime)}</span>
          <span>{book.bookTimeLeftLabel}</span>
          <span>-{formatLongClock(remaining)}</span>
        </div>
      </div>

      {/* Transport */}
      <div className="relative z-10 mt-5 flex items-center justify-center gap-6 px-5">
        <button aria-label="Previous chapter" className="text-neutral-200 active:scale-95">
          <TransportPrev />
        </button>
        <button
          aria-label="Back 30 seconds"
          onClick={() => setCurrentTime(t => Math.max(0, t - 30))}
          className="text-neutral-200 active:scale-95"
        >
          <Back30 />
        </button>
        <button
          ref={playBtnRef}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onClick={() => setIsPlaying(p => !p)}
          className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-white text-ink shadow-lg active:scale-95"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          aria-label="Forward 30 seconds"
          onClick={() => setCurrentTime(t => Math.min(book.chapter.duration, t + 30))}
          className="text-neutral-200 active:scale-95"
        >
          <Fwd30 />
        </button>
        <button aria-label="Next chapter" className="text-neutral-200 active:scale-95">
          <TransportNext />
        </button>
      </div>

      {/* Small bottom spacer before tray */}
      <div className="flex-1 min-h-[8px] max-h-[48px]" />

      {/* Bottom tray */}
      <div className="relative z-10 flex items-start justify-between px-6 pt-3 pb-5">
        <TrayButton icon={<SpeedIcon />} sub="Speed" />
        <TrayButton icon={<CarIcon />} sub="Car Mode" />
        <TrayButton icon={<TimerIcon />} sub="Timer" />
        <TrayButton icon={<ClipIcon />} sub="+ Clip" onClick={saveClip} />
      </div>

      {/* Clip toast */}
      {toastClip && !editingClip && (
        <ClipToast
          clip={toastClip}
          transcript={transcript}
          onShrink={() => widen('shrink')}
          onExpand={() => widen('expand')}
          onEdit={() => setEditingClipId(toastClip.id)}
          onClose={() => setToastClipId(null)}
        />
      )}

      {/* Onboarding hint — dismisses on any click except [data-nohint] */}
      {showHint && (
        <div className="absolute bottom-[76px] right-4 z-30 pointer-events-none">
          <div className="relative rounded-2xl bg-panel/70 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm">
            <p className="text-[13.5px] font-semibold text-neutral-100 whitespace-nowrap">
              Try clipping! ✂️
            </p>
            <div className="absolute -bottom-[5px] right-[28px] h-[10px] w-[10px] rotate-45 bg-[#161b22] ring-1 ring-white/10" />
          </div>
        </div>
      )}

      {/* Edit overlay */}
      {editingClip && (
        <EditClipScreen
          book={book as ListenBook}
          clip={editingClip}
          isPreviewing={isPreviewing}
          onPreview={togglePreview}
          onSave={commitEdit}
          onDelete={deleteClip}
          onClose={() => {
            previewEndRef.current = null
            setIsPreviewing(false)
            setEditingClipId(null)
          }}
        />
      )}
    </div>
  )
}

/* ----------------------------------------------------------
 * ClipToast
 * ----------------------------------------------------------*/

function ClipToast({
  clip,
  transcript,
  onShrink,
  onExpand,
  onEdit,
  onClose
}: {
  clip: Clip
  transcript: BookTranscript
  onShrink: () => void
  onExpand: () => void
  onEdit: () => void
  onClose: () => void
}) {
  const label = transcript.hasTranscript
    ? MODE_LABEL[clip.mode]
    : MODE_LABEL_FALLBACK[clip.mode]

  return (
    <div
      onClick={onClose}
      className="absolute inset-x-3 bottom-[92px] z-20 rounded-full bg-white/95 text-ink shadow-2xl shadow-black/60 backdrop-blur fade-in-plain"
    >
      <div
        className="flex items-center gap-2 px-2.5 py-2"
        onClick={e => e.stopPropagation()}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <CheckIcon />
        </span>
        <p className="flex-1 min-w-0 truncate text-[12.5px] font-semibold">
          Clip saved
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <ModeChip
            active={clip.mode === 'one-sentence'}
            onClick={onShrink}
            aria-label="1 sentence"
          >
            1 sent
          </ModeChip>
          <ModeChip
            active={clip.mode === 'two-sentences'}
            onClick={onExpand}
            aria-label="2 sentences"
          >
            2 sent
          </ModeChip>
        </div>
        <button
          onClick={onEdit}
          className="shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-semibold text-white active:scale-95"
        >
          Edit
        </button>
      </div>
    </div>
  )
}

function ModeChip({
  active,
  onClick,
  children,
  ...rest
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
} & React.ComponentProps<'button'>) {
  return (
    <button
      onClick={onClick}
      className={`flex h-7 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold leading-none active:scale-95 transition-colors ${
        active
          ? 'bg-ink text-white'
          : 'border border-black/10 text-neutral-400 hover:bg-black/5'
      }`}
      {...rest}
    >
      {children}
    </button>
  )
}

/* ----------------------------------------------------------
 * Sub-components
 * ----------------------------------------------------------*/

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#24304a] bg-transparent px-4 py-1.5 text-[12.5px] text-neutral-100">
      {children}
    </span>
  )
}

function IconButton({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-neutral-200"
    >
      {children}
    </button>
  )
}

function TrayButton({
  icon,
  sub,
  onClick
}: {
  icon: React.ReactNode
  sub: string
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-[70px] flex-col items-center gap-1.5 text-neutral-200 active:scale-95"
    >
      <span className="flex h-7 w-7 items-center justify-center">{icon}</span>
      <span className="text-[11px] text-neutral-400 leading-none">{sub}</span>
    </button>
  )
}

/* --- Icons --- */

function ChevronDown() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v12M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function CastIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7v10M20 7v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  )
}
function ChaptersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
function TransportPrev() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zM20 6L10 12l10 6V6z" />
    </svg>
  )
}
function TransportNext() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6h2v12h-2zM4 6l10 6-10 6V6z" />
    </svg>
  )
}
function Back30() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <path
          d="M17 6V2L11 6l6 4V8a9 9 0 1 1-9 9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="absolute text-[10px] font-bold">30</span>
    </div>
  )
}
function Fwd30() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
        <path
          d="M17 6V2l6 4-6 4V8a9 9 0 1 0 9 9"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="absolute text-[10px] font-bold">30</span>
    </div>
  )
}
function PlayIcon() {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="currentColor">
      <path d="M2 1l18 10-18 10V1z" />
    </svg>
  )
}
function PauseIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor">
      <rect x="1" y="1" width="4.5" height="18" rx="1" />
      <rect x="10.5" y="1" width="4.5" height="18" rx="1" />
    </svg>
  )
}
function SpeedIcon() {
  return (
    <span className="text-[14px] font-semibold">1.0×</span>
  )
}
function CarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M5 17V11l2-5h10l2 5v6M5 17h14M7 17v2M17 17v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="14" r="0.8" fill="currentColor" />
      <circle cx="16" cy="14" r="0.8" fill="currentColor" />
    </svg>
  )
}
function TimerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="13" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9v4l3 2M9 3h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function ClipIcon() {
  // Bookmark with a plus — matches the real "+ Clip" icon on Audible.
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4V4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 7v6M9 10h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
