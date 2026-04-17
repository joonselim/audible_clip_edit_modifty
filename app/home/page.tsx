import Link from 'next/link'
import { BookCover } from '@/components/BookCover'
import { TabbedScreen, AudibleLogo } from '@/components/Chrome'
import { audiobooks } from '@/lib/book'

const BESTSELLER_CHIPS = ['All', 'Literature & Fiction', 'Fantasy', 'Mystery'] as const

export default function HomePage() {
  const featured = audiobooks.find(b => b.id === 'harry-potter-hbp')!
  const bestsellers = audiobooks.filter(b =>
    ['project-hail-mary', 'dungeon-crawler', 'dune-messiah', 'yearbook'].includes(b.id)
  )
  const recommended = audiobooks.filter(b =>
    ['born-a-crime', 'malcolm-x'].includes(b.id)
  )
  const alsoLike = audiobooks.filter(b =>
    ['dune-messiah', 'project-hail-mary'].includes(b.id)
  )

  return (
    <TabbedScreen>
      {/* Top bar: audible logo + search */}
      <header className="flex items-center justify-between px-5 pt-3 pb-3">
        <AudibleLogo />
        <button aria-label="Search" className="p-1 text-neutral-200">
          <SearchIcon />
        </button>
      </header>

      {/* Featured hero with vignette */}
      <section
        className="relative px-5 pt-1 pb-5"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(5,46,22,0.55) 0%, rgba(13,17,23,0) 60%)'
        }}
      >
        <Link
          href="#"
          className="mx-auto block w-[230px]"
        >
          <BookCover
            id={featured.id}
            title="Harry Potter"
            author="FULL-CAST AUDIO EDITION"
            size="md"
            className="aspect-[3/4] w-full shadow-2xl shadow-black/60"
          />
        </Link>
        <div className="mt-3 text-center">
          <p className="text-[13px] text-neutral-300">BY {featured.author}</p>
          <button className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-neutral-600 bg-ink/40 px-4 py-1.5 text-[12px] font-medium text-white">
            <PlayTiny /> Preview
          </button>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`h-[3px] rounded-full ${
                  i === 0 ? 'w-6 bg-white' : 'w-6 bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Limited time offer card */}
      <section className="px-5">
        <div className="rounded-xl border border-white/5 bg-panel p-4">
          <p className="text-[13px] font-semibold text-white">
            LIMITED TIME OFFER | Get 3 months of Audible Standard for ₩0.99 a month
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            ₩8.99/mo thereafter · terms apply.
          </p>
          <div className="mt-3 flex justify-end">
            <Link
              href="/join"
              className="rounded-full bg-amber px-4 py-1.5 text-[12px] font-semibold text-ink"
            >
              Get this deal
            </Link>
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="mt-6">
        <h2 className="mb-3 px-5 text-[18px] font-semibold text-white">Bestsellers</h2>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 pb-3">
          {BESTSELLER_CHIPS.map((c, i) => (
            <button
              key={c}
              className={`flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] ${
                i === 0
                  ? 'border-white bg-transparent text-white'
                  : 'border-neutral-700 text-neutral-300'
              }`}
            >
              {i === 0 && <CheckIcon />}
              {c}
            </button>
          ))}
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-2">
          {bestsellers.map(b => (
            <CatalogCard key={b.id} book={b} size="md" />
          ))}
        </div>
      </section>

      {/* Because you recently listened to */}
      <section className="mt-6 px-5">
        <p className="text-[11px] uppercase tracking-wider text-neutral-400">
          Because you recently listened to
        </p>
        <h2 className="text-[18px] font-semibold text-white">Dune</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {alsoLike.map(b => (
            <CatalogCard key={b.id} book={b} size="grid" />
          ))}
        </div>
      </section>

      {/* On sale */}
      <section className="mt-6 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-white">On sale and recommended for you</h2>
          <span className="text-neutral-500">›</span>
        </div>
        <div className="space-y-3">
          {recommended.map(b => (
            <Link key={b.id} href="#" className="flex items-center gap-3">
              <BookCover
                id={b.id}
                title={b.title.split(' ').slice(0, 2).join(' ')}
                size="sm"
                className="h-[64px] w-[64px] flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-[14px] font-semibold text-white">{b.title}</p>
                <p className="text-[12px] text-neutral-400">By {b.author}</p>
                <p className="text-[11px] text-neutral-500">{b.duration}</p>
                {b.price && (
                  <p className="text-[12px]">
                    <span className="font-semibold text-amber">{b.discount}</span>{' '}
                    <span className="text-amber">{b.price}</span>
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
        <div className="h-3" />
      </section>
    </TabbedScreen>
  )
}

function CatalogCard({
  book,
  size
}: {
  book: { id: string; title: string; author: string }
  size: 'md' | 'grid'
}) {
  const w = size === 'md' ? 'w-[152px]' : 'w-full'
  return (
    <Link href="#" className={`flex flex-col ${w} flex-shrink-0`}>
      <BookCover
        id={book.id}
        title={book.title.split(' ').slice(0, 2).join(' ')}
        author={book.author.toUpperCase()}
        size="md"
        className="aspect-square w-full"
      />
      <p className="mt-2 truncate text-[13px] font-medium text-white">{book.title}</p>
      <p className="truncate text-[12px] text-neutral-400">By {book.author}</p>
    </Link>
  )
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function PlayTiny() {
  return (
    <svg width="9" height="10" viewBox="0 0 10 12" fill="currentColor">
      <path d="M1 1l8 5-8 5V1z" />
    </svg>
  )
}
