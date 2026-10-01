# BUG-017 lab — observation only

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
1. Quit Chrome completely (Cmd+Q) and reopen it.
2. Open `chrome://gpu` and check that *Skia Graphite* reads **Enabled**.
3. Note the *GPU process crash count*.

This matters because after GPU-process crashes Chrome appears to fall back from Graphite to Ganesh for the rest of the browser session; the export of 09:55Z read "Skia Graphite: Disabled" right after three crashes, with no flags set. After a blackout, the rest of that session is therefore **not** a valid trial.

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

**Decision rules, written now:**
- Interpret only after **≥ 10 sessions** or **≥ 5 blackouts**.
- Blackouts only in B, none in A, with comparable drag time: Design 4's paint load is a **condition** of the blackout. That supports the paint-triggered hypothesis; the mechanism remains unproven.
- Blackouts in A and B at similar rates per minute of dragging: **the design is not the variable.**
- No blackout in 10 sessions: **inconclusive**. That is not evidence that the bug is gone.

**Out of scope for this lab:**
- any change to the design, the shadows, the drag code or its timing;
- a "GPU off" or "Skia Graphite off" (`chrome://flags`) arm. That is a change to the owner's browser and is not decided. It would be the decisive test of whether the failure lives in Graphite.
