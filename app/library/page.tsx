'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TabbedScreen } from '@/components/Chrome'
import { BookCover } from '@/components/BookCover'
import { audiobooks, dune } from '@/lib/book'

type LibTab = 'Listen' | 'Audiobooks' | 'Lists'

export default function LibraryPage() {
  const [tab, setTab] = useState<LibTab>('Listen')
  return (
    <TabbedScreen>
      <header className="flex items-center justify-end px-5 pt-3 pb-2">
        <button aria-label="Search" className="p-1 text-neutral-200">
          <SearchIcon />
        </button>
      </header>

      <div className="flex items-center gap-6 border-b border-hair/80 px-5">
        {(['Listen', 'Audiobooks', 'Lists'] as const).map(t => {
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative py-3 text-[15px] ${
                active ? 'font-semibold text-white' : 'text-neutral-400'
              }`}
            >
              {t}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-sky-500" />
              )}
            </button>
          )
        })}
      </div>

      {tab === 'Listen' && <ListenPane />}
      {tab === 'Audiobooks' && <AudiobooksPane />}
      {tab === 'Lists' && <ListsPane />}
    </TabbedScreen>
  )
}

function ListenPane() {
  const continueBooks = [
    { ...dune, author: 'Frank Herbert', timeLeft: '9h 8m left', progress: 0.41, readListen: true },
    {
      id: 'a-promised-land',
      title: 'A Promised Land',
      author: 'Barack Obama',
      timeLeft: '28h 28m left',
      progress: 0.07,
      readListen: false
    }
  ]
  return (
    <div className="px-5 pb-4">
      <div className="mt-4 rounded-xl border border-white/5 bg-panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[15px] font-semibold text-white">Continue listening</p>
          <span className="text-neutral-500">›</span>
        </div>
        {continueBooks.map(b => (
          <Link
            key={b.id}
            href={b.id === 'dune' ? '/player' : '#'}
            className="flex items-center gap-3 py-2"
          >
            <BookCover id={b.id} title={b.title.split(' ')[0]} size="sm" className="h-[56px] w-[56px] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="truncate text-[14px] font-semibold text-white">{b.title}</p>
              <p className="truncate text-[12px] text-neutral-400">By {b.author}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-amber" style={{ width: `${b.progress * 100}%` }} />
                </div>
                <span className="whitespace-nowrap text-[11px] text-neutral-400">{b.timeLeft}</span>
              </div>
              {b.readListen && (
                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold tracking-wide text-sky-400">
                  <WaveIcon /> READ &amp; LISTEN
                </div>
              )}
            </div>
            <button
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-neutral-500 text-neutral-200"
              aria-label="Play"
              onClick={e => e.preventDefault()}
            >
              <svg width="9" height="11" viewBox="0 0 10 12" fill="currentColor">
                <path d="M1 1l8 5-8 5V1z" />
              </svg>
            </button>
          </Link>
        ))}
      </div>

      <ListRow label="Downloaded" trailing={<span className="text-neutral-400">5</span>} />
      <ListRow label="Series" icon={<GridIcon />} />
      <ListRow label="Authors" icon={<PersonIcon />} />
      <ListRow label="Podcasts" icon={<MicIcon />} />
    </div>
  )
}

function ListRow({
  label,
  trailing,
  icon
}: {
  label: string
  trailing?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <Link
      href="#"
      className="mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-panel px-4 py-4"
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-neutral-300">{icon}</span>}
        <span className="text-[15px] font-medium text-white">{label}</span>
      </div>
      {trailing ?? <span className="text-neutral-500">›</span>}
    </Link>
  )
}

function AudiobooksPane() {
  const chips = ['Filter', 'Not Started', 'In Progress', 'Finished'] as const
  const titles = audiobooks.slice(0, 5)
  return (
    <div className="px-5 pb-4">
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {chips.map((c, i) => (
          <button
            key={c}
            className="flex items-center gap-1 whitespace-nowrap rounded-full border border-neutral-700 px-3 py-1.5 text-[12px] text-neutral-200"
          >
            {i === 0 && <FilterIcon />}
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[13px] text-neutral-300">
        <span>{titles.length} titles</span>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-neutral-300">
            <ListIcon /> List
          </button>
          <button className="flex items-center gap-1 text-neutral-300">
            <SortIcon /> Recent activity
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {titles.map(b => (
          <Link key={b.id} href="#" className="flex flex-col">
            <BookCover
              id={b.id}
              title={b.title.split(' ').slice(0, 2).join(' ')}
              author={b.author.toUpperCase()}
              size="md"
              className="aspect-square w-full"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}

function ListsPane() {
  return (
    <div className="px-5 pb-4">
      <p className="mt-4 text-[13px] text-neutral-400">6 lists</p>
      <h3 className="mt-3 text-[20px] font-semibold text-white">Lists from Library</h3>
      <div className="mt-3 space-y-3">
        <ListTile label="Series" icon={<GridIcon />} />
        <ListTile label="Genres" icon={<GenreIcon />} />
        <ListTile label="Authors" icon={<PersonIcon />} />
      </div>

      <h3 className="mt-6 text-[20px] font-semibold text-white">Your lists</h3>
      <div className="mt-3 space-y-3">
        <ListTile label="New list" icon={<PlusBoxIcon />} />
        <ListTile label="Wish List" icon={<StarBoxIcon />} />
        <ListTile label="Favorites" icon={<HeartIcon />} />
      </div>
    </div>
  )
}

function ListTile({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 py-1">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-panel2 text-neutral-200">
        {icon}
      </div>
      <span className="flex-1 text-[15px] text-white">{label}</span>
      <button className="text-neutral-500">
        <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor">
          <circle cx="2" cy="2" r="1.6" />
          <circle cx="8" cy="2" r="1.6" />
          <circle cx="14" cy="2" r="1.6" />
        </svg>
      </button>
    </div>
  )
}

/* icons */
function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function WaveIcon() {
  return (
    <svg width="14" height="10" viewBox="0 0 24 16" fill="none">
      <path d="M1 12 C 8 4, 16 4, 23 12" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
    </svg>
  )
}
function FilterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function ListIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="13" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="13" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
function SortIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M7 5v14M3 15l4 4 4-4M17 19V5M21 9l-4-4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
function PersonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 19c1.5-3 3.5-4 6-4s4.5 1 6 4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
function GenreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M7 4c0 4 0 8 5 8s5-4 5-8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 20c0-4 0-8 5-8s5 4 5 8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function PlusBoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 10v6M9 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function StarBoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 10l1.2 2.6L16 13l-2 1.8L14.4 17 12 15.7 9.6 17l.4-2.2-2-1.8 2.8-.4L12 10z" fill="currentColor" />
    </svg>
  )
}
function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 19s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 7 3.5c0 5.15-7 9.5-7 9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}
