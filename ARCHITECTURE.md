# Architecture — the layer map and what each target can actually do

Two things live here, because both answer questions that were previously only implicit and scattered:
the **layer map** (what flows through what) and the **capability matrix** (what survives each output
target). Everything below is measured from the shipped artifact, not aspirational.

**Status vocabulary — used deliberately, because "exists" and "in use" are different claims:**

| | |
|---|---|
| **LIVE** | wired to the UI; runs in normal user flow |
| **BUILT · DORMANT** | implemented and shipping, but nothing in the product calls it yet |
| **NOT BUILT** | does not exist |

---

## 1 · The layer map

```
   USER INPUT  (pointer, keyboard, drag)
        │
        ▼
   INTERACTION LAYER                         LIVE
   DragEngine · contenteditable · buttons
        │
        ├──────────────────────────────┐
        ▼                              ▼
   INTENT      CVIntent                _updateContentState()        LIVE
   COMMAND     CVCommand               (the path actually used
   REDUCER     CVReducer                today: direct state edit
   PATCH       CVPatch                  + re-render)
        │  BUILT · DORMANT              │
        └──────────────┬────────────────┘
                       ▼
                  DOMAIN / STATE                                    LIVE
                  cv_unified_app_state_v2 — the single source
                  LocalizedText · PanesEntry · Bullet · SkillColumn
                       │
        ┌──────────────┼──────────────────┬─────────────────┐
        ▼              ▼                  ▼                 ▼
   PROJECTION     HISTORY            VALIDATION        PERSISTENCE
   renderTerminalN  HistoryEngine    CVFoundation      StorageManager
                    (transactions)   CVProperty         normalizeState
        │            LIVE            CVStruct           + stable ids
        │                            CVMutation         LIVE
        ▼                            CVRoundTrip
      DOM  (outer document + srcdoc iframe)   BUILT · DORMANT
        │
        ├────────────┬───────────────┬──────────────┐
        ▼            ▼               ▼              ▼
     EDITOR       PREVIEW         EXPORT          PRINT
     LIVE         LIVE            ExportTheme     @media print
                                  → html-to-image → jsPDF
```

**The honest part of this diagram is the split in the middle.** The Intent → Command → Reducer →
Patch pipeline is fully implemented (`CVIntent`, `CVCommand`, `CVReducer`, `CVPatch`, `CVStruct` —
module-scoped consts, ~200 references in the artifact) and governed by ADR-005/024 plus seven
structural laws. **Nothing in the product calls it.** Every user edit still goes through
`_updateContentState()` and a re-render.

That is not a defect; it was a deliberate order — build the laws, then the commands, then wire them.
But a diagram that drew one arrow through Intent would be a lie about how the app runs today.

### What is genuinely absent

- **Event bus / observer layer.** There is none, and none is needed: rendering is pull-based
  (mutate state → re-render the section). Adding one would be new architecture, not documentation.
- **Plugin architecture.** Deliberately not defined — see §4.

---

## 2 · Capability matrix

Every row is a behaviour this project has actually been burned by. `✅` = works, `⚠️` = works with a
constraint, `❌` = does not work.

| Behaviour | Editor | Preview | PDF export | Print | iOS Quick Look |
|---|:--:|:--:|:--:|:--:|:--:|
| `display:none` hides an element | ✅ | ✅ | ✅ | ✅ | ✅ |
| `opacity:0` / `visibility:hidden` **excludes** an element | ❌ | ❌ | ❌ | ❌ | ❌ |
| `.no-print` class | — | — | ⚠️ ExportTheme only | ✅ | — |
| `.preview-mode` guards | — | ✅ | ⚠️ inherited¹ | — | — |
| Blurred `box-shadow`, many elements | ⚠️ paint cost² | ⚠️ | ✅ | ✅ | ✅ |
| Rounded page corners on a full-bleed export | — | — | ❌ physically³ | ❌ | — |
| `position:relative` inside the static fallback | ✅ | ✅ | ✅ | ✅ | ❌ needs `absolute`⁴ |
| Same-origin iframe access over `file://` | ⚠️ warns⁵ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Downloads from the in-app browser pane | ❌⁶ | ❌ | ❌ | — | — |

¹ The export document inherits `preview-mode` because every export is started from preview mode — the
download button exists only there. Convenient, but it is a coincidence of the flow, not a contract;
ExportTheme is the authority (ADR-032).

² **Cost tracks the NUMBER of blurred layers, not their size.** V483: 59 → 125 shadowed elements in
Design 4 dropped whole frames. Reducing blur 6px → 2px did *not* help; removing layers did (ADR-033).

³ A PDF page is an opaque rectangle. A "rounded corner" can only be faked by painting the wedge in the
*viewer's* surrounding colour — viewer-specific, tuned via `PDF_CORNER_VIEWER_GREY`.

⁴ The V482t defect: `professional-desc` needed `position:absolute!important` inside
`#cvStaticFallback` or it vanished in Quick Look. Quick Look is not Safari.

⁵ `'file:' URLs are treated as unique security origins` — a WebKit warning, not a defect. The export
still completes. Serving over `http://localhost` removes it.

⁶ Measured 2026-07-29: a real export was triggered and no file reached the filesystem. Manual export
verification is therefore the user's step, not automatable from here.

### The rule this matrix exists to enforce

**Test on the target, never on the proxy.** Desktop preview ≠ Safari ≠ iOS Files ≠ Quick Look ≠ PDF.
Four separate defects in this project's history came from assuming one implied another.

---

## 3 · Where the invariants live

ChatGPT's review called an "Invariant Engine" absent. It is not — it is `BUILT · DORMANT`:

| Harness | Checks | How it runs |
|---|---|---|
| `CVFoundation` | the gate — 8 sections | `CVFoundation.gate()` |
| `CVProperty` | 7+ domain properties, thousands of seeded random states | on demand |
| `CVStruct` | 7 structural laws (cardinality, identity, order, seq, canonical, replay, `≡doc`) | on demand |
| `CVMutation` | 28 injected defects; asserts *which* harness catches each | on demand |
| `CVRoundTrip` | State → Render → Extract → State, keyed on stable id | on demand |
| `CVDiff` | differential against a reference render | on demand |
| `CVQualify` | verdict machine (QUALIFIED / NOT QUALIFIED / AWAITING) | on demand |

**The accurate version of the criticism:** nothing asserts these *automatically after every mutation*.
Turning them on per-mutation would be a real change — and a costly one, since `CVProperty` runs
thousands of iterations. If it is ever wanted, the cheap subset is the structural laws on the changed
entity only.

---

## 4 · Plugin architecture — deliberately NOT defined

Suggested by review, and declined on the project's own principle: **Delayed Generalization**
(Constitution) and ADR-010 (YAGNI). There is exactly one renderer, one export path and one theme
mechanism. A plugin boundary drawn now would be drawn from imagination rather than from two real
implementations, and ADR-025 §3B already recorded the cost of that mistake once: *"such APIs look
beautiful now and turn out wrong later."*

Revisit when a **second** real implementation of any of these exists. Not before.

---

## 5 · Trust boundary — measured, not assumed

An external review rated security **7.5–8/10** from the Constitution alone, and this document's own
first draft called it *"a real gap — 43 `innerHTML`, 51 `JSON.parse`, no sanitizer"*. **Both were
wrong in the same direction.** Reading the artifact instead of the prose:

| Vector | Status in V486 | Evidence |
|---|---|---|
| `eval` / `new Function` | **absent** | 0 occurrences |
| `document.write` · `insertAdjacentHTML` | **absent** | 0 occurrences |
| Inline event handlers from injected markup | **stripped** | a cleaner removes every `on*` attribute before `replaceChildren` |
| **Executable *elements* in injected SVG** | **stripped — since V486 only** | `querySelectorAll('script,foreignObject,iframe,object,embed')` removed before the attribute pass |
| `javascript:` in `href` / `xlink:href` | **blocked** | `/^javascript:/i` test, attribute removed |
| Clipboard paste | **sanitised to plain text** | the paste handler strips Word/Docs/Outlook markup by design |
| Drag & drop | **files only** | handlers read `dataTransfer.files` (images → FileReader), never markup |
| External JSON import | **does not exist** | `importState` · `importJSON` · `loadFromFile` · `readAsText` all 0 |
| `innerHTML` with interpolation | **19 sites, internal values** | interpolations are generated ids (`skill-<timestamp>`) and icon markup from a fixed library — not free user text |
| `JSON.parse` (51) | **self-produced data** | 17 read `localStorage`; `normalizeState` is a whitelist reconstructor, which is the mitigation |

**So the boundary largely exists in code. What is missing is that it is nowhere stated** — no one can
tell which inputs are covered without grepping for them, which is how a guard gets dropped during a
refactor without anyone noticing.

**The condition that changes this assessment:** there is currently **no ingress for untrusted
structured data**. The day an import/paste-JSON/URL-load feature is added, the table above stops being
a description and becomes an obligation — every new entry point needs a named validator before it
ships. Formalising a trust boundary now, for inputs that do not exist, would be the same mistake as a
plugin architecture (§4).

### ⚠️ This table was stale for two releases — and the row that mattered was the incomplete one

Header updated 2026-08-15 (V484 → V486) during a documentation audit. The version was not the
important part.

**The `on*` row described half a guard as if it were the whole one.** It said inline event handlers
are stripped — true — and by saying only that, it implied the injected markup was safe. It was not:
`setSafeFlagSvg` cleaned **attributes** and left **elements**, so a `<script>` inside an SVG survived
the cleaner. Because the node is inserted with `replaceChildren` rather than `innerHTML`, it becomes
connected to the live document and **runs**.

That is BUG-018. It was never reachable — both call sites feed a fixed internal flag library — and it
is closed in V486. But the row above had asserted the guard was complete, and **no reader of this
document could have found the gap**, because the table stated a conclusion instead of a scope.

*A capability table has to say what a guard covers, not only that one exists.*

### What was genuinely owed here — and has now been delivered

The previous text read:

> *"Not a specification — an **assertion**. The guards above are invisible to the harnesses: nothing
> fails if the `on*` stripper or the `javascript:` test is deleted tomorrow. A single test that
> injects a hostile fragment and asserts it comes out inert would convert a convention into a
> contract."*

**That assertion was built and shipped: `CVSecurity`, in production since V486.** It found BUG-018 on
its first run — precisely the class of gap this section predicted, phrased here as *"how a guard gets
dropped during a refactor without anyone noticing."*

The distinction it demonstrated is worth keeping: the guard **had been read during reviews** and was
wrong in a way reading did not catch. The test caught it in one run. **Reading verifies what is
written; a test verifies what happens.**

---

## 6 · Known gaps, stated plainly

| Gap | Status |
|---|---|
| **Error recovery** | Partial. Rollback and backups are strong (`BACKUP_INDEX.md`). **A corrupted state is no longer lost (V601):** the damaged data is kept as `cv_unified_app_state_v2.unreadable`, one message is shown, and the default CV opens. A migration writes its result at once; an interrupted migration simply runs again on the next load. Both are covered by `tools/state_test.mjs`. |
| **Undo is functional, not architectural** | Measured: a transaction is `{label, undo:fn, redo:fn, merge, t}` — two closures. It holds *behaviour*, not *data*. See below. |
| **Performance budget** | Not defined. ADR-033 gives one measurable proxy (shadowed-layer count); numeric targets are an open decision. |
| **Intent pipeline wiring** | Built, dormant. Wiring it is a cycle of its own. |

---

## 7 · Undo: functional, not architectural

The external review asked the right question: *does history store `Command + Before + After + Entity
IDs`, or only a snapshot?* Measured answer — neither. A transaction is:

```js
{ label, undo: <function>, redo: <function>, merge, t }
```

Two closures. `HistoryEngine.undo()` pops one and calls `tx.undo()`. It works, it is scope-aware
('project' / 'a4'), it merges rapid same-label edits within 350 ms, and it has shipped since V463.

**What holding behaviour instead of data costs:**

| | |
|---|---|
| **Not serializable** | closures cannot be persisted — history dies on reload; undo across sessions is impossible without a redesign |
| **Not inspectable** | a transaction cannot answer *"what did you change?"*, only *"run me"* |
| **Not replayable or mergeable** | no basis for sync, conflict resolution, or collaborative editing — the very properties stable IDs were introduced to enable |
| **Outside the law engine** | `CVStruct` judges `(before, after, command)`; a closure transaction has no command, so undo/redo is the one mutation path the invariants never see |

The last row is the sharpest: the project built seven structural laws and 28 mutation tests to police
state transitions, and undo is the one transition that bypasses all of them.

**Not a defect to fix today.** Undo works, and the Intent Pipeline (§1) is the natural place a
command-based history would attach — `CVCommand` is already the serializable, inspectable record such
a history would store. That makes this a *consequence* of the adoption gap, not an independent debt:
wire the Intent Pipeline and command-based undo becomes available almost for free. Doing it before
would mean inventing a second command format.

### Measured inventory (V604, audit R-12)

`tools/undo_test.mjs` performs 14 user actions with the real keyboard and mouse (CDP Input), presses ⌘Z where the cursor is, then ⌘⇧Z, then reopens the CV.

| Action | Recorded as | ⌘Z | ⌘⇧Z | Kept |
|---|---|---|---|---|
| T1 text, iframe text, letter body, letter signature | `Tekst`, one entry per keystroke | yes | yes | yes |
| Add item, remove item, level slider, design, card drag, language | `Ndryshim (Projekt)`, an AppState snapshot | yes | yes | yes |
| A4 certificate text | `Shkrim (A4)`, scope `a4` | yes | yes | yes |
| Photo add and move | `Shto foton`, `Lëviz foton` | yes | yes | yes |
| Profile photo upload | not recorded (by design: not stored in a browser, V563; kept in a Mac document, D-006 B) | "nothing to undo" | — | no, by design |
| Terminal window minimize | not recorded (window state, not content) | "nothing to undo" | — | no, by design |

**Rules this inventory fixed in place (V604):**
- **A language switch stays in the history.** A snapshot holds `language`. Without the switch entry, a later ⌘Z of text typed in another language would write that text into the language now shown (measured). The flag and the UI language follow the state through an AppState subscription, so ⌘Z of a switch returns the flag too.
- **`HistoryEngine` is the only undo.** The old AppState stack (`appState.undo()` / `redo()`) is no longer reached from the keyboard while `HistoryEngine` exists; an empty history answers "nothing to undo / redo".
- **Text is saved where it is read.** `tools/persist_test.mjs` types into all 88 visible fields, closes the tab and reopens the CV: 88/88 are kept. Before V604, six kinds of field were lost (the letter, the professional description, the Skills/Hobby label, and two card titles). `tools/persist_webkit.js` checks the same seven fields in WebKit.
- **An element is wired once (V605, audit R-6).** `_makeEditable` adds its listeners on the first call and later renders only replace the callback. Before this, every re-render added four listeners to each iframe card title, and the oldest one, holding the boot language, saved an edit made after a language switch into the boot language. `tools/listener_test.mjs` counts the live listeners after re-render cycles: 708, with no growth. `tools/listener_map.py` maps the 320 code sites to their modules.

---

## 8 · Owner map — which module owns which part of the single file

*Mac Phase 5, audit R-3.* The core stays ONE file (Neni 5); inside it every part has an owner module. The table is **generated**, not hand-written: `python3 tools/module_map.py` splits the file into units and assigns each to a module.
- **The units:** every top-level `<style>` and `<script>` block, the iframe template, and inside the main script the named objects.
- **The checks:** the sizes add up to the whole file. A unit with no module, or two identical script blocks, is reported under *Findings*.
- **When:** rerun it after any structural change and paste the result here.

Generated by `python3 tools/module_map.py`; rerun it after any structural change. *Last run: V606 (`7d073be5`), 2026-10-08.*

| Module | Owners (named units) | Lines | Size | Share | Role |
|---|---|---|---|---|---|
| Boot and storage door | `CVStore`, `V374`, `V603`, `__cvIsPhoneViewport`, `__cvReveal` | 1277–1315, 1390–1398, 1416–1427, 12466 | 9 KB | 0.7 % | Head scripts: no-js swap, `CVStore` (the one door to document storage, V589/V594), phone viewport, boot curtain; the V603 cleanup. |
| Styles (CSS) | — | 1315–1390, 1398–1416, 1427–2279 | 190 KB | 14.0 % | Page styles: designs, terminals, export rules (`!important` lives mostly here). |
| Utilities | `Logger`, `Utils` | 2284–2316 | 6 KB | 0.5 % | `Utils` (notifications, text lookup, sanitizing) and `Logger` (silent). |
| Domain and commands | `AppState`, `CVCommand`, `CVDomain`, `CVIntent`, `CVPatch`, `CVReducer`, `CVStruct` | 2316–2910, 2926 | 66 KB | 4.8 % | The pure model: `CVDomain` (schema, laws, validation, comparison), the intent/command pipeline (`CVIntent`, `CVCommand`, `CVPatch`, `CVReducer`, `CVStruct`) and `AppState` (the single source of truth). |
| State persistence | `CVDefaultState`, `CVStateMigration`, `StorageManager` | 2910–2926 | 23 KB | 1.7 % | `StorageManager` (load/save through `CVStore`), `CVDefaultState` (the default CV), `CVStateMigration` (V600). |
| Translation | `LANGUAGE_LABELS`, `TranslationManager` | 2926–3051, 5706–5921 | 54 KB | 4.0 % | `TranslationManager` with `TRANSLATIONS` (de/en/sq msg + ui) and the language labels. |
| Terminal 1: contacts and canvas | `ContactElement`, `ContactIconManager`, `ContactManager`, `DIMENSION_OWNER_BY_KIND`, `DragSystem`, `LayoutEngine`, `SocialMediaManager`, `_cvApplyIconNode` (+14) | 3051–3238, 3465–3468, 3759–5705 | 164 KB | 12.1 % | Terminal 1 (personal): layout, drag, contact elements, social bar, icons, caret and contact-text helpers. |
| Static snapshot (Quick Look, ADR-038) | `MAP`, `_cvAssertDesignIdentity`, `_cvBakedFrom`, `_cvCanonicalForId`, `_cvChromeFactory`, `_cvChromeGroup`, `_cvComposeSnapshot`, `_cvCompositorId` (+10) | 3238–3465, 3468–3739 | 30 KB | 2.2 % | The composer of the static no-JS fallback (iOS Files / Quick Look): provenance, snapshot id, design identity. |
| Profile photo | `_cvPhotoBytesRead`, `_cvPhotoBytesWrite`, `_cvPhotoRef`, `_cvPhotoResolve`, `_cvPhotoStore` | 3739–3759 | 1 KB | 0.1 % | Profile photo bytes and reference (`_cvPhoto*`; stored only in a Mac document, V594). |
| Menu and view modes | `ModeHandler`, `SliderMenuManager` | 5705–5706, 7175–7402 | 34 KB | 2.5 % | The slider menu, the preview / edit modes. |
| Export | `CVApi`, `ExportConfig`, `ExportPreparer`, `ExportTheme`, `PDF_CORNER_VIEWER_GREY`, `PdfPipeline` | 5921–7175, 7402–7407 | 99 KB | 7.3 % | Export sheet and pipeline: `ExportConfig`, `ExportTheme`, `ExportPreparer`, `PdfPipeline` (PDF, text layer, A4 breaks) and `CVApi` (the Mac menus). |
| App runtime and terminals | `(()`, `(()=>{try{if(window.CV.init.iosFallback)return;window.CV.init.iosFallbac`, `(function(){if(window.CV.init.a11yKeys)return;window.CV.init.a11yKeys=tr`, `CV`, `Layout Architecture`, `V281`, `V343 final`, `V343 root-fix` | 7623–7939, 7987–8384, 8386–8605 | 65 KB | 4.8 % | `window.CV` / `cvApp` (terminal registry, protocol between page and iframe), focus handling, the terminal window buttons, layout wiring. |
| iframe editor (terminals 2–6) | — | 7407–7623 | 143 KB | 10.5 % | `<template id="bodyFrameSrcdoc">`: the iframe document with `CVCreator` (Skills, Experience, Education, Languages, Letter) and its own styles and markup. |
| A4 certificate and rich text | `RICH TEXT FLOATING TOOLBAR ENGINE`, `V447` | 8655–10092 | 93 KB | 6.9 % | The A4 document view: rich-text floating toolbar, pagination, caret, photos (`__a4*`, `__rt*`). |
| Photo engine | `CVPhotoEngine` | 10094–10665 | 103 KB | 7.6 % | `CVPhotoEngine`: floating photos (create, toolbar, crop, filters, balloon, drag), storage (V574 IndexedDB / V594 host), export baking, background removal, Mac host hooks (V596). |
| History (undo/redo) | `HistoryEngine` | 10666–10730 | 6 KB | 0.4 % | `HistoryEngine`: transactions with two scopes (project, a4). |
| In-page quality harnesses | `CVCommandProperty`, `CVDiff`, `CVFoundation`, `CVMutation`, `CVProperty`, `CVQualify`, `CVRoundTrip`, `CVSecurity` (+1) | 10731–12465, 12467–12564 | 137 KB | 10.1 % | Read-only harnesses that never auto-run: stable-id migration check, round trip, foundation gate, differential normalize, property and mutation testing, evidence compatibility, the verifier, security contracts. |
| Markup (HTML) | `(body outside scripts/styles)` | — | 134 KB | 9.8 % | The page body outside scripts and styles: terminals, menus, modals, the static fallback. |

### Findings

- Every unit belongs to a module.
- No identical `<script>` blocks.
- **In-page quality harnesses**: 137 KB (10.1 % of the file). They are read-only and never auto-run, but they ship with every copy of the app.

**Reading the map:**
- **The largest owners** are the styles (14 %), Terminal 1's contacts and canvas (12 %), the iframe editor of terminals 2–6 (11 %), the page markup (10 %) and the **in-page quality harnesses (10 %)**.
- **The harnesses are the one notable finding.** These read-only verification machines never run on their own, yet they ship with every copy of the app, the Mac app and the public mirror included:
  - `CVFoundation`, `CVRoundTrip`, `CVMutation`, `CVProperty`, `CVQualify` / `CVEvidenceCompat`, `CVSecurity`, `CVDiff`, `CVStableIdMigration`, `CVCommandProperty`.
- **Moving them out of the product** (into `tools/`, loaded only by the observatory) would shrink the file by about 10 %. That is an owner decision, because the constitution's verification apparatus is built on them; it is not part of the inventory.
