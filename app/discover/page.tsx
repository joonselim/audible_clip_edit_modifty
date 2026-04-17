import Link from 'next/link'
import { TabbedScreen } from '@/components/Chrome'
import { categories } from '@/lib/book'

const CHIPS = ['Audible charts', 'New releases', 'Browse by duration', "Listeners' most wanted"]

export default function DiscoverPage() {
  return (
    <TabbedScreen>
      <header className="flex items-center justify-end px-5 pt-3 pb-2">
        <button aria-label="Search" className="p-1 text-neutral-200">
          <SearchIcon />
        </button>
      </header>

      <h1 className="px-5 pb-3 text-[22px] font-semibold text-white">
        Discover something new
      </h1>

      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-2">
          {CHIPS.map(c => (
            <button
              key={c}
              className="rounded-full border border-neutral-700 px-3 py-1.5 text-[12px] text-neutral-200"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

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

      <section className="px-5 pt-6 pb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-white">Browse by category</h2>
          <span className="text-neutral-500">›</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categories.map(c => (
            <Link
              key={c.label}
              href="#"
              className="flex items-center gap-2 rounded-xl bg-panel px-2.5 py-2 ring-1 ring-white/5"
            >
              <div
                className="h-9 w-9 flex-shrink-0 rounded-md"
                style={{
                  background: `linear-gradient(135deg, ${c.color}, #0b1120)`
                }}
              />
              <span className="text-[12px] font-medium text-white leading-tight">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-white">Browse by listener known</h2>
          <span className="text-neutral-500">›</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['Coming of age', 'Hard sci-fi', 'Epic fantasy', 'Thriller', 'Memoir', 'Classics'].map(t => (
            <Link
              key={t}
              href="#"
              className="aspect-square rounded-xl bg-gradient-to-br from-panel2 to-panel p-3 ring-1 ring-white/5"
            >
              <span className="text-[12px] font-medium text-white">{t}</span>
            </Link>
          ))}
        </div>
      </section>
    </TabbedScreen>
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
