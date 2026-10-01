# BUG-017 lab — observation only

> **Concluded 2026-10-01.** The blackout is a GPU-process crash in Chrome's **Skia Graphite** backend: the CVFrame stalls start 1–5 ms from the logged crashes. Dragging a card triggers it. Heavy blur (Neumorphic) makes it about 4–5× more frequent than in Black & White, which also crashed. With `chrome://flags/#skia-graphite` set to **Disabled** it does not occur at all, and with Default/Enabled it returns (owner's test). The app is unchanged. Session data: `sessions/`.
>
> The app has no defect of its own. It supplies the rendering workload that exposes the browser's failure: a card dragged to the top, with heavy blur. The log shows *where* Graphite fails: the `RasterPathAtlas` proxy is uninstantiated. *Why* it fails is for Chromium to determine.
>
> **Reported to Chromium on 2026-10-01** as issue [567972098](https://issues.chromium.org/issues/567972098). The results matrix is comment #2. While the issue is open, `bug017.html` here is its reproduction page, so do not move or delete this folder.

All personal data here is fictitious, as in the rest of this mirror. Production is not touched. The private project is not touched either.

## What this is

- **`bug017.html`** is the public `index.html` (V550, see `BUILD.json`) plus **one observer block**, `src/lab-observer.js`.
  - `src/build.py` rebuilds it, and asserts that removing the block gives the public file byte for byte.
- **`report.html`** reads what the observer stored in this browser and copies it with one button.

**The owner's rule, 2026-10-01:** nothing in the visual or functional behaviour of any design may change for an experiment. The observer only listens. It adds no style, no element and no `preventDefault`, and its listeners are passive. Before release this was checked against the public `index.html`:

| Check | Result |
|---|---|
| "Save as Image", 6 cases (4 designs, 3 languages) | pixel-identical |
| PDFs, 9 cases (CV, letter, certificate × de/en/sq) | text layer (words and positions) and pages identical |
| A trusted drag of "Berufliche Beschreibung" in Neumorphic, 150 px up | the same final position (top 452 → 302) and the same saved state in both files |

**What it records**, in `localStorage`. GitHub Pages serves both files from one origin, so the report page can read the data.
- `cv_lab_bug017_drags`: every drag (≥ 300 ms), with design, element, duration and vertical distance. This gives the **denominator**: how many drags, and how much drag time, passed *without* a blackout in each design.
- `cv_lab_bug017_context`: on **Shift ×3** (the same mark CVFrame uses) it records:
  - build and design;
  - the active and the last drag;
  - the shadow census (rendered elements with `box-shadow`, layers, blur sum: the ADR-033 metric);
  - DPR, viewport, screen, visibility and time;
  - CVFrame's latest episode.

  The census runs 1.5 s after the mark, outside CVFrame's 8-second window.
- CVFrame itself (already in the app) keeps recording frame production in `cv_bug017_frames`.

## Protocol — fixed before the first session

**Question:** is Design 4 (Neumorphic) a condition of the blackout, compared with Design 1 (Classic), under the same browser, hardware, element and movement?

**Browser:** the owner's Chrome, with GPU acceleration **on**. That is the owner's statement of 2026-10-01, which corrects the August note that it was off. At the first session, record the Chrome version and a screenshot of `chrome://gpu` → *Graphics Feature Status*.

**Page:** `bug017.html` in this folder (on GitHub Pages: `…/cv-review/lab/bug017.html`)

**Conditions:**
- **A** = Classic;
- **B** = Neumorphic.

Choose the design with the app's own design button. Nothing else is changed.

**Trial:** grab "Berufliche Beschreibung" by its frame (not by the text, which starts editing). Move it slowly up and down for about **60 s**, then release.

**Before every session (added 2026-10-01, after the owner's `chrome://gpu`):**
1. Type **`chrome://restart`** in the address bar. A short Cmd+Q is not enough: on macOS Chrome may keep running.
2. Open `chrome://gpu` and check two things: *Skia Graphite* reads **Enabled**, and *GPU process crash count* reads **0**.

**Verified 2026-10-01:** after GPU-process crashes, Chrome falls back from Graphite to Ganesh until the browser restarts (3 crashes → "Disabled"; after `chrome://restart` → "Enabled", count 0). After a blackout, the rest of that session is therefore **not** a valid trial: restart before continuing.

**Session:** four trials, in the order **A, B, B, A**. This balances drift over time.

**At a blackout:**
1. Keep the mouse held.
2. Press **Shift three times**.
3. Wait 3 s, then release.
4. Note the time.

**After each session:**
1. Open `report.html` on the same site, press **Kopjo raportin**, and paste the report into the conversation.
2. Note the *GPU process crash count* again.
3. If it rose, copy the *Log Messages* section of `chrome://gpu` as well.

**Amendment, 2026-10-01 after session 1 (declared before any further session; the decision rules below are unchanged):** a session may also cycle **all four designs** (Classic, Modern, B&W, Neumorphic) with drags of about 15 s each, repeated three times. That is what the owner did in session 1, and it balances exposure between the designs at least as well as A B B A. The comparison is made per minute of drag in each design. Repeated Shift ×3 marks within 60 s count as **one** blackout.

**Amendment 2, 2026-10-01 after `chrome://gpu` linked session 1 (it supersedes the four-design cycle; declared before session 2):** after the first crash Chrome falls back to Ganesh for the session, so **each session can yield at most one blackout**. So:
- run **one design per session**: `chrome://restart`, choose the design, and drag `professional-desc` for up to **3 minutes** of drag time, or until a blackout;
- alternate the designs across sessions: N, C, C, N, N, C, … (N = Neumorphic, C = Classic);
- after 5 sessions per design, Neumorphic ≥ 4/5 with Classic 0/5 means Design 4 is a *condition* of the crash; Classic ≥ 2/5 means the design is *not required*; anything else means continue to 10 per design.

The decision rules below were the original ones, kept for the record.

**Decision rules, written now:**
- Interpret only after **≥ 10 sessions** or **≥ 5 blackouts**.
- Blackouts only in B, none in A, with comparable drag time: Design 4's paint load is a **condition** of the blackout. That supports the paint-triggered hypothesis; the mechanism remains unproven.
- Blackouts in A and B at similar rates per minute of dragging: **the design is not the variable.**
- No blackout in 10 sessions: **inconclusive**. That is not evidence that the bug is gone.

**Out of scope for this lab:**
- any change to the design, the shadows, the drag code or its timing;
- a "GPU off" or "Skia Graphite off" (`chrome://flags`) arm. That is a change to the owner's browser and is not decided. It would be the decisive test of whether the failure lives in Graphite.
  - **Later the same day (2026-10-01), the owner did set Skia Graphite to Disabled.** That is a **diagnostic observation outside this protocol**, not a timed A/B arm. Its result: no blackout in normal use with Disabled, and the blackout back with Default/Enabled. The conclusion at the top relies on it in that sense only.
