'use client'

import Link from 'next/link'
import { useState } from 'react'
import { TabbedScreen } from '@/components/Chrome'

type ProfileTab = 'Profile' | 'Membership' | 'Help & Support'

export default function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>('Profile')
  return (
    <TabbedScreen>
      <header className="flex items-center justify-end px-5 pt-3 pb-2">
        <Link href="#" aria-label="Settings" className="p-1 text-neutral-200">
          <GearIcon />
        </Link>
      </header>

      <div className="flex flex-col items-center px-5 pt-2 pb-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-700 text-[22px] font-semibold text-white">
          JL
        </div>
        <p className="mt-3 text-[18px] font-semibold text-white">JoonSe Lim</p>
        <p className="text-[13px] text-neutral-400">Member since 2022</p>
        <div className="mt-3 flex gap-8">
          <Stat n="0" label="Credits" />
          <Stat n="5" label="Titles" />
          <Stat n="5" label="Badges" />
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-hair/80 px-5">
        {(['Profile', 'Membership', 'Help & Support'] as const).map(t => {
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative whitespace-nowrap py-3 text-[14px] ${
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

      {tab === 'Profile' && <ProfilePane />}
      {tab === 'Membership' && <MembershipPane />}
      {tab === 'Help & Support' && <HelpPane />}
    </TabbedScreen>
  )
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-[20px] font-semibold text-white">{n}</p>
      <p className="text-[12px] text-neutral-400">{label}</p>
    </div>
  )
}

function ProfilePane() {
  return (
    <div className="px-5 pt-5 pb-6">
      <h3 className="text-[16px] font-semibold text-white">Your offers</h3>
      <Row label="Sales & deals" />

      <div className="mt-4 flex items-start gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-600 text-neutral-300">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-[14px] font-semibold text-white">Create a Kids Profile</p>
          <p className="text-[12px] text-neutral-400">
            Share only the titles you choose.
          </p>
        </div>
      </div>

      <h3 className="mt-6 text-[16px] font-semibold text-white">Activity &amp; stats</h3>
      <Row label="Listen history" />
      <Row label="Listening stats" />
      <Row label="Listening level" />
    </div>
  )
}

function MembershipPane() {
  return (
    <div className="px-5 pt-6 pb-6">
      <h3 className="text-[17px] font-semibold text-white">Explore plans</h3>
      <Link
        href="/join"
        className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-amber text-[16px] font-semibold text-ink"
      >
        Explore plans
      </Link>
    </div>
  )
}

function HelpPane() {
  return (
    <div className="px-5 pt-4 pb-6">
      <Row label="Tips & tricks" />
      <Row label="Help center" />
      <Row label="Ad privacy choices" />
      <Row label="Request refund from Apple" />
    </div>
  )
}

function Row({ label }: { label: string }) {
  return (
    <Link
      href="#"
      className="flex items-center justify-between border-b border-hair/60 py-4 text-[14px] text-white"
    >
      <span>{label}</span>
      <span className="text-neutral-500">›</span>
    </Link>
  )
}

function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  )
}
