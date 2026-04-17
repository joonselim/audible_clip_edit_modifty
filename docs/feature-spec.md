# Scroll-to-Seek for Audible Read & Listen

## Problem

In Audible's Read & Listen mode, navigation is limited to **30-second rewind** and **chapter jumps**. There is no way to tap a specific sentence and jump playback there — something music apps already do with lyrics.

## Inspiration

Music services like YouTube Music and Spotify let you tap a lyric line to seek to that moment. We bring the same interaction to audiobooks.

## Proposed Feature: Scroll-to-Seek

### How it works

The text view has two states: **Locked** and **Unlocked**.

#### Locked (default)

- Text auto-scrolls to follow the narrator — the current word is highlighted.
- A subtle indicator reads **"Scroll to unlock"**.
- The user cannot freely scroll or tap to seek.

#### Unlocking

| Step | User action | What happens |
|------|------------|--------------|
| 1 | First scroll gesture | Indicator changes to **"Scroll up to unlock · Tap to listen from there"**. Text stays locked. No scroll movement occurs. |
| 2 | Second scroll gesture (within 3 s) | Text unlocks. Indicator changes to **"Tap text to play"**. User can now freely scroll through the chapter. |
| — | No second scroll within 3 s | Hint dismisses. Returns to locked state. |

> **Why two steps?** A single scroll is easy to trigger by accident on a touch screen. The two-step gate prevents unintentional unlocks while keeping the interaction fast and discoverable.

#### Tap to seek

- While unlocked, the user taps any word in the text.
- Playback **jumps to that word's position** and the text **re-locks** to the new playhead.
- A **"Go back to [timestamp]"** pill appears for 4 seconds, letting the user return to where they were before the jump.

#### Go Back

- Tapping the pill seeks back to the previous position and re-locks.
- Tapping **×** dismisses the pill without moving.
- The pill auto-dismisses after **4 seconds** if neither is tapped.

### Flow diagram

```
┌────────────┐
│   LOCKED   │  text follows playback
│            │  indicator: "Scroll to unlock"
└─────┬──────┘
      │ 1st scroll
      ▼
┌────────────┐
│    HINT    │  indicator: "Scroll up to unlock"
│            │  text still locked, no scroll movement
└──┬──────┬──┘
   │      │ 3 s timeout
   │      ▼
   │  ┌────────┐
   │  │ LOCKED │  (back to default)
   │  └────────┘
   │ 2nd scroll
   ▼
┌────────────┐
│  UNLOCKED  │  indicator: "Tap text to play"
│            │  free scroll, words are tappable
└─────┬──────┘
      │ tap a word
      ▼
┌────────────┐
│   LOCKED   │  playback jumps to tapped word
│ + Go Back  │  "Go back to 1:23" pill (4 s)
└────────────┘
```

### Design notes

- **Word-level highlight** — the current word (not sentence) is highlighted in amber as it plays, inside flowing paragraph text.
- **Wall of text** — text renders as natural book paragraphs, not line-by-line like lyrics. This preserves the reading experience.
- **Scroll freeze on unlock** — both the hint scroll and the unlock scroll are consumed (`preventDefault`), so the page stays in place until the user intentionally scrolls after unlocking.

## On scroll locking

Audible's current Read & Listen locks text to the playhead by design — likely to keep the reading position synchronized with narration. Our approach **respects this default** while adding an opt-in escape hatch. The two-step unlock ensures the lock is only broken intentionally.

## Summary

| | Current | Proposed |
|---|---------|----------|
| **Navigate by time** | 30 s rewind | 30 s rewind |
| **Navigate by chapter** | Chapter list | Chapter list |
| **Navigate by text** | Not available | Scroll to unlock → tap word to seek |
| **Return to previous position** | Not available | "Go back to [timestamp]" pill |
