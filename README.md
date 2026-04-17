# Audible Clip Edit — Dynamic-Zoom Waveform

A mockup that reimagines the **Edit Clip** screen in Audible so that fine-grained clip trimming — the kind where the difference between a 12-second clip and a 13-second clip matters — is actually possible with a thumb.

> **Live demo:** _(deployed to Vercel)_

---

## The problem

Audible lets you save a clip up to 2 minutes long. Inside the Edit screen, the waveform always shows roughly the same ~2:30 window — so the _visual length of your selection_ is locked to whatever time it covers.

That means:

- A 2-minute clip fills the screen. Each second ≈ 3–4 px. Usable.
- A 12-second clip is a narrow strip in the middle of a wide, mostly-empty waveform. Each second ≈ 25 px. Still usable.
- But dragging a handle to move from "12 s" to "13 s" is a ~2 mm gesture. Fat-finger city.

The fixed window makes small clips nearly impossible to trim precisely.

## The approach

Let the waveform **zoom** based on selection length, so the selection always takes up a predictable portion of the screen regardless of how many seconds it represents.

Four linked ideas:

1. **Fixed on-screen ratio.** After you release a handle, the visible window resizes so that `selection ≈ 50%` of the screen width. A 15-s clip becomes 15 s on the left half; a 90-s clip becomes 90 s on the left half. Per-second pixel density is roughly constant.
2. **Delay + animate, don't snap.** A 500 ms pause before the zoom triggers, then a 300 ms ease-out animation. The selection "relaxes" into its new zoom level — it doesn't yank the view while your finger is still near the screen.
3. **Time-anchored waveform bars.** Bars are tied to absolute time (2 bars/second). When you zoom in, the same bars spread further apart — visually reinforcing that you're looking at finer-grained audio. When you zoom out they crowd in.
4. **Adaptive time ruler.** A tick row under the waveform labels seconds at an interval that adapts to the zoom (1 s, 2 s, 5 s, 10 s, 30 s, 1 min, …). Short view → `58 · 1:00 · 1:02 · 1:04`. Longer view → `50 · 1:00 · 1:10 · 1:20`.

Two smaller fixes that fell out of the same thinking:

- **Current Position is a fixed anchor.** In the live app it's attached to the end-handle, which reads as "the end handle = the playhead." That's confusing when you drag. Here it's pinned to the playback time captured at clip creation and shown as a vertical line through the waveform — the end handle moves, the anchor doesn't.
- **Pan when zoomed in.** Drag the faded (out-of-selection) area to scroll the window to another part of the audio. The zoom doesn't re-trigger from a pan — pans are considered intentional.

## The interaction at a glance

| Gesture | Result |
|---|---|
| Drag start/end handle | Resize selection. Window stays put while dragging. |
| Release handle | After 500 ms, view animates so selection ≈ 50 % of screen. |
| Drag faded (outside) area | Pan the visible window. Zoom is not re-triggered. |
| Switch mode pill (1 sentence / 2 sentences / paragraph) | Re-derive selection from the anchor; auto-zoom follows. |

The core of the implementation is in [`components/EditClipScreen.tsx`](components/EditClipScreen.tsx) — the `WaveformPane` component.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**

No real audio — bar heights are a deterministic hash of the bar index, so a given second of audio always draws the same bar (heights stay stable across zoom).

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000/player
```

Press **+ Clip** in the bottom bar, then **Edit** on the toast that appears.

## Status

Prototype — no real audio, no backend. Gesture and layout mockup only. Best viewed on a phone-sized viewport.
