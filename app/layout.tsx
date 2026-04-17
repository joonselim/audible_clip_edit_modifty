import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Audible — Read & Listen',
  description: 'Prototype: scroll-to-seek for Audible Read & Listen'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans h-screen bg-black text-neutral-200 overflow-hidden">
        <div className="h-screen w-screen flex md:items-center md:justify-center md:py-6">
          {/*
            Mobile (< md): full-bleed, no frame — feels like a native app.
            Desktop (>= md): phone-shaped frame, iPhone 13 mini-ish height
            (780 px) so the transport→tray gap stays natural instead of
            ballooning on tall Chrome windows.
          */}
          <div className="relative w-full h-full bg-ink overflow-hidden md:w-[390px] md:h-[780px] md:max-h-[calc(100vh-48px)] md:rounded-[36px] md:ring-1 md:ring-white/10 md:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
