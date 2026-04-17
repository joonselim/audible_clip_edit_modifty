import React from 'react'

type Size = 'sm' | 'md' | 'lg'

const covers: Record<string, React.CSSProperties> = {
  dune: {
    background:
      'radial-gradient(ellipse at 50% 78%, #fde68a 0%, #f59e0b 16%, #c2410c 38%, #7c2d12 66%, #1c1108 100%)'
  },
  'dune-messiah': {
    background:
      'radial-gradient(ellipse at 50% 65%, #b45309 0%, #7c2d12 40%, #3b0764 80%, #1e0933 100%)'
  },
  'project-hail-mary': {
    background: 'linear-gradient(160deg, #0b1020 0%, #1e3a8a 50%, #0ea5e9 100%)'
  },
  'the-way-of-kings': {
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #64748b 100%)'
  },
  foundation: {
    background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 50%, #4b5563 100%)'
  },
  'harry-potter-hbp': {
    background:
      'radial-gradient(ellipse at 50% 40%, #065f46 0%, #064e3b 40%, #052e16 80%, #030712 100%)'
  },
  'a-promised-land': {
    background: 'linear-gradient(180deg, #e5e7eb 0%, #9ca3af 60%, #4b5563 100%)'
  },
  'end-of-average': {
    background: 'linear-gradient(180deg, #e5e7eb 0%, #d1d5db 60%, #9ca3af 100%)'
  },
  yearbook: {
    background: 'linear-gradient(160deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%)'
  },
  'born-a-crime': {
    background: 'linear-gradient(160deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
  },
  'malcolm-x': {
    background: 'linear-gradient(160deg, #7f1d1d 0%, #991b1b 50%, #450a0a 100%)'
  },
  'dungeon-crawler': {
    background: 'linear-gradient(160deg, #78350f 0%, #92400e 50%, #b45309 100%)'
  }
}

const titleSize: Record<Size, string> = {
  sm: 'text-[9px]',
  md: 'text-[13px]',
  lg: 'text-[16px]'
}
const authorSize: Record<Size, string> = {
  sm: 'text-[6px]',
  md: 'text-[8px]',
  lg: 'text-[9px]'
}

export function BookCover({
  id,
  title,
  author,
  size = 'md',
  className = ''
}: {
  id: string
  title: string
  author?: string
  size?: Size
  className?: string
}) {
  const style = covers[id] ?? covers.dune
  return (
    <div
      className={`relative overflow-hidden rounded-md ring-1 ring-white/5 ${className}`}
      style={style}
    >
      {id === 'dune' && (
        <>
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              top: '55%',
              width: '75%',
              aspectRatio: '1 / 1',
              background:
                'radial-gradient(circle, #ffe7a3 0%, #ffb400 38%, rgba(255,180,0,0) 72%)',
              filter: 'blur(0.5px)'
            }}
          />
          <div
            className="absolute inset-x-0"
            style={{
              bottom: '24%',
              height: 1,
              background: 'rgba(255,180,0,0.45)'
            }}
          />
        </>
      )}
      <div className="absolute inset-0 flex flex-col items-center pt-[12%] px-1 text-center">
        {author && (
          <span
            className={`${authorSize[size]} uppercase tracking-[0.22em] text-white/75`}
          >
            {author}
          </span>
        )}
        <span
          className={`${titleSize[size]} mt-1 font-serif font-semibold leading-tight`}
          style={{
            color: '#fff7e4',
            textShadow: '0 1px 6px rgba(0,0,0,0.55)',
            letterSpacing: '0.04em'
          }}
        >
          {title}
        </span>
      </div>
    </div>
  )
}
