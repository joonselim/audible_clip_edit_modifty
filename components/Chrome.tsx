'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookCover } from './BookCover'
import { dune } from '@/lib/book'

export function StatusBar({ time = '6:49' }: { time?: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[12px] font-medium text-neutral-200">
      <span>{time}</span>
      <div className="flex items-center gap-1.5 text-neutral-400">
        <span className="text-[10px]">•••</span>
        <span className="text-[10px]">📶</span>
        <span className="rounded-sm bg-amber px-1 text-[9px] font-bold text-ink">34</span>
      </div>
    </div>
  )
}

export function AudibleLogo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-[18px] font-semibold text-white tracking-tight">audible</span>
      <svg width="18" height="12" viewBox="0 0 24 16" fill="none">
        <path d="M1 12 C 8 4, 16 4, 23 12" stroke="#ffb400" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M4 14 C 9 9, 15 9, 20 14" stroke="#ffb400" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6" />
      </svg>
    </div>
  )
}

export function MiniPlayer() {
  return (
    <Link
      href="/player"
      className="flex items-center gap-3 border-t border-hair/80 bg-ink px-4 py-2"
    >
      <BookCover
        id={dune.id}
        title="Dune"
        size="sm"
        className="h-11 w-11 flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-neutral-100">
          {dune.title} | {dune.chapter.title}
        </p>
        <p className="text-[11px] text-neutral-500">{dune.timeLeft}</p>
      </div>
      <button
        onClick={e => e.preventDefault()}
        aria-label="Back 30"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-500/70 text-neutral-300 active:scale-95"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 5V2L8 5l4 3V6a6 6 0 1 1-6 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute text-[9px] font-bold">30</span>
      </button>
      <button
        onClick={e => e.preventDefault()}
        aria-label="Play"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink active:scale-95"
      >
        <svg width="12" height="14" viewBox="0 0 14 16" fill="currentColor">
          <path d="M1 1l12 7-12 7V1z" />
        </svg>
      </button>
    </Link>
  )
}

type Tab = {
  href: string
  label: 'Home' | 'Library' | 'Discover' | 'Profile' | 'Join'
}

const tabs: Tab[] = [
  { href: '/home', label: 'Home' },
  { href: '/library', label: 'Library' },
  { href: '/discover', label: 'Discover' },
  { href: '/profile', label: 'Profile' },
  { href: '/join', label: 'Join' }
]

export function BottomTabs() {
  const path = usePathname()
  return (
    <nav className="flex items-center justify-around bg-ink pt-2 pb-4">
      {tabs.map(t => {
        const active = path?.startsWith(t.href)
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-1 flex-col items-center gap-0.5 ${
              active ? 'text-white' : 'text-neutral-400'
            }`}
          >
            <TabIcon label={t.label} active={!!active} />
            <span className={`text-[10px] ${active ? 'font-semibold' : ''}`}>
              {t.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function TabIcon({
  label,
  active
}: {
  label: Tab['label']
  active: boolean
}) {
  const stroke = active ? 'currentColor' : 'currentColor'
  const fill = active ? 'currentColor' : 'none'
  switch (label) {
    case 'Home':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={fill}>
          <path
            d="M3 11L12 4l9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z"
            stroke={stroke}
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill={active ? 'currentColor' : 'none'}
          />
        </svg>
      )
    case 'Library':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M5 4v16M10 4v16M15 4v16M19 5l1 15" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
        </svg>
      )
    case 'Discover':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" fill={active ? 'currentColor' : 'none'} />
          <path d="M10 9l5 3-5 3V9z" fill={active ? '#0d1117' : 'currentColor'} />
        </svg>
      )
    case 'Profile':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={fill}>
          <circle cx="12" cy="8" r="4" stroke={stroke} strokeWidth="1.6" fill={active ? 'currentColor' : 'none'} />
          <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      )
    case 'Join':
      return (
        <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
          <path d="M1 12 C 8 4, 16 4, 23 12" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} fill="none" strokeLinecap="round" />
          <path d="M4 14 C 9 9, 15 9, 20 14" stroke="currentColor" strokeWidth={active ? 1.6 : 1.3} fill="none" strokeLinecap="round" opacity="0.65" />
        </svg>
      )
  }
}

/**
 * Shared wrapper that gives a tabbed page the correct height,
 * a scrollable content area, and the fixed mini player + bottom tabs.
 */
export function TabbedScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col bg-ink text-neutral-200">
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      <MiniPlayer />
      <BottomTabs />
    </div>
  )
}
