# Adaptive Clip for Audible

## Problem

Audible's clip feature captures a **fixed 30-second window** ending at the tap, regardless of what the listener actually wants to save. In practice, there are at least three different intents behind a clip:

- A reader capturing **a single quoted sentence** — a "commonplace book" habit
- A listener marking **a 30-second moment** — the current default
- A listener keeping **an entire scene or passage** — for narrative context

All three share the same 30-second default and must manually trim the waveform afterward. Sentence collectors overshoot, scene keepers undershoot, and everyone ends up in the editor.

## Insight

Different clippers have different **units of meaning**:

| Persona | Unit | Observable signal |
|---|---|---|
| **Sentence Collector** | A sentence or two | Trims clip to 5–10 s |
| **Moment Clipper** | A ~30 s beat | Leaves default untouched |
| **Scene Keeper** | A paragraph / full scene | Extends toward the maximum |

If the system recognizes the persona, the default can match the intent. First tap produces a near-final clip. Editing becomes the exception, not the rule.

## Proposed Feature: Adaptive Clip

A single user preference — the **clip mode** — controls what a tap captures.

### Three clip modes

| Mode | Captures | Boundary source |
|---|---|---|
| **Sentence** | The sentence being spoken at tap + the one before it | Transcript sentence punctuation |
| **Moment** (default) | 30 seconds ending at tap — current behavior | Fixed time window |
| **Scene** | From the start of the current paragraph up to tap | Transcript paragraph breaks |

All three modes capture **backward from the tap**. Listeners decide after hearing, so the clip is always retroactive. (This matches Audible's current direction.)

### Mode selector

Exposed **only on the Edit Clip screen**, as a segmented toggle at the top: `Sentence · Moment · Scene`. Switching mid-edit re-snaps the clip to the new unit, preserving the user's anchor (tap time).

The player itself stays uncluttered — mode is not a runtime decision most users make. `+ Clip` remains a single, frictionless tap. Mode switching is a deliberate act that belongs in the editor.

### Capture flow

1. User taps `+ Clip` (or triggers via AirPods squeeze / Action Button / Watch).
2. Clip is created with the current mode's default unit, ending at the tap.
3. A toast appears: **"Clip saved · Sentence"** with inline **Expand** / **Shrink** buttons.
4. Toast auto-dismisses after 3 s, or on any tap elsewhere.

### One-off expand / shrink in the toast

A single tap nudges this specific clip's unit up or down without changing the mode.

| Button | Effect on the just-saved clip |
|---|---|
| **Expand** | Sentence → Moment → Scene (one step wider) |
| **Shrink** | Scene → Moment → Sentence (one step narrower) |

This lets the listener correct an underfit or overfit without opening the full editor.

### Sticky length (silent adaptation)

Within **Moment mode**, the last length the user saved becomes the starting length for the next clip.

- First clip: default 30 s → user trims to 12 s → saves.
- Second clip: the capture arrives pre-sized at **12 s**. No editing needed if that's what the user wanted.
- If the user further adjusts (to 9 s, say), 9 s becomes the new starting length.

This is **silent but expected behavior** — it's the same pattern as a text editor remembering your last font size, or a camera app remembering your last aspect ratio. It saves effort without surprising the user, because the length is still *their* length.

Sentence and Scene modes don't have a tunable length, so sticky length only applies to Moment.

### Mode promotion (explicit consent)

Separately, the system watches for a consistent pattern that suggests the user has graduated from Moment to a boundary-snapped mode:

**Trigger for proposing Sentence mode** — all three must hold across the last 3 clips:
- User is in **Moment mode**
- Sticky length has settled into a narrow band (**each clip within ±3 s of the last**)
- Final length is **sentence-scale** (≤ 15 s, or spans ≤ 2 sentences if a transcript is available)

**Trigger for proposing Scene mode**:
- User is in **Moment mode**
- Last 3 clips consistently extended past 90 s
- Each clip spans a full paragraph or more (transcript check, if available)

On the 3rd matching clip, a one-time prompt appears in *Clips & notes*:

> **"Your clips are usually 1–2 sentences long. Switch to Sentence mode so they snap cleanly to sentence boundaries?"**
> `[ Switch to Sentence ]  [ Keep Moment ]`

If declined, the prompt is suppressed for 14 days.

**The distinction matters:** sticky length is about *remembering*, mode promotion is about *upgrading to boundary-aware snapping*. The first happens silently; the second always asks.

### Transcript dependency

Sentence and Scene modes require sentence- and paragraph-level timestamps in the transcript. Audible already ships transcripts for accessibility; this spec assumes that timing data is accessible.

**Fallback when no transcript is available:**

- Sentence mode → last **10 seconds** (labeled `~10s` in the Edit screen toggle)
- Scene mode → last **60 seconds** (labeled `~60s` in the Edit screen toggle)

The mode toggle stays visible in the Edit screen but expectations are set by the approximate label. The user can still switch between modes and trim manually — they just won't get sentence/paragraph snapping.

### Flow diagram

```
┌──────────────────────────┐
│  User hears a moment     │
└────────────┬─────────────┘
             │ tap +Clip (or AirPods squeeze)
             ▼
┌──────────────────────────┐
│  Clip captured           │
│  unit = current mode     │
│  end-boundary = tap time │
└────────────┬─────────────┘
             │ toast: "Clip saved · Sentence"
             ▼
┌──────────────────────────┐
│  One-tap refine?         │
│  [ Shrink ]  [ Expand ]  │
└─┬──────────────┬─────────┘
  │              │
  ▼              ▼
 widen/shrink   dismiss
 this clip      (3 s auto)
```

### Edge cases

- **Start of chapter.** If tap lands inside the first sentence or paragraph of a chapter, capture starts at the chapter boundary. Do not reach back into the previous chapter.
- **Reset sticky length.** If the user changes mode (Moment → Sentence, etc.), sticky length is cleared. Returning to Moment starts at 30 s again. This prevents a stale length from following the user through mode changes.
- **Outlier clip.** A single clip that breaks the pattern (e.g. a 90 s clip among ten 12 s clips) doesn't reset the pattern counter immediately — but two outliers in a row do. Users occasionally want a longer clip without abandoning their habit.
- **Very long paragraphs.** Cap Scene mode at **3 minutes**. Beyond that, fall back to 60 seconds from tap.
- **Silence at boundaries.** Trim leading/trailing silence greater than 400 ms at the snapped boundary so the clip starts on speech, not a pause.

## Wireframes

All wireframes depict an iPhone portrait screen. Boxes are schematic — proportions approximate, not pixel-accurate. Italic annotations describe intent, not UI copy.

### Screen index

| # | Screen | Purpose |
|---|---|---|
| 1 | Player · `+ Clip` | Single-tap capture, no mode UI |
| 2 | Toast · clip saved | Inline confirmation and one-off refine |
| 3 | Edit Clip · Moment (default) | Waveform trimming, mode toggle visible |
| 4 | Edit Clip · Sentence + transcript | Boundary-snapped selection via text |
| 5 | Edit Clip · no-transcript fallback | Graceful degradation |
| 6 | Mode promotion prompt | Consent-based mode upgrade |

---

### 1. Player — `+ Clip` tap target

```
┌────────────────────────────────────┐
│ 6:52               📶 📶 🔋 50%    │
│ ⌄           ⇪  📡  ⋯               │
│                                    │
│      ┌──────────────────────┐      │
│      │                      │      │
│      │    [Cover art]       │      │
│      │                      │      │
│      └──────────────────────┘      │
│                                    │
│ ☰  Chapter 1                       │
│                                    │
│ (Clips & notes)(Title)(Listen log) │
│                                    │
│ ━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│ 19:18    28h 40m left    -24:27    │
│                                    │
│    ⏮     ↺30     ⏸     30↻     ⏭  │
│                                    │
│ 1.0×      🚗        ⏱       ⊕      │
│ Speed   Car Mode   Timer   +Clip   │
└────────────────────────────────────┘
                                  ▲
                       single tap → capture
                       (no mode chooser here)
```

*The player is unchanged from current Audible except that `+ Clip` now invokes the adaptive capture pipeline. Mode switching belongs in the editor, not the playback surface.*

---

### 2. Toast — clip saved (3 variants)

```
Moment mode (default)
┌────────────────────────────────────┐
│ …player above unchanged…           │
├────────────────────────────────────┤
│ ✓ Clip saved · Moment 12s          │
│      [− Shrink]  [+ Expand]   Edit │
└────────────────────────────────────┘

Sentence mode
┌────────────────────────────────────┐
│ ✓ Clip saved · Sentence            │
│      [− Shrink]  [+ Expand]   Edit │
└────────────────────────────────────┘

Scene mode
┌────────────────────────────────────┐
│ ✓ Clip saved · Scene (1m 14s)      │
│      [− Shrink]  [+ Expand]   Edit │
└────────────────────────────────────┘
```

*Toast auto-dismisses after 3 s. `Shrink`/`Expand` widen or narrow this specific clip by one unit (Sentence ↔ Moment ↔ Scene) without changing the default mode. `Edit` opens Screen 3.*

---

### 3. Edit Clip — Moment mode (base state)

```
┌────────────────────────────────────┐
│ ✕              Edit clip      Save │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Sentence │●Moment●│  Scene    │ │  ← segmented toggle
│ └────────────────────────────────┘ │
│                                    │
│ Chapter 1                          │
│ A Promised Land                    │
│                                    │
│                    Current Position│
│                         ▼          │
│ ││││││││▐▐▐▐▐▐▐▐▐▐│││││││││││││││  │
│         ⟨──────────⟩               │  ← drag handles
│                                    │
│ 00:30:14 – 00:30:44  (30s)         │
│                                    │
│              ▶                     │
│                                    │
│ Clip name (optional)               │
│ ┌────────────────────────────────┐ │
│ │ Label your clip...             │ │
│ └────────────────────────────────┘ │
│                                    │
│ Your note (optional)               │
│ ┌────────────────────────────────┐ │
│ │ Write a short description...   │ │
│ └────────────────────────────────┘ │
│                                    │
│           Delete clip              │
└────────────────────────────────────┘
```

*Mode toggle is the only addition to the current Audible edit screen. Switching toggles re-snaps the clip to the new unit (Screen 4 shows Sentence).*

---

### 4. Edit Clip — Sentence mode + transcript highlight

```
┌────────────────────────────────────┐
│ ✕              Edit clip      Save │
│                                    │
│ ┌────────────────────────────────┐ │
│ │●Sentence●│  Moment  │  Scene  │ │
│ └────────────────────────────────┘ │
│                                    │
│ Chapter 1 · A Promised Land        │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ …over the years, I had        │ │  dim
│ │ seen what it did to families. │ │  dim
│ │                               │ │
│ │ █ "I swore to myself that   █ │ │  highlighted
│ │ █  day that I would do      █ │ │  (selected)
│ │ █  better, for them."       █ │ │
│ │                               │ │
│ │ He sat quietly for a moment   │ │  dim
│ │ before continuing…            │ │  dim
│ └────────────────────────────────┘ │
│                                    │
│ 00:30:18 – 00:30:28  (10s)         │
│                                    │
│              ▶                     │
│                                    │
│ Clip name (optional)               │
│ ┌────────────────────────────────┐ │
│ │ Label your clip...             │ │
│ └────────────────────────────────┘ │
│                                    │
│           Delete clip              │
└────────────────────────────────────┘
```

*Tap a sentence to toggle its inclusion. Selection is always a contiguous range — tapping a non-adjacent sentence extends the range. Default selection is the sentence containing the tap anchor plus the one immediately before it. Waveform is hidden in Sentence mode to give the transcript visual priority.*

---

### 5. Edit Clip — no-transcript fallback

```
┌────────────────────────────────────┐
│ ✕              Edit clip      Save │
│                                    │
│ ┌────────────────────────────────┐ │
│ │  ~10s    │●Moment●│   ~60s    │ │  ← approx. labels
│ └────────────────────────────────┘ │
│                                    │
│ Chapter 1 · A Promised Land        │
│                                    │
│ ⓘ Transcript not available for     │
│   this title — using time windows. │
│                                    │
│ ││││││││▐▐▐▐▐▐▐▐▐▐│││││││││││││││  │
│         ⟨──────────⟩               │
│                                    │
│ 00:30:14 – 00:30:44  (30s)         │
│                                    │
│              ▶                     │
│                                    │
│ …name / note / delete as Screen 3  │
└────────────────────────────────────┘
```

*Labels change from `Sentence/Moment/Scene` to `~10s/Moment/~60s` to signal that snapping isn't semantic. Everything else behaves identically — the user can still switch modes and trim manually.*

---

### 6. Mode promotion prompt

```
┌────────────────────────────────────┐
│                                    │
│                                    │
│   ╭──────────────────────────────╮ │
│   │                              │ │
│   │   ✦                          │ │
│   │                              │ │
│   │   Your clips are usually     │ │
│   │   1–2 sentences long.        │ │
│   │                              │ │
│   │   Switch to Sentence mode    │ │
│   │   so they snap cleanly to    │ │
│   │   sentence boundaries?       │ │
│   │                              │ │
│   │  ┌────────────────────────┐  │ │
│   │  │  Switch to Sentence    │  │ │  primary
│   │  └────────────────────────┘  │ │
│   │                              │ │
│   │       Keep Moment            │ │  text link
│   │                              │ │
│   ╰──────────────────────────────╯ │
│                                    │
└────────────────────────────────────┘
```

*Appears at most once every 14 days. Triggered by the conditions in **Mode promotion** above. Surface: in-app modal, shown the next time the user opens *Clips & notes* after the 3rd qualifying clip.*

---

### User journey: sticky length graduating to Sentence mode

```
Clip 1                Clip 2                Clip 3
─────────             ─────────             ─────────
default: 30s          starts at 12s         starts at 11s
user trims to 12s     user saves as-is      user trims to 11s
↓                     ↓                     ↓
[stored: 12s]         [stored: 12s]         [stored: 11s]
                                                │
                                                ▼
                              ┌─────────────────────────────────┐
                              │ Pattern detected:                │
                              │ 3 clips within ±3s · ≤15s ·      │
                              │ each ≤2 sentences.               │
                              │                                  │
                              │ → Mode promotion prompt (6)      │
                              └─────────────────────────────────┘
                                                │
                          ┌─────────────────────┴─────────────┐
                          ▼                                   ▼
                  [ Switch to Sentence ]              [ Keep Moment ]
                  Mode = Sentence.                    Mode = Moment.
                  Sticky length cleared.              Prompt suppressed 14d.
                  Next clips snap to                  Sticky length continues.
                  sentence boundaries.
```

---

### Interaction annotations

- **Toast vs Edit.** Toast refine (`Shrink`/`Expand`) is one-tap and fast; Edit is for precision. Both exist because the right tool depends on how fussy the user wants to be in that moment.
- **Mode toggle re-snap.** Switching modes in Edit preserves the tap-anchor (end point of the clip) and re-derives the start based on the new unit. Manual trims made before the switch are discarded — the toggle is destructive on purpose, to avoid a confusing hybrid state.
- **Selection model (Sentence mode).** Range is always contiguous sentences. Tapping a sentence inside the current range deselects it only if it's at an edge; tapping outside extends to that sentence.
- **Silence at boundaries.** Any snapped boundary trims leading/trailing silence longer than 400 ms so clips start on speech.

## Why this matters

- **Faster to save the right thing.** Most clips become usable without editing — the core friction the user reported.
- **Better downstream signal.** Each mode is a weak but useful persona signal for recommendation (Sentence Collectors skew non-fiction / self-help; Scene Keepers skew narrative fiction and memoir).
- **Foundation for Global Commonplace.** A future unified clip gallery benefits from clips that are correctly scoped at capture time — the gallery becomes browseable instead of a pile of half-trimmed 30-second chunks.

## Success metrics

> **Note on data:** We do not have access to Audible's current clip telemetry. Every baseline number below is a stated hypothesis, not a known fact. Phase 0 of the rollout (see below) exists specifically to replace these hypotheses with measured truth before any UX ships. Targets should be re-calibrated once the real distribution is known.

### Primary — is the default better?

| Metric | Current (hypothesis) | Target after Phase 2 |
|---|---|---|
| **Post-capture edit rate** | 70–90% (assumption: almost everyone trims the fixed 30 s window) | **< 40%** |
| **Time from `+Clip` to Save** | 15–30 s (tap + waveform trim + save) | **< 5 s for ~70% of clips** |
| **Clip deletion rate** | Unknown | **≥ 20% relative drop** |

*Rationale.* The entire spec exists to move the first capture closer to the user's intent. These three metrics are the direct test of that claim. If none of them move, the feature failed regardless of how clever the mode system is.

### Secondary — are modes actually useful?

| Metric | Healthy signal | Why |
|---|---|---|
| **Mode distribution at 30 days post-Phase 2** | < 85% in any single mode | A degenerate distribution means modes are invisible or useless |
| **Sticky length adoption** (% of Moment clips saved at sticky length with no further edit) | **> 50%** | Measures whether "remember my last length" actually remembers the right thing |
| **Mode promotion prompt acceptance** (when shown) | **30–50%** | Too low → prompt is noise. Too high → we waited too long to nudge, eroding value |

### Tertiary — downstream value

| Metric | What it tells us |
|---|---|
| **Clips per active listener per month** | Whether lower friction grows the habit |
| **Clip replay rate** (clip listened to ≥ 1× after save) | Whether clips become a library, not a graveyard — the thesis behind the future Commonplace Gallery |
| **Share rate** (once sharing ships) | Whether better clips are good enough to surface to friends |

### Guardrails — what must not regress

- **`+Clip` tap success rate.** No increase in ghost taps or error states from any new interaction near the button.
- **Clip-related support tickets.** Should trend down. An uptick means the new UI is confusing in a way we didn't catch.
- **Accessibility completion rate** for the clip flow (VoiceOver, Switch Control). Must hold or improve.

### Assumptions we're explicitly making

If any of these turn out to be false, the spec needs to be reopened, not just retuned.

1. **Users currently edit most clips.** If Phase 0 shows edit rate is already, say, 20%, the whole value prop collapses.
2. **Transcript + timing alignment is available for a majority of the catalog.** If coverage is low, Sentence/Scene modes are rare enough that they're not worth the surface cost.
3. **Users can read the mode names without onboarding copy.** If they can't, we need inline explanations we haven't designed.
4. **There is no existing internal A/B test** on clip length or defaults that would contaminate the baseline or conflict with this rollout.

## Phased rollout

Each phase ships independently behind a feature flag and is measured on its own success gate. Later phases assume the data and infrastructure from earlier ones.

### Phase 0 — Instrument current behavior *(no user-visible change)*

Before any UX change, add telemetry to the existing clip flow.

- Every `+Clip` invocation logs: timestamp, book, chapter, pre-edit range, final range, time-to-save, save-vs-delete outcome, whether the editor was opened.
- Compute the real distribution of edit rate, final clip length, and deletion rate. These become the baseline every later phase is measured against.
- Also measure **transcript coverage** across the active catalog — this sizes the Sentence/Scene opportunity.

**Scope:** instrumentation only, no user-visible change.
**Duration:** ~1 sprint (2 weeks) to instrument; 2–4 weeks to collect enough baseline data.
**Exit criterion:** the "(hypothesis)" cells in Success metrics are replaced with observed numbers, and Assumption 1 above is confirmed or falsified.

---

### Phase 1 — Sticky length *(Moment mode only, no new UI)*

- Within Moment mode, remember the user's last saved length and apply it to the next clip.
- No mode toggle. No promotion prompt. No transcript dependency.
- Works for the entire catalog on day one.

**Why first.** Lowest risk, largest expected win, zero dependencies. Tests the core thesis — "people have a personal length" — with the smallest possible surface.

**Ship to:** 1% → 10% → 50% → 100% over ~3 weeks, gated on guardrails.

**Success gate to proceed to Phase 2:** measurable drop in edit rate *and* in deletion rate vs. Phase 0 baseline. If only one moves, investigate before continuing.

---

### Phase 2 — Three modes in Edit screen *(+ Sentence, Scene, fallback labels)*

- Segmented toggle appears in the Edit Clip screen.
- Sentence and Scene modes work on titles with aligned transcripts.
- `~10s / Moment / ~60s` labels on titles without transcripts.
- No promotion prompt yet — users discover modes on their own.

**Dependencies.**
- Transcript + sentence/paragraph-level timing alignment pipeline. *This is the real engineering cost of the phase.*
- Per-title flag exposing transcript availability.

**Ship to:** 10% → 50% → 100% over ~4 weeks.

**Success gate to proceed to Phase 3:** mode distribution at 30 days shows non-degenerate adoption (< 85% in any single mode). If 99% stay in Moment, mode discovery is broken and needs a fix *before* Phase 3 or 4.

---

### Phase 3 — Toast refine (Shrink / Expand)

- Add inline `Shrink` / `Expand` controls to the capture toast.
- Purely a capture-screen affordance; no new backend logic.

**Why after Phase 2.** The buttons only make sense once multiple modes exist.

**Success gate to proceed to Phase 4:** fraction of "one-off refines via toast" vs. "refines via Edit" tells us how many clips are *almost* right on capture — a direct measure of Phase 2's value.

---

### Phase 4 — Mode promotion prompt *(learning + consent)*

- Detect the patterns described in **Mode promotion**.
- Show the modal on next *Clips & notes* entry.
- 14-day suppression on decline.

**Why last.** The detection thresholds (±3 s, ≤ 15 s, 3 clips in a row) are informed guesses. We want Phase 1–3 data to calibrate them before shipping an automated nudge.

**Calibration plan.** Start at the stated thresholds. Review weekly for the first month:
- If acceptance > 50%, tighten the trigger (we're nudging users who would have self-switched).
- If acceptance < 30%, widen the trigger or reword the prompt.
- If decline-and-then-self-switch-within-14d is common, the prompt's copy is wrong, not its timing.

---

### Phase 5+ — Capture surfaces & Gallery *(separate specs)*

Intentionally deferred to keep this spec focused:

- **AirPods stem squeeze, Apple Watch double-tap, iOS Action Button, Dynamic Island Live Activity.** Hardware/OS integrations with their own platform constraints and review surfaces.
- **Global Commonplace Gallery.** A unified clip destination across books: "On this day" resurfacing, shuffle, daily digest, shareable cards. This is the main *retention* payoff of adaptive clip and deserves its own document.

Both depend on Phase 1–4 being in good shape. There is no point building a gallery of badly scoped clips, and there is no point wiring a hardware trigger to a capture pipeline we're still tuning.

---

### Rollout mechanics

- All phases ship behind a single `adaptive_clip` feature flag with per-phase sub-flags (`sticky_length`, `edit_modes`, `toast_refine`, `promotion_prompt`).
- Standard rollout curve per phase: **1% → 10% → 50% → 100%**, gated on guardrails.
- **Rollback plan.** Turning any sub-flag off returns the user to the previous phase's UX. Stored user state (sticky length value, mode preference) persists on the account — turning the flag back on doesn't reset the user's progress.
- **Holdout.** Hold 5% of users at Phase 0 throughout the rollout so we have a clean control for long-range analysis (e.g. "did adaptive clip actually grow clips-per-user over 6 months?").

## Summary

| | Current | Proposed |
|---|---------|----------|
| **Default clip unit** | 30 s fixed | Sentence / Moment / Scene |
| **Adapts to user** | No | Sticky length (silent) + mode promotion (consent) |
| **Typical edit effort** | Trim waveform every time | Usually zero after the first clip |
| **Mode switching** | Not available | Segmented toggle in Edit Clip screen |
| **Post-capture refine** | Open editor | Expand / Shrink in toast |
| **Capture direction** | Backward 30 s from tap | Backward from tap (unchanged) |
| **Player UI complexity** | One button | One button (unchanged) |
