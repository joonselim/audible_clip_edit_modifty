'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TabbedScreen } from '@/components/Chrome'

type Plan = 'standard' | 'premium'

export default function JoinPage() {
  const [plan, setPlan] = useState<Plan>('standard')

  return (
    <TabbedScreen>
      <div className="px-5 pt-5 pb-6">
        <div className="rounded-xl border border-white/5 bg-panel px-4 py-3 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
            Current membership
          </p>
          <p className="mt-1 text-[14px] font-semibold text-white">
            You're not currently a member.
          </p>
        </div>

        <h1 className="mt-6 text-center text-[20px] font-semibold text-white">
          Get the most out of Audible
        </h1>
        <p className="text-center text-[13px] text-neutral-400">
          Switch plans or cancel anytime.
        </p>

        <PlanCard
          title="Standard"
          free
          subtitle="Auto-renews at ₩14,000/mo after trial"
          bullets={[
            'Select 1 audiobook a month from our entire collection.',
            "Listen to your selected audiobooks as long as you're a member."
          ]}
          cta="Try Standard free"
          selected={plan === 'standard'}
          onSelect={() => setPlan('standard')}
        />

        <PlanCard
          title="Premium Plus"
          subtitle="₩22,000/mo — full access library"
          bullets={[
            'Unlimited listening in the Plus Catalog',
            '1 credit per month for any title.',
            'Exclusive Audible Originals.'
          ]}
          cta="Choose Premium Plus"
          selected={plan === 'premium'}
          onSelect={() => setPlan('premium')}
          accent
        />

        <p className="mt-6 px-2 text-center text-[11px] leading-relaxed text-neutral-500">
          By signing up, you agree to Audible's{' '}
          <span className="text-sky-400">Conditions of Use</span>,{' '}
          <span className="text-sky-400">License</span>, and Amazon's{' '}
          <span className="text-sky-400">Privacy Notice</span>.
        </p>
      </div>
    </TabbedScreen>
  )
}

function PlanCard({
  title,
  free = false,
  subtitle,
  bullets,
  cta,
  selected,
  accent = false,
  onSelect
}: {
  title: string
  free?: boolean
  subtitle: string
  bullets: string[]
  cta: string
  selected: boolean
  accent?: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`mt-5 block w-full overflow-hidden rounded-2xl border text-left transition ${
        selected
          ? 'border-sky-500 bg-gradient-to-b from-sky-900/40 via-panel to-panel'
          : 'border-white/10 bg-panel'
      }`}
    >
      <div className="relative px-5 pt-5 pb-5">
        <span
          className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border ${
            selected ? 'border-sky-400 bg-sky-500' : 'border-neutral-600'
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
        {free && (
          <div className="mb-2 inline-block rounded-md border border-white/60 px-2 py-0.5 text-[10px] font-semibold text-white">
            FREE TRIAL
          </div>
        )}
        <h2 className="text-center text-[20px] font-semibold text-white">{title}</h2>
        <p className="mt-1 text-center text-[13px] text-neutral-300">{subtitle}</p>

        <ul className="mt-4 space-y-2">
          {bullets.map(b => (
            <li key={b} className="flex items-start gap-2 text-[13px] text-neutral-200">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 flex-shrink-0 text-sky-400">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3" />
                <path d="M4.5 8l2.5 2.5 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <Link
          href="#"
          className={`mt-5 flex h-12 w-full items-center justify-center rounded-full text-[15px] font-semibold ${
            accent ? 'bg-white text-ink' : 'bg-amber text-ink'
          }`}
        >
          {cta}
        </Link>
      </div>
    </button>
  )
}
