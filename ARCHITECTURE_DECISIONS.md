# Architecture Decision Records (ADR)

> One record per major decision. Format: **Context → Decision → Consequences → Status.**
> Purpose: stop re-opening settled debates months later. Append-only; supersede, never delete.
> Companion to `DOMAIN_SPECIFICATION.md` (the contract) and the Albanian Technical Constitution.
>
> **Baseline: Foundation v1.0** — signed off as DIRECTION, not a frozen final constitution.
> Some decisions are deliberately left open until proven in code.

### How ADRs arise here (a discipline worth keeping)

The direction has **flipped**. Early on it was `ADR → Code` (decide first, then build). It is now:

```
Code  →  Observation  →  ADR
```

ADR-018 was born from `_seq`; ADR-019 from the Reference Renderer; ADR-020 from the Foundation Gate;
ADR-021 from retiring the pilot; ADR-022 from performing two extractions. These records **document
behaviour that was already proven**, they are not speculation. Keep it that way: *if an ADR cannot
point at something that actually ran, it is a proposal — not a decision.*

Status legend: **Accepted** (decided) · **Implemented** (built & verified) · **Proposed** ·
**Superseded by ADR-NNN**.

### Constitution mapping (ADR → Neni — reference goes upward, never down)

The Constitution (KAPITULLI XXII, Nene 77–82, in the HTML comment atop `index-test.html`) holds
the timeless LAWS; each ADR *implements* one and cites it. The Constitution never cites an ADR.

| ADR | Serves |
|---|---|
| 001 Adopt Domain · 002 LocalizedText · 003 Persistence Adapter · 008 Interaction Model · 016 Capability Matrix | **Neni 77** (Domain First — independent of paraqitje/interaction/storage/renderers) |
| 014 Stable IDs · 017 Identity-precedes-Equality · 018 Allocator/Undo assumption · 025 Structural-commands | **Neni 78** (Stable Identity) |
| 005 Intent→Command · 023 Intent-Pipeline/Command-not-author · 024 Commands-are-data/Reducer | **Neni 79** (Intended Mutations) |
| 006 Discover-formalize-promote | **Neni 80** (Discovery before Replacement) |
| 004 Renderer-never-mutates · 012 Representations-are-Renderers · 013 Domain-knows-no-UI · 015 Pure Functions | **Neni 81** (Architectural Purity) |
| 007 No-migration-without-verification · 019 Reference-implementations-are-production-assets · 020 Foundation-Gate · 021 Scaffolding-must-retire · 022 Extraction-Protocol | **Neni 82** (Explicit over Implicit) + Kap. XIX (+ Nene 8/34/46) |
| 009 Don't-touch-iframe · 010 Delayed-Generalization · 011 4-phase/Foundation | Kap. XIX / Kap. IV / Neni 76.3 (process, not XXII) |

---

## ADR-001 — Adopt the Unified Document Domain (do NOT build a parallel model)
- **Context:** A pilot to build a "Canonical Document Model" by extracting the DOM revealed that
  terminals 2–6 are ALREADY rendered from a real, richer, multilingual model persisted in
  `localStorage`. The DOM-extracted model was a lossy parallel = an anti-pattern.
- **Decision:** Promote the EXISTING model to the single universal authority. Do not build a new
  canonical model beside it.
- **Consequences:** Far less work, far less risk. The V480 DOM-extract pilot is demoted to a
  verification harness. Real problem re-scoped as *multiple authorities* (Model + DOM + Canvas +
  Iframe), not *absence of a model*.
- **Status:** Accepted.

## ADR-002 — `LocalizedText` = `{de, en, sq}` is the text type (reject single-language)
- **Context:** Every visible string in terminals 2–6 already stores three languages; the DOM
  shows one via `_pick()`.
- **Decision:** Trilingual `LocalizedText` is the canonical text type. A single-language string
  is rejected (it would discard `en`/`sq`).
- **Consequences:** DOM is a *projection*; verification must compare same-language projections,
  not whole objects. Translation becomes a Domain operation, not a re-type.
- **Status:** Accepted (discovered — already true in the data).

## ADR-003 — Persistence Adapter: the Domain is storage-agnostic
- **Context:** `localStorage['cv_unified_app_state_v2']` was being treated as "the model."
- **Decision:** `localStorage` is only a Persistence Adapter. The Domain must not reference the
  storage key. Storage may become IndexedDB / Cloud Sync with no Domain change.
- **Consequences:** `version` field drives migrate-on-load; serialization stays total (no DOM/
  function refs in the Domain), which is also what makes Round-Trip testable.
- **Status:** Accepted.

## ADR-004 — The Renderer never mutates the Domain (one-way flow)
- **Context:** State divergence comes from bidirectional, ad-hoc DOM↔state coupling.
- **Decision:** Rendering is strictly `Domain → Renderer → DOM`. The renderer is a pure
  projection; it never writes back.
- **Consequences:** All mutation must go through Commands (ADR-005). Enables the hidden second
  renderer and deterministic Round-Trip.
- **Status:** Accepted.

## ADR-005 — Intent → Command is the only mutation path
- **Context:** Future editors are not just the user: AI, macros, batch edits, import, API.
- **Decision:** Every actor emits an **Intent** that lowers to a **Command**; Commands are the
  only thing that mutates the Domain. AI is not a module — it is one Intent generator among many.
- **Consequences:** "Add experience", "Translate all to German", "Move section above education",
  "Compress to one page" all lower to the same Commands as a human `+` click. The existing
  History Engine (transaction-based undo/redo) is the proto-Command layer to evolve.
- **Status:** Accepted (direction); History Engine = partial implementation.

## ADR-006 — Discover, formalize, promote (never blind-rebuild)
- **Context:** The pilot nearly rebuilt an asset that already existed.
- **Decision (Constitution):** Do not replace what already exists and works — discover it,
  formalize it, promote it. No new feature may introduce a new source of truth.
- **Consequences:** Small pilots earn their keep by falsifying wrong assumptions before they
  become months of work. Formalization (`DOMAIN_SPECIFICATION.md`) precedes promotion.
- **Status:** Accepted (Constitution).

## ADR-007 — No migration without an objective verification mechanism
- **Context:** "Looks the same" / "works" is not evidence; regressions hide in the gaps.
- **Decision (Constitution):** Every migration ships with Compare + Report + Metrics + Pass/Fail
  (a Compare Matrix with per-check locus and Severity), proven to FAIL on injected divergence.
- **Consequences:** The V480 pilot's matrix (22 checks, teeth-proven via 13 injected failures) is
  the template. Round-Trip and property tests extend it.
- **Status:** Accepted (Constitution). Verified once (V480).

## ADR-008 — Interaction Model is separate from the Domain (Mobile ≠ Responsive)
- **Context:** Treating mobile as CSS "responsive" leaks device concerns into the document logic.
- **Decision:** `Domain → Interaction Model → { Desktop, Mobile, Tablet } UI`. Desktop uses
  drag/resize/floating; mobile uses sheets/gestures/swipe/long-press — same Domain underneath.
- **Consequences:** A native shell (Electron / Tauri / PWA / Capacitor / iOS / Android) changes
  only the Interaction Layer. Stop reasoning in "HTML" terms about the document.
- **Status:** Accepted (direction; not yet built).

## ADR-009 — Do not touch the iframe split until the Domain can render it
- **Context:** Terminals 2–6 live in a `srcdoc` iframe (separate JS realm). Eliminating it (M2)
  FAILED TWICE (see `M2-IFRAME-ELIMINATION-BLUEPRINT.md`).
- **Decision:** Leave the iframe boundary alone until the Domain can *render from the model*
  instead of *migrating DOM*. The Domain may finally make removal safe.
- **Consequences:** Foundation work targets the Domain, not the frame boundary.
- **Status:** Accepted (constraint).

## ADR-010 — Delayed Generalization (abstract only at 2+ real uses)
- **Context:** Speculative abstraction (e.g., `DocumentType → {Resume, Portfolio, …}`) adds
  complexity before value.
- **Decision (Constitution):** Extract an abstraction only when two or more real uses need it.
  `PanesEntry` qualifies (3 uses: experience, education, qualification). A second document type
  does not (0 real uses yet).
- **Consequences:** Build `Resume` well; keep the door open to a Document Platform without
  pre-building it. "No feature is done until it preserves or reduces architectural complexity."
- **Status:** Accepted (Constitution).

## ADR-011 — Migration proceeds in four conservative phases; now = Foundation Phase
- **Context:** Jumping to dual-write risks an M2-style regression.
- **Decision:** Phase 0 read-only Extract→Compare · Phase 1 read-only Model→Hidden-Render→Compare
  · Phase 2 Shadow Model (assert-only, `console.error→snapshot→STOP`, no auto-recover) · Phase 3
  Model-is-truth (DOM renders from Domain). Before Phase 2: Round-Trip `State→Render→Extract→
  State` + property tests generated from the Domain. The current stage is the **Foundation
  Phase** — everything later (AI, mobile, export, templates, cloud sync) builds ON it.
- **Consequences:** V480 = Phase 0/1 done (extract-based; to be re-pointed at the real Domain
  schema). No dual-write until Round-Trip + property tests are green.
- **Status:** Accepted. Phase 0/1 Implemented (V480).

## ADR-012 — Document Representations are Renderers (a family, not "export")
- **Context:** PDF export was treated as a special post-process pipeline (the month-long corner
  saga was that leak surfacing). PDF is only one output.
- **Decision:** Every output is a **Renderer of the Domain** — a family: `HTML · PDF · DOCX ·
  JSON · Markdown · Canvas`. There is no "export"; there is a renderer family, each
  `Domain → Representation`.
- **Consequences:** No parallel export pipeline. Adding a format = adding a renderer. The PDF
  corner problem becomes a renderer concern, not an architecture leak. Pairs with ADR-016.
- **Status:** Accepted (direction).

## ADR-013 — The Domain must NOT know the UI  ⚖️ LAW (critical)
- **Context:** If the Domain learns CSS classes, HTML elements, resize handles, etc., in a year
  we are back to today's coupling.
- **Decision:** The Domain contains ZERO UI knowledge — no `createDiv`, no class names, no DOM,
  no CSS. Always `Entity → Renderer → DOM`. This is a **law**, enforced in every review, not a
  guideline.
- **Consequences:** Renderers own all UI vocabulary; the Domain is portable to any shell or
  representation. Any UI token appearing in Domain code is a defect.
- **Status:** Accepted (LAW).

## ADR-014 — Stable IDs for every domain entity  🔑 (critical)
- **Context:** Entities are currently addressed by array INDEX (`items[ei]`) — fragile under
  reorder / merge / sync. The V480 pilot even used index-based ids (`exp-0`), which are NOT
  stable.
- **Decision:** Every domain entity (Experience, Education, Qualification, SkillColumn, Skill,
  Bullet, Language, …) carries a permanent, unique `id` that survives reordering and edits.
- **Consequences:** Unlocks diff, merge, cloud sync, collaboration, AI edits, undo/history,
  analytics. Compare/Round-Trip must key on `id`, not index. Adding ids to the current
  index-addressed model is itself a migration, governed by ADR-007.
- **IDs live in the Domain, never in the DOM as source.** The DOM may carry `data-id` ONLY as a
  renderer-set *projection*; reading identity back from `div.dataset.id` is forbidden — that path
  silently turns the DOM into the authority (violates Neni 81 / ADR-013). `Domain → Renderer → DOM`;
  identity flows one way.
- **Precedent:** the Terminal-1 canvas layer (`contacts[]`, `skills`, `prof`) already carries stable
  string ids (`c-email`, `prof-desc`). Only the model-driven T2–6 collections are index-addressed —
  they are the migration target.
- **Status:** Accepted (TARGET — not yet in the T2–6 model; those are index-addressed today).

## ADR-015 — Pure Functions First
- **Context:** Testability of the core.
- **Decision:** `Renderer, Validator, Normalizer, Migrator, Compare, Extractor` are pure
  functions (`input → output`) — no DOM, localStorage, window, or globals. Side effects live only
  in thin edge adapters that wrap the pure core.
- **Consequences:** Property tests + Round-Trip run headless. The V480 pilot's `readEntriesFrom`
  currently reads live DOM (impure) → refactor so normalize/compare are pure and DOM reads are an
  edge adapter.
- **Status:** Accepted.

## ADR-016 — Capability Matrix for Renderers
- **Context:** Not every renderer supports every feature (animation/drag-handles are HTML-only;
  JSON has no "links"; editor metadata must never reach PDF/DOCX).
- **Decision:** Maintain an explicit **Capability Matrix** (feature × renderer → ✅ / optional /
  N-A). Each renderer declares its capabilities; the feature layer checks before assuming.

  | Feature | HTML | PDF | DOCX | JSON |
  |---|---|---|---|---|
  | Links | ✅ | ✅ | ✅ | N/A |
  | Animation | ✅ | ❌ | ❌ | ❌ |
  | Drag handles | ✅ | ❌ | ❌ | ❌ |
  | Editor metadata | ✅ | ❌ | ❌ | ❌ |
  | Comments | ✅ | optional | optional | ✅ |

### Capability has TWO dimensions — projection is a function of both
```
Renderer Capability (HTML · PDF · DOCX · JSON)
                ×
Interaction Capability (Desktop · Mobile · Readonly · Editable)
                ↓
        Project(renderer, interaction, state)
```
Today the interaction axis changes nothing; tomorrow HTML-Desktop may carry drag/hover/comments while
HTML-Mobile does not — and the contract does not have to change, only the capability declaration.

### Round-trip fidelity classes (the contract for ADR-017 / Round-Trip)
```
Canonical State → normalize → A' → Project(renderer,interaction) → Representation
                → Extract → Candidate → normalize → C
```
| Class | Renderers | Contract |
|---|---|---|
| **Canonical-capable** (serialization) | JSON | `A' == C` exactly |
| **Projection** (lossy by construction) | HTML | `IDs(A') == IDs(C)` **and** `P(r,i,A') == P(r,i,C)` |
| **One-way** (no extractor) | PDF · DOCX | **no round-trip contract** — declared, not implied |

**`Projection ≠ Serialization`.** HTML renders ONE language via `_pick()`; `en`/`sq` never reach the
DOM, so `A' == C` is impossible there *by construction* — asserting it would only pass by lying.
Scoping equality to the renderer's declared capability makes `A' == C` true exactly where it is true.
- **Consequences:** No ambiguous "should PDF animate?" decisions; features degrade predictably; a new
  renderer (SVG/Excel/Video) plugs in by declaring capabilities — the round-trip formula is unchanged.
- **Status:** Accepted (direction).

## ADR-017 — Identity precedes Equality (Identity before Comparison)
- **Context:** A Compare/diff that asks "are these equal?" while pairing entities by array index is
  really doing statistics, not comparison — it can report success or failure for the wrong reason
  the moment order changes (drag, sort, merge, import, AI insert, collaborative edit). Principle
  (newly articulated): *do not build proofs on coordinates that are expected to change.*
- **Decision:** Comparison is a two-step: FIRST establish "am I comparing the same entity?" (pair by
  stable `id`, ADR-014/Neni 78), THEN compare values. The Compare Matrix keys rows by `id`; entities
  present on only one side are `entity-presence` failures, not value mismatches.
- **Consequences:** Round-Trip, Shadow Model, and any future merge/sync inherit correct entity
  pairing. This is why Stable IDs (ADR-014) must land BEFORE Round-Trip is built.
- **Serves:** Neni 78. **Status:** Accepted.

## ADR-018 — Architectural ASSUMPTION: the id allocator's monotonicity depends on the current Undo model
- **Context:** `_ensureStableIds` keeps a persistent high-water mark at `state.meta.seq[<type>]`, so a
  deleted entity's id is never re-issued (fixes the `exp_0004` resurrection). But the allocator lives
  INSIDE the undoable state, and this system's current contract is **`Undo = restore snapshot`** (the
  History Engine restores whole prior states) — so an undo rewinds `meta.seq` along with everything else.
- **The assumption that must hold:** Undo restores a whole prior snapshot AND the local timeline is
  linear. Then an entity whose creation was undone no longer exists, and re-issuing its number is
  harmless.
- **When it breaks:** the moment Undo becomes **`inverse commands`** (ADR-005 Intent→Command), or
  merge/sync/collaboration introduces branches. A rewound allocator can then re-issue a number that
  another branch already bound to a different entity → identity collision across branches.
- **Decision:** Record this as an explicit architectural **assumption**, not a TODO. It is a dependency
  of ADR-014 on the current Undo model. When ADR-005 lands, the allocator MUST move OUTSIDE the
  undoable snapshot (or Undo must apply `max(restored, current)`), and this ADR is revisited in the
  same change.
- **Detection:** `CVStableIdMigration.lifecycleReport()` step 7 (severity **Minor/Future**) surfaces the
  rewind; it is EXPECTED to flag until ADR-005 lands. A green step 7 would mean the assumption changed.
- **Serves:** Neni 78 (+ depends on ADR-005). **Status:** Accepted (assumption recorded; revisit with ADR-005).

## ADR-019 — Reference Implementations are Production Assets
- **Context:** The Reference Renderer was built to prove the Domain can render Experience correctly.
  The reflex after a test goes green is to delete the "test double".
- **Decision:** A reference implementation is **never deleted once green**. It is kept permanently as
  the comparison standard the production implementation is verified against. This is standard practice
  in compilers and database engines: the reference implementation *is* a production asset.
- **Consequences:** `renderExperience` (Reference Renderer) stays in the codebase and inside the
  Foundation Gate. When Reference is promoted to Production (Phase 3) the roles **swap** — the LEGACY
  renderer becomes the reference for the transition — and the pair never disappears while both exist.
  A reference implementation is therefore budgeted as product code, not test scaffolding.
- **Serves:** Neni 82 (Explicit over Implicit) + ADR-007. **Status:** Accepted.

## ADR-020 — The Foundation Gate is the entry condition for core refactors
- **Context:** Every step so far was additive, reversible, and harness-verified. Step 4 (Domain Core)
  is the FIRST that reorganizes the production core (`StorageManager` / `normalize` / renderers).
  At that point "verify passed" stops being a meaningful unit of confidence.
- **Decision:** One aggregate verdict — `CVFoundation.report()` — spans **Stable IDs · Lifecycle ·
  Round-Trip · Reference Renderer · Storage · Console** and returns **GREEN / RED**.
  **No refactor of `StorageManager`, a Renderer, or `normalize` may land unless the Gate is GREEN —
  both BEFORE and AFTER the change.** Foundation v1.0 is logically **frozen at the first GREEN gate**
  (a tag for comparison, NOT a development freeze).
- **Consequences:** The unit of confidence moves from a single test to the Foundation as a whole.
  Operationalises ADR-007 (no migration without an objective verification mechanism) and Kapitulli XIX.
  After any core change the workflow is one command: `CVFoundation.report()` → green ⇒ safe.
  Known-expected signal: Lifecycle step 7 flags **Minor/Future** by design until ADR-005 (see ADR-018);
  it does not turn the Gate red.
- **Serves:** Neni 82 (+ Kap. XIX). **Status:** Accepted.

## ADR-021 — Temporary validation systems must RETIRE (scaffolding self-destructs)
- **Context:** The V480 `CVExperiencePilot` was indispensable — it is what falsified the "there is no
  model" assumption. But once the **Reference Renderer + Compare Matrix** took over its function, the
  pilot stopped being part of the architecture and became a **historical scaffold**. Left in place,
  scaffolds accumulate — `PilotV1`, `PilotV2`, `CompareOld`, `CompareNew`, `MigrationOld`,
  `MigrationNew` — until nobody can say which one is authoritative.
- **Vocabulary (deliberate):** such a thing is **not "ghost code" or "old code"** — it is an
  **Expired Validation Artifact**. It *had* value; its mission simply completed. The name matters: it
  is retired because it finished its job, not because "we don't need it".
- **Decision:** A temporary validation system has a defined lifecycle and MUST retire at its end:
  `Pilot → Reference → Production → Pilot removed`. Retirement is mandatory, not optional.
- **The retirement test (required before deletion):**
  ```
  Foundation Gate  →  [artifact present]   ⇒ GREEN
  remove artifact
  Foundation Gate  →  [artifact absent]    ⇒ must still be GREEN
  ```
  GREEN → GREEN proves the artifact was genuinely unnecessary. **GREEN → RED proves it was still
  holding something alive** — then it is not scaffolding, and must not be removed.
- **Distinction from ADR-019 (which it does NOT contradict):** a **Reference implementation** is a
  *permanent* comparison standard for a live production implementation → never deleted. A **temporary
  validation artifact** proved a one-time transition → must retire. Reference = asset; scaffold = debt.
- **Applied 2026-07-16:** `CVExperiencePilot` (V480, ~12KB) retired. Retirement test executed:
  Gate GREEN (present) → removed → Gate GREEN (absent), all 6 sections identical. It also violated
  ADR-001 by then (it tested the superseded lossy *parallel* model) and Neni 34/46.
- **Serves:** Neni 82 (+ Neni 34, Neni 46). **Status:** Accepted (and exercised once).

## ADR-022 — The Extraction Protocol (proven, not invented)
- **Context:** Phase B moves responsibilities into the Domain Core one at a time. The first extraction
  (Identity) produced a working method; the second (Comparison) confirmed the method **generalises**
  rather than fitting one lucky case. Re-deriving the method per extraction invites intuition exactly
  where a procedure belongs — and the last extraction will be `normalizeState`, the central production
  path.
- **Decision:** every extraction follows the SAME six steps, in order:
  ```
  1. Measure the call graph        (definitions + call-sites, BEFORE)
  2. Extract the responsibility    (not "move the function")
  3. Remove the duplicate          (no shim, no pass-through — Nene 8/34)
  4. Verify purity                 (0 DOM/window/localStorage/globals in the extracted core)
  5. Foundation Gate               (GREEN — ADR-020)
  6. Commit
  ```
- **Step 2 is a mindset, not a mechanic:** the origin stays the **ORCHESTRATOR** (it keeps the side
  effects — storage, DOM, logging); the Domain becomes the **OWNER** of the logic. "The origin loses a
  function" is the wrong picture and produces worse code.
- **Equivalence criteria (step 1 vs step 5) — proves the change was purely organizational:**
  same call-site count · same input · same output · Gate GREEN.
- **Purity is measured on CODE, not text:** strip `/* comments */` before counting — the ADR-015 prose
  inside a header legitimately contains the words `localStorage`/`window`. Also prove the core runs on
  plain objects with **no app context**, and that it still detects a real divergence (a pure function
  that always passes is worthless).
- **Consequences:** when `normalizeState` is extracted the procedure is followed, not the intuition.
  Two extractions have now passed it unchanged — Identity (V481f) and Comparison (V482) — including one
  genuine boundary discovery: `renderExperience`/`extractExperience` touch the DOM and therefore may
  **not** enter the Domain (ADR-013); only the pure logic moved.
- **Serves:** Neni 82 (+ Nene 8/34, ADR-013/015/020). **Status:** Accepted (exercised 2×).

## ADR-023 — It is an Intent PIPELINE, not a "Command Layer" (and a Command is not an author)
- **Context:** ADR-005 named the missing layer "Intent → Command". Calling the whole thing a "Command
  Layer" makes Command sound like the destination; it is one phase among several, and naming it that
  way invites putting validation, normalization and persistence *inside* commands.
- **Decision:** The layer is the **Intent Pipeline**:
  `Intent → Validate → Normalize → Command → Apply → Normalize → Validate → Compare → Render`.
  Validate/Normalize appear **twice on purpose** — once inbound (is the request sane?), once outbound
  (is the result canonical?).
- **The law it adds — §B15 Command Authorship Invariant:** a Command produces only a **candidate**
  state. This completes the authorship chain: **the DOM is not an author (Neni 81.4) → the Renderer is
  not an author (§B14) → the Command is not an author (§B15). The Domain is the sole author.**
- **Consequences:** a Command may never write storage, touch the DOM, or feed a renderer directly; its
  output re-enters the pipeline and must survive Normalize → Validate before anything treats it as
  truth. Storage · Renderer · Undo/History · Transport are **adapters**, not participants.
- **Serves:** Neni 79 (Intended Mutations) + Neni 81. **Status:** Accepted (contract written before code).

## ADR-024 — Commands are DATA; the engine is a REDUCER, not an executor
- **Context:** The obvious implementation is `CommandExecutor` with imperative methods. That hides
  state in the executor, is hard to test, and cannot be replayed or transported.
- **Decision:** A Command is **plain JSON data**
  (`{type:'setLocalizedText', entity:'experience', id:'exp_0004', field:'title', lang:'de', value:'…'}`),
  never an in-place mutation, and the engine is a pure **Domain Transition Function**:
  **`patch = transition(state, command)` → `candidate = applyPatch(state, patch)`**.
- **Named "Domain Transition Function", not merely "reducer":** its responsibility is the *state
  transition*, not the *execution of commands* — the name keeps execution semantics out of it.
- **A PATCH sits between the transition and the state** (decided before the first command, deliberately):
  the transition returns `{type:'set', target:{entity,id,field,lang}, value}`, and one small applier is
  the ONLY code that knows the physical shape. Many future commands (Insert/Delete/Move/MergeImport/AI
  Rewrite) collapse onto the same few patch operations; retrofitting this after a dozen commands would
  be far more expensive than defining it now. **A target is a DESCRIPTOR (entity+id+field+lang), never a
  PATH** — a path like `experience[3].title.de` bakes today's structure, and an index is a coordinate
  expected to change (Neni 78).
- **The Command Contract** (full table in `DOMAIN_SPECIFICATION.md` Part E): deterministic · pure ·
  replayable · serializable · canonical-after-normalize · preserves Stable IDs · preserves invariants ·
  renderer-independent · **storage-independent (a Command may NEVER call StorageManager)**.
- **Consequences:** because a reducer is `input → output` like the rest of the Domain, **every existing
  harness applies to it unchanged** — Property, Differential, Round-Trip and Mutation Qualification all
  work on reducers with no new machinery. It is also the precondition for Undo/Redo, merge, sync,
  collaboration, AI editing, macros, history and analytics: each needs commands to be inspectable,
  storable and replayable.
- **Build order (narrow on purpose):** Phase 1 empty skeletons (`CVIntent`/`CVCommand`/`CVReducer`) →
  Phase 2 exactly ONE command, `SetLocalizedText` (no structural side effects) → Phase 3
  Insert/Delete/Move (these touch identity, order and `meta.seq`, so only after the pipe is proven).
- **Serves:** Neni 79 (+ ADR-013/015, ADR-023). **Status:** Accepted (contract written before code).

## ADR-025 — Structural commands: identity, the allocator, order, and what Replay means
- **Context:** `SetLocalizedText` is a *local* transform. `Insert`/`Delete`/`Move` change the document's
  **shape** — cardinality, identity and order — and each of those has more than one plausible owner.
  Left undecided, the answers would be settled accidentally by whoever writes the first reducer.
  A **Design Gate** was taken before any structural code was written (full contract: Part F).
- **Decisions:**
  1. **Identity is authored only by `CVDomain.Identity`.** A structural command inserts an entity with
     **no id**; `normalize()` → `ensureStableIds` assigns it. A Reducer that mints ids would be a second
     author of identity — the exact failure mode ADR-018 exists to prevent. The caller learns the new id
     from `ids(after) \ ids(before)`, which is already a structural law, so nothing extra is needed.
  2. **`meta.seq` has exactly one writer: `ensureStableIds`.** Never a Reducer, Patch or Command.
     Already enforced — mutation **M19** is DETECTED.
  3. **A Move preserves identity; it is NOT delete+insert** (Neni 78.4: identity is independent of
     position). Therefore `meta.seq` does not advance on a Move, and Compare reports only an order change.
  4. **Two named replay guarantees.** Define `A ≡doc B` ⇔ `A.content == B.content` (the allocator is
     bookkeeping, not content). **Replay Determinism is guaranteed byte-identical**; **cancellation
     (`Insert` then `Delete`) is guaranteed only under `≡doc`** — `meta.seq` has advanced and must never
     go back. This makes an otherwise-invisible assumption explicit and testable.
  5. **`normalize()` must never reorder a collection.** Order is author-controlled document data. Any
     sorting is a *projection* (renderer) or an explicit `SortExperiences` command — never implicit, which
     would silently undo a user's Move. New required law: `normalize-preserves-order`.
- **Consequences:** commands now **declare a structural class** (`none`/`insert`/`delete`/`move`) and the
  property harness asserts that class's identity law — `cmd-identity-preserved` is the `none`-class law
  and must not be applied blindly to structural commands. A new property family (`struct-*`) is required
  before the first structural command ships, mirroring how Part E's laws preceded `SetLocalizedText`.
- **Serves:** Neni 78 · Neni 79 (+ §B15, ADR-014/017/018/024). **Status:** Accepted (contract before code).

---

## ADR-026 — Author / Verifier separation, and Qualification vs Diagnostics
- **Context:** two problems converged. (a) *Organizational:* concurrent sessions editing one 1 MB
  single-file monolith made write collisions total rather than partial. (b) *Epistemic:* the same
  agent writing both the implementation and the tests will, unavoidably, write tests shaped like the
  implementation it already has in mind. Neither is a coding problem, so neither has a coding fix.
- **Decisions:**
  1. **Two roles, one direction of flow.** `Design Contract → Verifier builds gates → Author
     implements → Verifier runs gates → PASS = merge / FAIL = report`. The **Verifier never returns
     to the implementation phase**. The Author does not touch the harness; the Verifier does not
     touch product logic.
  2. **No cross-session guidance during work.** The Verifier measures the *artifact*, never the
     *intent*, and treats it as a **black box**. A Verifier that tells the Author how to implement
     has gradually become a co-author of the solution it is supposed to judge independently.
  3. **The contract is frozen BEFORE the implementation exists.** This is what keeps Mutation
     Qualification honest: the laws are written for the contract, not for the code that arrives.
     Corollary: **once an implementation exists, no new law may be added for it** in the same round
     — a law invented after seeing the code is a description of that code, not a test of it.
  4. **Two levels, strictly separated.**
     **Qualification (mandatory, decides the verdict):** Contract · Property · Mutation ·
     Differential · Foundation Gate.
     **Diagnostics (informational, decides nothing):** timing · counts · seed range · law coverage ·
     analyses. A verdict must never be influenced by the tooling that merely *describes* the run —
     otherwise a slow or noisy diagnostic can veto correct code, and a clean one can flatter broken code.
  5. **A failure report contains exactly three things: the law that broke, the evidence, and the
     reproduction.** It contains **no proposed fix.** Choosing the remedy is the Author's act.
  6. **A non-existent command is `AWAITING ARTIFACT`, not `NOT QUALIFIED`.** There is nothing to
     judge. This is what lets the harness sit *passive* — armed and waiting — rather than reporting
     a false failure for work that has simply not arrived yet.
- **Consequences:** `CVQualify` implements the verdict machine and the standard report. The Verifier's
  own discipline became mechanically checkable: `grep -c moveExperience` in product code must be `0`
  while the Verifier is preparing that command's gates.
- **Serves:** Neni 79 · Neni 80 · Neni 82 (+ ADR-020/021/022/025). **Status:** Accepted.

---

## ADR-027 — A threshold is not a mandate: backups as provenance, and the third status
- **Context:** the backup policy says "keep the 5 most recent." Eleven existed. The mechanical reading
  is "policy violated → prune." But under the Author/Verifier split (ADR-026) backups stopped being
  purely technical artifacts: they are **provenance**, and another session may still be resting on them.
  Deleting them would be an irreversible side effect taken *outside the Verifier's role*, justified by
  nothing more than a number being exceeded.
- **Decisions:**
  1. **"5 backups" is a policy TARGET, not an invariant to enforce at every moment.** Exceeding it is a
     **state to report**, not a trigger to act.
  2. **Three states, reported honestly** — the same grammar the qualification harness already uses:
     `COMPLIANT` (at or under target) · `TEMPORARY OVERFLOW` (over target, *with a stated reason* —
     e.g. active multi-session work) · `MAINTENANCE REQUIRED` (over target **and** safe to prune).
  3. **During active work:** never delete a backup created by another session; allow the count to exceed
     the target.
  4. **Rotation happens only in a Maintenance Window**, gated on five preconditions: no active Author ·
     no active Verifier · HEAD stable · Foundation Gate GREEN · a confirmed restore point exists.
     Pruning then produces a short cleanup log.
  5. **Pruning is an ADMINISTRATIVE operation, not part of verification.** Keeping it outside the
     Verifier's process is what preserves the role separation ADR-026 established.
- **The general principle (this is the transferable part):** *a threshold being crossed is not, by itself,
  licence for an irreversible act.* The project already encodes this distinction three times —
  `AWAITING ARTIFACT` ≠ `NOT QUALIFIED`, `INCONCLUSIVE` ≠ `FAIL`, `TEMPORARY OVERFLOW` ≠ policy violation.
  Each separates **"the condition for a confident answer is absent"** from **"the answer is no."** Collapsing
  them always errs the same way: it manufactures a failure and then acts on it.
- **Consequence discovered while measuring the preconditions:** precondition ④ was itself unreliable.
  `CVFoundation.qualify()` caches whatever `CVMutation.run()` returns — *including an aborted or refused
  run* — and the Gate then rendered that degenerate cache as `0/0 detected`, a **fabricated red**. Fixed
  by giving the Gate the same `INCONCLUSIVE` reading as `CVQualify`: it still blocks, but it now states
  that the suite did not execute rather than implying that mutations escaped.
- **Serves:** Neni 21 (backups) · Neni 82 (explicit over implicit) · ADR-026. **Status:** Accepted.

---

## ADR-028 — The Verifier is read-only: collect ≠ report, and the verdict as a state machine
- **Context:** `CVQualify.report()` executed the harnesses and then classified the results. That made it
  an **orchestrator wearing a reporter's name**: its output was not a snapshot of a moment but a
  moment it had itself created, and every call silently changed state (it repaired the mutation cache
  as a side effect of running `qualify()`).
- **Decisions:**
  1. **Three phases, one of which may mutate.** `collect(type, opts)` executes the harnesses and stores
     an evidence snapshot — the ONLY side-effecting entry point, named for what it does.
     `classify(snapshot)` is pure: snapshot → verdict. `report(type)` is pure: reads the stored
     snapshot, classifies, formats.
  2. **INVARIANT: a verdict must not require additional executions to compute.** `report()` runs no
     Property, no Mutation, no Differential, no Gate; repairs no cache; changes no state. Verified by
     wrapping all five harness entry points and counting calls during `report()` — **0 across the board.**
  3. **Snapshots are deep-frozen.** A report must not be able to edit the evidence it reports on. A
     tampering attempt leaves the value unchanged.
  4. **The four verdicts are a DECISION TREE, not four labels** — each corresponds to a different
     *phase* of the process, not to a numeric result:
     `artifact exists? no → AWAITING ARTIFACT` · `qualification executed? no → INCONCLUSIVE` ·
     `any gate FAILED? yes → NOT QUALIFIED` · `any gate could not run? yes → INCONCLUSIVE` · else `QUALIFIED`.
  5. **Precedence `NOT QUALIFIED > INCONCLUSIVE > QUALIFIED`:** a real failure overrides any absence of
     information; an absence of information overrides a stale PASS; only complete evidence yields
     QUALIFIED.
  6. **Never report a field that was not measured.** With no snapshot, ENVIRONMENT prints
     `not measured` for every unmeasured field rather than a remembered value. Emitting a historical
     number is how **truth drift** begins: the report mixes remembered data with measured data and the
     reader cannot tell which is which.
- **Consequence:** an artifact that exists but has never been qualified now reads `INCONCLUSIVE` with
  `Qualification: NOT EXECUTED`, which is the honest state — previously this could not be expressed at
  all, because asking the question performed the measurement.
- **Serves:** Neni 82 · ADR-026 (role separation) · ADR-027 (a threshold is not a mandate).
  **Status:** Accepted.

---

## ADR-030 — Two snapshot invariants (they subsume most of the qualification-layer refactors)
- **Context:** the V482 review round fixed environment↔profile, root.property↔gates.Property, and
  found `mutationCache` as a third stored derivation — three instances of ONE pattern, each fixed as a
  special case. Two general rules retire the whole class and pre-empt the next instance, so they are
  worth stating once rather than rediscovering per field.
- **Invariant 1 — PRIMARY FACTS ONLY.** *A snapshot never stores a fact that can be deterministically
  reconstructed from its other fields; every derivable value is rebuilt at READ time.* Retroactively
  covers `environment` (derivable from profile+context), `propertyFirstFail`/`propertyFailedLaws`
  (=`gates.Property.*`), and `mutationCache` (=a label over `gates.Mutation`) — no per-field ruling
  needed. Corollary: the report COMPOSES its display; it does not read a stored copy of it.
- **Invariant 3 — IDENTITY IS EXPLICIT AND CANONICAL.** *No consumer may DEDUCE identity from content;
  it READS it — and there is exactly ONE way to represent each identity.* Three obligations:
  (i) every identity is stored explicitly (`snapshotSchemaVersion`, `profileId`, future
  `algorithmVersion` are DECLARED metadata, never reconstructed implicitly);
  (ii) every identity has a SINGLE authoritative source;
  (iii) no two ids represent the same concept.
  "Explicit" alone only guarantees identity is *stored*; "canonical" adds that it is stored ONE way —
  the direct continuation of PRIMARY FACTS ONLY. This is the counterpart to Invariant 1: Inv-1 forbids
  storing what can be derived; Inv-3 requires the few things that ARE identity to be stored explicitly
  and uniquely. Migration depends on it — a `SnapshotMigration` keys off a declared, canonical version;
  inferring the version by sniffing shape (as `schemaOf` must for pre-versioning snapshots) is a
  fallback, not the design.
- **Invariant 2 — CONSUMERS SEE ONLY THE CURRENT SCHEMA.** *Every consumer (classify, drift, report,
  and any future reader) operates on the current schema; translating an older snapshot to it is a
  `SnapshotMigration` that runs BEFORE the consumer, never an if/else inside each consumer.* Today
  `schemaOf()` + the typed-unreadable path is the seam; when `cvq-snap-3` arrives, a migration chain
  (`unversioned → cvq-snap-1 → cvq-snap-2 → current`) attaches there and every consumer stays blind to
  schema history. This is why "unreadable" is a typed contract answer and not a throw: it is the point
  where a migration would slot in.
- **Consequence:** these two rules are the standing test for any future snapshot field — "is it a
  primary fact?" and "does every consumer read it through the current schema?" A field that fails
  either is debt the moment it is added.
- **Invariant 1 is now MECHANICAL, not just prose:** `CVQualify.hygiene(snap)` checks the snapshot's
  top-level fields EQUAL the declared `PRIMARY_FIELDS` **as a SET** — flagging both EXTRA fields (a
  stored derivation, the debt Inv-1 forbids) AND MISSING fields (`{id,profile}` is as invalid as
  `{id,profile,environment}`). Membership only (`indexOf`), so field ORDER is never part of the
  contract — the contract is `SET(fields)`, not `ARRAY(fields)`. It is an ALLOWLIST (every NEW field
  must be consciously added; a denylist would miss unknowns). The Compatibility report surfaces it on
  the current golden as `ADR-030 Inv-1 (primary facts only): PASS`. Verified with teeth: a fresh
  snapshot PASSes; injecting `environment`/`mutationCache` → `extra`; dropping to `{id,profile}` →
  `missing`; reversed key order → still PASS. Invariant 2 stays a design rule (statically harder —
  "a consumer reads a historical schema" is a code-shape property); `schemaOf()` + the typed-unreadable
  path remain its seam.
- **`PRIMARY_FIELDS` is a CONTRACT (executable documentation), not a convenience array.** Any change to
  it follows a fixed order, never the reverse: **edit the ADR → edit `PRIMARY_FIELDS` → bump
  `snapshotSchemaVersion` → recapture golden fixtures.** Changing the array first would let the schema
  drift ahead of its own specification.
- **Operating procedure, codified (not a bug):** when a modified-on-disk / concurrent-write warning
  fires, the response is `warning → STOP → measure (diff against last known-good) → continue only if the
  only delta is your own`. This fired once on the hygiene edit and the diff proved the sole change was
  the local edit; the procedure — not the absence of a real collision — is the safeguard.
- **Serves:** Neni 5 (single source of truth) · Neni 82. **Status:** Accepted (codifies existing practice).

---

## ADR-029 — What defines the semantic identity of a law / mutation? (OPEN · FOUNDATIONAL)

> **RULE ZERO — do not discuss implementation until Q1–Q3 are settled.**
> Not hashes, not algorithms, not code. The moment the conversation reaches "we could hash X", the
> semantics is being decided *inside* the implementation — the exact failure this ADR was frozen to
> prevent (Neni 82). Treat this as a **design document worked in strict order**, not an open debate:
>
> **Q1 · Identity** — *when we say two pieces of evidence are "the same evidence", what do we mean?*
> Produce a formal definition. No mention of hashing, representation or versions at this stage.
>
> **Q2 · Representation** — *only once Q1 is closed:* what is the canonical representation of that
> identity? (text · AST · semantic structure · behaviour · something else)
>
> **Q3 · Versioning** — *only once the canonical object is known:* which changes change the identity?
> Algorithm version, corpus, normalisation rules belong here — and nowhere earlier.
>
> The order is a chain: Q2 cannot be chosen without Q1; Q3 cannot precede Q2. **Work it in a
> full-budget session with no release pressure** — this decision governs every future fingerprint
> implementation, and there is no operational deadline forcing it.
>
> ### RULE ZERO as a contract
>
> Until **Q1 (Identity)**, **Q2 (Representation)** and **Q3 (Versioning)** are each closed with a
> documented decision:
>
> - **Permitted:** alternatives · evidence · advantages · disadvantages · decisions.
> - **Forbidden:** implementation, pseudocode, APIs, data structures, class/function names,
>   serialization formats, and any other detail that constrains an implementation choice.
>
> Any implementation discussion is **out of scope for ADR-029** until Q1–Q3 are complete.
>
> The ban runs until **all three** are closed, not merely "none before the question at hand": a
> sketched API at Q1 silently dictates Q2's answer — the same failure one level up. Keeping the ADR
> purely semantic is what lets it survive the implementation being rewritten several times. **An ADR
> that names functions ages with the code; an ADR that defines meaning does not.**

- **Foundational status:** this ADR is not merely technical — Identity → Representation → Versioning
  defines the EVIDENCE PHILOSOPHY of the whole system, the way ADR-030 defines the snapshot invariants.
  **Binding rule: no ADR or implementation that touches evidence may be approved if it contradicts
  ADR-029.** While it is Open, that force is exercised as a GATE — no evidence-identity-touching code
  ships until the three questions are answered (the closure rule in the milestone). Once Decided, it
  becomes the source of truth for identity, and later evidence work is judged against it.
- **Context:** the drift fingerprint hashes law/mutation identity by NAME/ID only. This was **measured
  blind to BODIES**: changing a law's implementation while keeping its name leaves drift reporting
  `CURRENT` — a false-current, a real correctness hole (V482 review). The mechanism to close it must
  hash something that represents the law's *meaning*. **What that something is has more than one
  plausible answer, and the choice must NOT be settled silently inside the implementation** (Neni 82).
- **PREREQUISITE question (must be answered FIRST — the algorithm is a CONSEQUENCE of this, not the
  reverse):** *what counts as a semantic change?* Only once each row below has a Yes/No can any
  algorithm be judged, because the algorithm is correct exactly insofar as it agrees with this table.

  | code change | semantic change? | A toString | B canon-source | C canon-AST | E behavioural |
  |---|---|---|---|---|---|
  | whitespace | **No** | ✗ says changed | ✓ | ✓ | ✓ |
  | comment | **No** | ✗ says changed | ✓ | ✓ | ✓ |
  | parameter/local rename | **No (behaviour same)** | ✗ | ✗ | ✓ *if* α-renaming | ✓ |
  | extract a private helper | **No (behaviour same)** | ✗ | ✗ | ✗ | ✓ |
  | reorder independent statements | **No** | ✗ | ✗ | ✗ | ✓ |
  | change the logic | **YES** | ✓ | ✓ | ✓ | ✓ |

  **What the table reveals (this is the real finding):** every *source/AST* representation (A/B/C)
  treats a behaviour-preserving refactor — extract-helper, reorder, rename — as a CHANGE, i.e. false
  drift. The only representation that tracks *meaning* rather than *text* is a **behavioural** one, and
  the project already owns the machinery for it (the harness runs every law and mutation). Hence a
  fifth alternative, added below. NB: the ambiguous rows above are a **decision the author must make**,
  not a fact to look up — they are exactly where the alternatives diverge.
- **Question:** what is the canonical representation of a law/mutation's semantic identity?
- **Alternatives:**
  - **A. `Function.toString()`** — trivial; catches every change. But it is source TEXT, not meaning:
    whitespace, comments, a formatter/transpiler/minifier, or a different JS engine all change it →
    heavy false-positive drift. Rejected as a long-term answer.
  - **B. Canonical (normalized) source** — strip comments/whitespace, normalize, then hash. Cheaper
    than a parser; still text-level, so semantically-equivalent rewrites (renamed locals, reordered
    branches) still drift.
  - **C. Canonical AST** — parse → normalize → hash. Strongest *textual* identity; cosmetic edits (and,
    with α-renaming, renames) do not drift — but per the table it still drifts on extract-helper and
    statement reorder, because those change the tree while preserving behaviour. Cost: a parser +
    normalizer dependency the single-file app does not have.
  - **D. Build-time fingerprint** — compute the (B or C) hash during a build step, bake it into the
    bundle; runtime stays simple and does no code analysis. **Precondition: the app has NO build step
    today** (single file of truth), so D carries its own decision (introduce a build) — see the note
    below.
  - **E. Behavioural fingerprint** — hash the law/mutation's OBSERVABLE behaviour: run it over a FIXED
    input corpus, hash the pass/fail (or output) pattern. Per the table it is the ONLY option that
    tracks meaning across every behaviour-preserving refactor; needs no parser and fits the single-file
    app (the harness already executes these). Cost: it is **probabilistic** — identity is only as good
    as the corpus covers (the same detection-power caveat as `mutN`), so two laws differing only
    outside the corpus would collide. **E produces STATISTICAL EVIDENCE, not a PROOF: it hashes
    `f(input₁),f(input₂),…` over a chosen corpus, so its result is a property of `code + corpus`, not
    of code alone.** Consequence: **the corpus becomes part of the identity** — E must record
    `algorithmVersion` AND `corpusVersion`, or the fingerprint could change (corpus edited) with the
    law untouched, or stay equal (corpus too thin) with the law changed.
- **THE THREE QUESTIONS THIS ADR MUST ANSWER BEFORE #3 SHIPS (each a separate decision, not a lookup):**
  - **Q1 — What DEFINES identity?** the verification *configuration*, the *algorithm*, or the
    *behaviour*? Different objects; today `profileId` blurs them (mixes laws+mutations+strength+config).
    One meaning per id.
  - **Q2 — How is that identity REPRESENTED?** text (A/B), tree (C), or behaviour (E) — a direct
    consequence of the semantic-change table above.
  - **Q3 — How is that representation VERSIONED?** *This applies to EVERY alternative, not only E.* An
    AST normalizer, a canonical-source pass, and a behavioural corpus all have an algorithm that will
    evolve; without an `algorithmVersion` (and, for E, a `corpusVersion`) a fingerprint can change with
    the law untouched, or stay equal with the law changed. Per Invariant 3 (identity is explicit) these
    versions are DECLARED metadata, not inferred.
- **Decision:** **UNDECIDED.** Deliberately left to mature. Do not implement #3 (fingerprint-over-bodies)
  until this is resolved; a fingerprint chosen by accident is worse than the known gap.
- **Related, also deferred (recorded so they are not lost):**
  - `profileId`/`profile` were named when `profile` was mere harness config; it is now a **contract**.
    The honest name is `VerificationProfile` / `VerificationProfileId`. A rename is a schema change
    (→ new golden) — fold into the next schema bump, not a standalone one.
  - When old-schema evidence must be read, the transform is a **`SnapshotMigration`** (a data
    transform), NOT an "adapter"/wrapper. `schemaOf()` is already the hook it would attach to.
  - `context.mutationCache` is a stored DERIVATION of `gates.Mutation` (measured: read only by
    `report()`); by the ADR-nothing invariant it should not be stored — fold its removal into the
    next schema change.
  - `CVQualify.hygiene()` outgrew its name: it began as an extra-field style check and now verifies the
    snapshot's full shape contract (extra AND missing, as a set). Its real responsibility is
    `SnapshotContractVerifier` / `SnapshotShapeVerifier`. The current name is not wrong, just narrow —
    rename at a natural boundary (it changes an exported symbol, so not during the freeze).
- **Serves:** Neni 79 (intended mutations) · Neni 82 (explicit over implicit). **Status:** Open ·
  **Foundational** (recorded, not decided; binds all future evidence work once decided, gates it until then).

---

## ADR-031 — Editor-control visibility has five owners (DECIDED 2026-08-04 · SHIPPED V487, 2026-08-16)

> **Implementation record: see "ADR-031 · IMPLEMENTED" at the end of this ADR.** Steps 1b, 3, 4, 5, 6
> are done, verified, and **promoted as V487 `d0962600`** (2026-08-16). Two statements
> below are superseded there and are kept because their reasoning still stands: *step 1's id-keyed
> table* (wrong — an instance id is not a category) and *`skillItem` NOT TESTED* (now runtime-tested,
> without mutating the user's CV).

> ### Objective, restated 2026-08-04 before the cycle begins
>
> The entry gate has been *"why does exactly one of 16 contact items carry `position:relative` and
> run `adjustHeight()` on every drag move?"* — a good question that invites a bad answer. Removing
> those two properties would close the question without producing a rule, and this file records
> rules.
>
> **The objective is therefore:** *which invariant does that control violate that the other fifteen
> respect?* `position:relative` and `adjustHeight()` are candidate **symptoms**; the invariant is
> what the ADR must state. If the analysis lands where it looks like it will, the decision reads:
>
> > All editor controls follow one lifecycle. An exception requires a **documented invariant**, not
> > special-case code.
>
> **Work order, and the order is the point:**
>
> 1. ✅ V486 is the new baseline
> 2. Inventory all 16 contact items — *inventory, not judgement*
> 3. Group them **by observed behaviour**, never by implementation
> 4. Derive the invariant from the grouping
> 5. Write the ADR
> 6. **Only then** change code
>
> Steps 3 and 6 carry the risk. Grouping by implementation would rediscover the code that already
> exists and call it a finding; writing code before the ADR would make the ADR a justification of
> whatever was built, which is the failure mode this file exists to prevent.

### Step 2 — Inventory of Observable Differences (measured 2026-08-04 on V486 `b2c238c6`)

*Named for what it is. The object of ADR-031 is not the list of controls but the list of differences
between them: two controls with unlike implementations and identical behaviour belong in one group.*

**Rules this table obeys.** Observable facts only, no reasons. A property earns a column only if it
corresponds to a distinguishable behaviour — implementation is admitted as evidence for a behaviour,
never as an entry in its own right. **The inventory may not produce a hypothesis;** its whole output
is *"these are the differences that exist."*

#### First finding — the population is 8, not 16

The entry-gate question has been *"why does exactly one of **16** contact items behave differently?"*
Measured in the running app:

```
document.querySelectorAll('.contact-item')  →  16
  #contactsCanvas      8     live, editable
  #cvStaticFallback    8     display:none — the Quick Look fallback copy
```

**The 16 are 8 live plus 8 hidden duplicates.** The premise counted a set the user never interacts
with. The real population is **8**, and the question is "one of eight."

Recorded as a second fact, not explained here: the same component has a different `position` in the
two hosts — `relative` in the canvas, `absolute` in the fallback (forced by a `!important` rule in
the fallback stylesheet). A component whose layout mode depends on its host is a difference; what it
means is step 4's business.

#### The eight live items

| # | Variant | `position` | Height set by | Rendered h | Text element | Icon | Title | Resize handles | Lifecycle |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `skills-item` | absolute | layout | 32 px | `.editable` | ✓ | — | 2 | *(step 4)* |
| 2 | `professional-desc` | **relative** | **content (`auto`)** | **375 px** | **`.prof-text`** | **—** | **✓** | 2 | *(step 4)* |
| 3 | plain | absolute | layout | 58 px | `.editable` | ✓ | — | 2 | *(step 4)* |
| 4 | plain | absolute | layout | 58 px | `.editable` | ✓ | — | 2 | *(step 4)* |
| 5 | plain | absolute | layout | 58 px | `.editable` | ✓ | — | 2 | *(step 4)* |
| 6 | plain | absolute | layout | 58 px | `.editable` | ✓ | — | 2 | *(step 4)* |
| 7 | plain | absolute | layout | 58 px | `.editable` | ✓ | — | 2 | *(step 4)* |
| 8 | plain | absolute | layout | 58 px | `.editable` | ✓ | — | 2 | *(step 4)* |

**The `Lifecycle` column is deliberately empty.** It is filled in step 4, from the grouping — never
before it. Leaving it blank forces the classification to come *out of* the inventory instead of being
imposed *on* it.

#### The differences that exist

Stated flat, with no ordering and no causal claim:

- **Height source.** Items 1 and 3–8 have a height fixed by layout. Item 2's height follows its
  content (`height:auto`, rendered 375 px against 32–58 px).
- **Layout mode.** Item 2 is `relative`; the other seven are `absolute`.
- **Text element.** Item 2 uses `.prof-text`; the other seven use `.editable`.
- **Decoration.** Item 2 has a title and no icon; the other seven have an icon and no title.
- **Width.** Varies freely (160–220 px) across all eight, including within the plain group.
- **Resize handles.** Two on every item. **No difference** — recorded because a column that is
  uniform is evidence too: it rules out resize as a distinguishing axis.

`adjustHeight()` is **not** in the table. It is implementation, and step 2 has not yet observed a
behaviour that requires it as evidence. It enters at step 3 or 4 or not at all.

**Step 2 ends here.** No grouping, no invariant, no cause.

### Step 3 — Grouping by observed behaviour (2026-08-04, V486 `b2c238c6`)

Two layout probes were run on the live canvas, each restored and verified restored.

#### Probe 1 — does the canvas depend on any item's box?

Each item was hidden in turn and the canvas measured:

```
canvas height change on hiding ANY item, including the one in flow :  0 px
```

#### Probe 2 — does the canvas respond to in-flow content at all?

A 400 px block was appended to the canvas and removed:

```
canvas_inlineHeight              1391px   ← written by JS, not a layout result
heightRespondsToInFlowContent    false
delta                            0 px
```

#### What the probes establish

**`position:relative` produces no observable difference in canvas sizing.** The canvas carries an
explicit inline height and ignores flow entirely, so the one static difference the inventory found —
`relative` on item 2, `absolute` on the other seven — has **no measured behavioural consequence** on
the property it was assumed to affect. It stays in the inventory as a fact and leaves step 3 as a
*non-difference*.

**The canvas height is a number, and item 2 is currently the number's source.**

```
furthest item bottom   1371 px   (item 2: top 996 + height 375)
canvas height          1391 px   = 1371 + 20
```

But **that is a role, not a class.** The canvas takes its height from whichever item sits lowest;
any of the eight becomes the source by being dragged below the rest. A property that any member can
acquire by moving cannot define a group.

#### Behaviour classes that survive

| Class | Members | Basis |
|---|---|---|
| Draggable | **all 8** | observed |
| Two resize handles | **all 8** | observed |
| Canvas height recomputed on every drag move | **all 8** | *read in code, not observed — marked as such* |
| Height determined by content rather than layout | **item 2 only** | observed (375 px vs 32–58 px, `height:auto`) |
| Currently the source of the canvas height | **item 2**, by position | observed — a role, occupiable by any member |

**One behavioural difference survives step 3: item 2's height follows its content; the other seven
have a height fixed by layout.** Everything else either applies to all eight or was measured to have
no consequence.

#### The question step 3 must not answer, and must record

> *Is `professional-desc` the only member that behaves differently, or the only member that has been
> tested?*

**The seven others are `NOT TESTED`.** They are not "no anomaly reported" — the user has reported the
blackout while dragging *other elements*, and whether any of those were among these seven is unknown.
Writing "no anomaly" would be the error this file has had to reverse five times in `BUGS.md`:
absence of a report is a fact about the record, not about the elements.

**Step 3 ends here.** The output is: *these are the behaviour classes that exist among the eight.*
No invariant, no cause, no code.

### Step 4 — Deriving the invariant (2026-08-04)

| Claim | Status |
|---|---|
| The seven other contacts have no anomaly | ❌ **not known** |
| The seven other contacts have not been *reported* as a source | ✅ fact |
| All eight share the same drag mechanism | ✅ fact |

#### Candidate invariant I-031-A

Everything step 3 eliminated is eliminated because it was **shared** or **measured to have no
consequence** — `position`, resize handles, drag capability, canvas recomputation. What remains is a
single axis, and it is best named by what *owns* a dimension rather than by the CSS that expresses it:

> **I-031-A — Vertical extent has two owners.** For seven contacts it is fixed by layout. For one it
> is derived from content. The differing member is the only one whose vertical dimension is not a
> consequence of its position alone.
>
> ```
> Status:  SUPPORTED AS A DIFFERENCE
>          NOT PROVEN AS A CAUSE
> ```

#### The architectural question, which does not depend on BUG-017

This is the point of the ADR, and it is answerable now:

> **Is content-derived sizing a legitimate variant the editor-control contract must support, or an
> exception that should be normalised away?**

A contract that admits both owners must say so and define the lifecycle for each. A contract that
admits only one must state what happens to the member that needs the other. Either answer is a
decision; having neither written down is the debt ADR-031 exists to pay.

#### The isolation experiment — designed, and deliberately NOT on this ADR's critical path

Change **only** `height:auto` to an equivalent fixed value; same element, same text, same position,
same drag. Not as a fix — as a probe.

| Result | Where it leads |
|---|---|
| The symptom stops | content-derived sizing enters as an active factor |
| The symptom continues | the invariant is correlation only |
| Behaviour changes partly | there is an interaction with the lifecycle |

**It cannot be run inside a cycle, and that is why it is not a blocker here.** What it measures is the
disappearance of the blackout — a symptom that appears at intervals of days and cannot be reproduced
on demand. A design decision must not wait on a defect that arrives when it chooses. **The experiment
is therefore assigned to BUG-017's monitoring track, not to ADR-031's.**

#### The caution BUG-017 paid for

Even a positive result would read:

```
content-derived sizing  →  a different DOM/layout sequence  →  a particular composite
                        →  triggers a fault that lives elsewhere
```

**not** `auto-height → GPU crash`. Trigger and mechanism stay separate here exactly as they do in
`BUGS.md`; that distinction cost six days to learn and is not re-litigated per ADR.

---

### Step 5 — DECISION (2026-08-04)

**The problem is not that two dimension models exist. The problem is that the model is not
declared.**

That reframing is the whole decision. Step 3 showed the differing member is not broken and not an
accident: `professional-desc` carries a title and a long body, and its height genuinely follows its
text. Normalising it away would not remove the requirement — it would hide it behind a workaround,
and the next component with the same need would rediscover the same special case.

> #### Decision
>
> **Contact items support more than one dimension-ownership mode.**
>
> #### Constraint
>
> **Every contact item MUST declare the owner of its vertical dimension.** Implicit mixing of
> layout-owned and content-owned dimensions is forbidden.
>
> ```
> dimensionOwner: "layout"    // height is a consequence of position; content does not move it
> dimensionOwner: "content"   // height follows the content; position does not fix it
> ```
>
> #### Reason
>
> The existing difference is a **valid behavioural variant**, not an anomaly. It was measured, not
> assumed: seven members take their height from layout, one from content, and every other apparent
> difference was either shared by all eight or shown to have no consequence (`position:relative`
> changes nothing about canvas sizing — the canvas carries an explicit inline height and ignores
> flow).
>
> #### Consequences
>
> 1. Lifecycle and resize logic **may no longer assume a single dimension source.** Any path that
>    changes size must branch on the declared owner, not on a class name.
> 2. Every new contact item must declare its owner. This is a real cost, accepted deliberately: an
>    undeclared owner is exactly today's situation, where the answer lives in a `classList.contains`
>    check inside a drag handler.
> 3. `position` is **not** the declaration and must not become one. It was measured to have no
>    consequence for canvas sizing; using it as a proxy would re-encode the same implicit coupling
>    this ADR removes.

#### What the implementation must NOT be

Step 6 is not *"remove `position:relative`"* and not *"remove `adjustHeight()`"*. Both are symptoms
of an undeclared model, and deleting a symptom leaves the model undeclared. **The implementation is a
declaration layer**: each item states its owner, and every size-changing path reads that statement
instead of testing for a class.

The current code expresses the model as:

```js
onMove: () => { if (self.element.classList.contains('professional-desc')) self.adjustHeight(); … }
```

A class name standing in for a behavioural contract. The ADR does not forbid the *behaviour* — it
forbids the behaviour being **inferred** rather than **declared**.

#### What this ADR does not decide

**Nothing about BUG-017.** No claim is made that dimension ownership relates to the blackout. The
isolation experiment stays on BUG-017's monitoring track, and if it ever returns a positive result it
will support a *trigger*, never a mechanism. This ADR would stand unchanged if BUG-017 turned out to
have no connection to it at all — which is the test of whether an architectural decision was worth
making on its own terms.

### Step 6 — Implementation boundary (specified 2026-08-04, not yet built)

**`dimensionOwner` must not be metadata.** A declaration that nothing reads leaves the contract
exactly as unprotected as it is today. It has to be the *single source of the decision* for every
path that touches a dimension, or it is decoration.

#### The declaration point — measured, not assumed

The natural instinct is to start at the DOM or CSS layer. The contract belongs where the object is
born instead, and this file's own rule from ADR-034 requires proving that such a point exists:
**a funnel is a corridor, not a boundary.** Measured on V486 `b2c238c6`:

```
class ContactElement          declared  1×
new ContactElement            called    1×   ← inside createContactElement()
contactElements.set           called    1×   ← same function
```

One declaration, one instantiation, one registry write, all in one place. **There is no path that
produces a `ContactElement` without passing through `createContactElement`**, which makes it an
ownership boundary and not merely a routing convenience. `dimensionOwner` is introduced there.

#### 6.1 — Declaration

```js
{ type: "contact", dimensionOwner: "layout" }    // height is a consequence of position
{ type: "contact", dimensionOwner: "content" }   // height follows the content
```

`professional-desc` stops being identified by `position:relative` or by an `adjustHeight()` call and
starts being identified by its contract.

**The owner must be derived from what each item requires, never read off what the code currently
does.** The entry condition is `dimensionOwner ∈ {"layout","content"}` — *not*:

```
professional-desc → content      ← this is classification of existing cases
everything else   → layout          dressed as a contract
```

The assignment will very likely come out the same, and that is not the point. If it is produced by
inspecting current CSS, the contract is a transcription: every mistake already in the code becomes a
declared invariant, and the declaration can never disagree with the implementation — which is exactly
the property that would make it worth having.

Ask of each item: *does its height genuinely follow its content?* Answer from the component's nature.
Then compare against the current behaviour, and **treat any disagreement as a finding**, not as an
error in the answer.

**What is never the declaration:**

```
CSS            ≠  contract
position       ≠  dimensionOwner
height:auto    ≠  dimensionOwner
adjustHeight() ≠  dimensionOwner
```

They are **secondary evidence**. The source of authority is the component model.

The trap has a concrete shape, and it is the line an implementer would reach for first:

```js
// FORBIDDEN — this is the whole failure mode in one expression
dimensionOwner: element.style.height === 'auto' ? 'content' : 'layout'
```

It would migrate every instance in one pass, produce a green audit, and leave the system in exactly
the state it is in today — with the implementation now certified by a contract derived from itself.

The starting point is instead an unanswered field:

```js
{ type: 'ContactElement', dimensionOwner: '?' }
```

and one question per instance: *is this component conceptually content-driven, or is its dimension
part of how the canvas positions it?* **Only after answering** is the current code consulted, and
then only to see whether it agrees.

#### Step 2 executed on paper — 2026-08-15, no code changed

Performed during BUG-017's Arm B, so the constraint was absolute: **decide from the component model
first, consult the implementation only afterwards.**

**Honest limit, stated rather than pretended away:** the implementation was already measured in the
step-2 inventory, so genuine naivety was impossible. The discipline applied instead: *reason from the
component's purpose, write the reasoning down, then check whether it stands on its own.* An argument
that needs the code to remain convincing is a transcription.

| Component | Decision | Reasoning **from purpose**, before checking |
|---|---|---|
| `c-email` `c-phone` `c-location` `c-license` `c-birthday` `c-nationality` | `layout` | Each carries a single fact. If one email is twice as long, the pill must not become twice as tall — the seven form a column, and vertical uniformity is part of how the canvas orders them. Content changes the text's length, not the box's height |
| `skills-hobby` | `layout` | Same reasoning. **Least certain of the eight**, recorded as such: the name suggests something that could grow as a list, but as a single unit in the contacts canvas it behaves as its siblings do. Collections live in Terminal 2 |
| `prof-desc` | `content` | Its entire purpose is to hold prose whose length the author chooses. A fixed height produces either clipped text or empty space — both failures of what the component is for |

#### Verification — 8/8 agreement, no disagreement

```
.contact-item              height:58px · min-height:58px · max-height:58px · overflow:hidden
.contact-item.professional-desc   height:auto · max-height:none · min-height:72px
```

The seven are not merely *set* to a height — they are **pinned from both directions by three
properties**. `prof-desc` releases two of the three and keeps only a floor.

**The agreement is at the level of mechanism, not just outcome**, which is what makes it more than a
transcription. The stated reasoning was *"a longer email must not make the pill taller"* — which
implies the text has to go somewhere else. It does:

```
.editable    white-space:nowrap  · overflow-x:auto        ← the text scrolls sideways
.prof-text   white-space:pre-wrap · word-wrap:break-word  ← the text wraps
```

That mechanism was not named in the decision and was found by the check. The reasoning predicted it
without depending on it.

#### The epistemic trace is kept per component, separate from the result

`skills-hobby` came out `layout` and the verification agreed. **That agreement does not raise its
initial confidence.** A weakly-grounded prediction that turns out right remains weakly grounded — it
has one confirmation, not a better argument. Recording only the outcome would erase where the
uncertainty was.

```
skills-hobby    result: layout · verification: agrees · initial confidence: LOWER
c-email … c-nationality, prof-desc
                result: as above · verification: agrees · initial confidence: full
```

If this ADR is ever revisited — or if `skills-hobby` turns out to be a collection after all — the
record already says which of the eight was shaky at the source, without anyone having to reconstruct
it from a conversation.

#### Finding 1 — overflow strategy is *entailed* by ownership, not independent of it

```
fixed height        →  the text MUST NOT wrap   (wrapping requires height to give)
content-owned height →  wrapping is precisely what produces the height
```

So `dimensionOwner` needs **no second field** — but the entailment must be written down. Without it,
someone will pair `dimensionOwner:'layout'` with `white-space:pre-wrap` and get silently clipped
text, with no check anywhere able to catch it.

#### Finding 2 — `content` does not mean unbounded

`prof-desc` keeps `min-height:72px`. A content-owned component still carries a layout constraint.
The precise reading:

> **`content` = layout may set the bounds; content determines the value within them.**

Without this line, "content-owned" invites removal of `min-height` as an inconsistency, when it is
part of the contract.

### Queued under ADR-031 — de-duplicate `cv-hist-btn` (planning only, 2026-08-15)

Raised as *"the per-terminal undo/redo buttons each have their own logic — should we merge them into
one?"* **The premise is false, and measuring it first changed the whole shape of the work.**

```
Assumed                        Measured on V486 b2c238c6
───────────────────────────    ──────────────────────────────────────
History 1 / History 2 / …      HistoryEngine scopes:  'project' · 'a4'
per-terminal isolation         every cv-hist-btn handler calls
                               H.undo('project') / H.redo('project')
                               tooltips already say "(Projekt)"
```

**There is one shared project history. There never was per-terminal isolation.** A design that
proposed preserving `TerminalHistory[terminalID]` would have been preserving something that does not
exist — a recommendation derived from a factually wrong premise, and therefore not part of this
architecture.

#### The shape of the debt, measured rather than assumed

```
mk('cv-hist-undo' / '-redo')      1 site each  → terminals inside the iframe
_mkT1('cv-hist-undo' / '-redo')   1 site each  → Terminal 1
                                                 = 12 buttons at runtime
undo('project') / redo('project') 3 each       → the two factories + the keyboard conductor
undo('a4')      / redo('a4')      1 each       → the A4 toolbar
```

**Two creation sites, twelve instances.** The debt is not copy-pasted code — it is *one logical
control materialised per terminal with nothing declaring that it is global.* That is the same defect
this ADR exists for: a single architectural concept instantiated many times without declared
ownership, so the UI multiplicity is mistaken for behavioural multiplicity — as it was here, by the
people who built it.

**Consequence for the fix:** nothing gets deleted as duplication. **The change is where the factory
is invoked** — once, at canvas level, instead of once per terminal. `project` semantics stay exactly
as they are; the A4 toolbar's `'a4'` scope is untouched.

Precise name for the work, since "code de-duplication" would be wrong:

> **De-duplicate the UI *materialisation* of a global control, by changing where the existing
> factories are called — not the factories themselves, and not `HistoryEngine`.**

Which reduces the implementation to two questions, and no more:

1. Where should the single global control be instantiated?
2. Which current factory calls should be removed from the per-terminal instances?

The existing factories are not reinvented. That is a methodological gain as well as a practical one:
code that already works and is not the subject of the change stays untouched.

#### The reusable lesson

```
instance count  ≠  behaviour count  ≠  implementation count
```

Twelve buttons, one behaviour, two factories. **This is the second time in the same cycle that a
count was read as a population**: `.contact-item` returned 16 and was taken as 16 components, when it
was 8 live plus 8 hidden fallback copies. Both times the number was correct and the inference from it
was not.

Whenever a count motivates a decision here, the question to ask before acting is *what exactly is
being counted* — instances, behaviours, or definitions. They are rarely the same number, and the
difference decides what the work even is.

#### Question 1 — who owns `project history`? Decided from the model, 2026-08-15

`project` history records transactions over the **document state** (`appState` →
`cv_unified_app_state_v2`): contacts, skills, experience, education, motivation. Not a terminal, not
a canvas.

| Candidate | Verdict | Reason from the model |
|---|---|---|
| Terminal | ❌ | A subset. The history covers far more than one terminal |
| Canvas | ❌ | A smaller subset still — one region of Terminal 1 |
| Application UI | ❌ | The UI is where a control is *rendered*, not what *owns* a concept. Putting ownership there is the same error as `CSS ≠ contract` |
| **The scope's own surface** | ✅ | The history belongs to the state it records |

> **A history control belongs to the surface that owns its scope.** `'project'` is owned by the
> **document**, so its control belongs at document level — sibling to A4, above the terminals.

**This was not invented. It was read off the parts of the system that already work.** Three history
control surfaces exist, and two of them already obey the rule:

| Surface | Level | Scope | |
|---|---|---|---|
| Keyboard conductor | **document** | `cur()` — **contextual** | ✅ |
| A4 toolbar (`rtUndo`/`rtRedo`) | A4 | `'a4'` | ✅ exactly one pair |
| Per-terminal buttons | **terminal** | `'project'` | ❌ |

```js
document.addEventListener('keydown', function(e){ … var scp = cur(); … H.undo(scp); }, true);
```

The keyboard conductor is not bound to `'project'` at all — it lives at document level and picks the
scope from context, handling **both** scopes from a single surface. **The per-terminal buttons are
the only surface placed below the level of the scope they control.** That is not a matter of taste;
it is a rule the system enforces in two other places.

#### Question 2 — the factories. Answered only after ownership

Verified: **each factory serves the history buttons and nothing else.**
`mk(` is called with `cv-hist-redo` and `cv-hist-undo` only; `_mkT1(` likewise.

| | `_mkT1(cls,svg,title,fn,after)` | `mk(cls,svg,title,right,fn)` |
|---|---|---|
| Document | outer | inside the iframe |
| Placement | inserts after a passed anchor, **no positioning** | `position:absolute` · `top:topV` · `right` · `zIndex:zV` |
| Coupling | none — takes an anchor and an action | bound to a terminal's header layout via closure variables |

**`_mkT1` survives, and is the one that moves.** It is already generic; its only Terminal-1-ness is
the call site.

**`mk` becomes purposeless — as a consequence, not as a goal.** Its entire existence is absolute
placement inside a terminal header, which is exactly what the ownership decision removes. Serving
nothing else, no residual role remains. *This is the distinction that mattered: the factory is not
deleted because duplication is untidy — it is left without an object.*

#### A third consequence, not anticipated

```
cv-hist-btn-t1      ← "t1" = Terminal 1
cv-photo-btn-t1
```

Once the control is document-level, **those names lie.** This project already holds the rule that
*public names are contracts*; renaming is part of the work, not cosmetics.

Also recorded, not blocking: the history button carries `cv-photo-btn-t1` in its className, inherited
for styling — a control borrowing another control's identity to get its appearance. That is itself a
small instance of ADR-031's subject.

#### Design decision — closed. Boundary of what may change

```
Q1  Ownership       'project' is a document scope → the global control lives at document level
Q2  Materialisation _mkT1(…) survives, invoked once at document level
                    mk(…) has no role afterwards; its invocations are removed
Q3  Naming          "-t1" is no longer semantically valid → renaming is part of the implementation

Boundary            HistoryEngine        unchanged
                    scope 'project'      unchanged
                    scope 'a4'           unchanged
```

**The `cv-photo-btn-t1` dependency stays documented, not auto-cleaned.** The history button carries a
photo button's class for styling. That is a naming/styling coupling to be **verified before
renaming**, during implementation — not tidied up as a side effect of this decision. Removing it here
would be a second change riding on the first, which is what this file exists to prevent.

#### ⚠️ "Only two moves" was a numerical premise about implementation size

Stated by the maintainer before any diff existed. Conceptually there are two operations — move
`_mkT1`, remove `mk`'s materialisation — but the implementation also carries **renaming and
verification of every reference and style that depends on the old names.**

**This is the same pattern this cycle caught five times, made once more, this time about effort
rather than population.** A count spoken before the thing is examined is a guess wearing a number.

The implementation is therefore a **single atomic change with before/after checks**, not a two-line
edit. That changes nothing about the decision — only about what it will cost, which is not yet known
and will not be asserted until the diff exists.

#### Status: planning only

Nothing was modified — not `cv-hist-btn`, `HistoryEngine`, the scopes, HTML, CSS, JS, V486, any
backup, or Arm B's configuration. **Implementation waits for Arm B to close**, together with step 6.

*This is the fifth entry premise in this cycle that measurement falsified* — after "one of 16 contact
items" (it is 8), "`position:relative` is the distinguishing property" (it changes nothing measurable),
"the drag was not involved" (it was), and "crash count baseline = 3" (the counter resets). The census
is not ceremony; it has been wrong-footed five times and caught it five times.

#### Step 3 — the gate ran, 2026-08-15. **PASSED**, with two stated limits

```
registrySize       8
domInCanvas        8
registryCoversDom  true
valid              8    invalid 0    missing []
verdict            GATE PASSED
```

**Both conditions, not one.** Every instance carries `layout` or `content`, *and* the registry
covers the canvas exactly — which confirms the premise the declaration point was chosen on:
`createContactElement` really is the sole boundary. Had the counts diverged, that was written in
advance as *not* a migration bug to patch but a reason to return to the model.

##### Limit 1 — `skillItem` was NOT exercised — ✅ DISCHARGED 2026-08-16

> **Resolved without mutating the user's document.** A clean browser profile with default seed data is
> a different document, so a real `skill` spawn could be dropped there: `spawn 'skill' → skillItem →
> layout`, surviving save→reload. The blocker was never "a skillItem must exist" — it was "a skillItem
> must exist *in some document*", and the two are not the same requirement. Detail in the
> implementation record at the end of this ADR. The text below is kept as written.

The registry held 8 instances: the six contacts, `skills-hobby`, `prof-desc`. **`_src.skillsItems`
was empty**, so the ninth category the constructor admits never appeared.

```
categories the code admits   9
categories the gate saw      8
skillItem                    NOT TESTED — never "passes by absence"
```

This is the same distinction that has bitten three times in this cycle: *the population present is
not the population the code admits.* **Step 4 must not be enabled until a `skillItem` has been
created and re-checked** — otherwise the first dynamically added skill meets a guard that has never
seen its category, and the guard becomes a migration tool in a running app, which is precisely what
the ordering was designed to prevent.

##### `skillItem` — source-verified, deliberately NOT runtime-tested

Exercising it would have required **creating a real item in the user's CV**, a mutation of their
document to produce a test. Declined: the data is not a fixture.

Traced statically instead, end to end:

```
createContactSpawnAtButton   spawnData { type:'skillItem', id: generateId('skill') }
setupSpawnDrag  dragstart    setData('application/json', JSON.stringify({type, data, offsetX, offsetY}))
drop → JSON.parse            dropData.data          ← type survives the round-trip
handleNewElementDrop         createContactElement(dropData.data)
constructor                  CONTACT_DIMENSION_OWNER['skill-…'] → undefined
                             || (data.type === 'skillItem' ? 'layout' : undefined)  →  'layout'
```

Persistence checked too, because a value correct at creation and lost on reload would be worse than
one never set: `skillsItems` is filtered by `validateContact`, which is a **predicate** — it returns
true/false and defaults only `left`/`top`/`width`. It does not rebuild the object, so `type` survives
save → reload → `_src.skillsItems.forEach(item => createContactElement(item))`.

```
skillItem   source-verified   ✅  creation · persistence · restoration
            runtime-tested    ❌
```

**Recorded as two separate facts, because they are two different strengths of evidence.** This entry
has spent a whole cycle on *mechanism is not behaviour*; a traced path is a mechanism.

*Noted in passing, not pursued:* `validateContact` being a filter rather than a whitelist
reconstructor means unknown fields from `localStorage` are preserved on `contacts`/`skillsItems`.
Convenient here; it is a weaker property than `ARCHITECTURE.md` §5 attributes to `normalizeState`.
Queued as an observation, not investigated inside this migration.

##### Limit 2 — the registry was not where the source says it is

Locating it took two wrong guesses and a scan. The source contains:

```js
const contactManager = new ContactManager(…);
window.CV.internals.canvasModule = contactManager;
```

At runtime `CV.internals` holds six other keys and **no `canvasModule`** — while the neighbouring
assignments on both sides (`window.appState`, `window.socialManager`) are present, so the block ran.
`internals` is not frozen, not sealed, writable, no getter. **Why the property is absent is
UNEXPLAINED** and is left so rather than covered with a plausible story.

The registry was found at `window.ContactIconManager.contactManager.contactElements` — reachable only
because `new ContactIconManager(contactManager)` happens to retain the reference.

**This is itself an ADR-031-shaped defect**, noticed in passing: the source *declares* an exposure
point, the runtime does not have it, and nobody noticed **because nothing reads it.** A declared
location with no reader is the same class of thing as a declared model with no enforcement — which is
the debt this ADR exists to pay. Recorded, not fixed here.

##### ✅ EXPLAINED 2026-08-16 — it was never a defect, and the paragraph above is withdrawn

Found by grepping for every reader, which is what should have been done before calling it unexplained:

```js
CanvasTerminal.prototype.init = function() {
  /* Take ownership of ContactManager — NO global exposure */
  var cm = window.CV.internals.canvasModule || null;
  if (cm) { this.module = cm; delete window.CV.internals.canvasModule; }
}
```

`CV.internals.canvasModule` is a **baton, not a registry**. The assignment runs, `CanvasTerminal`
takes ownership, and deletes the global — the comment states the intent outright. Verified at runtime:
`cvApp.getTerminal('personal').module === ContactIconManager.contactManager`, and the key is gone.

**The absence was the design working.** Two readings of it were wrong, in opposite directions: first
that the constructor had thrown (overreach, corrected by the user at the time), then that it was
*unexplained* — the safer-sounding error, and still an error, because the explanation was one grep
away in the same file. `¬know(X)` was recorded honestly; what was skipped was the cheap step that
would have produced `know(X)`. **Declaring something unexplained is not free: it costs the search
that was not made.** The ADR-031-shaped defect described above does not exist, because the location
*does* have a reader — the reader is what removes it.

#### 6.2 — Enforcement

Every size-changing path branches on the declaration:

```js
function updateVerticalDimension(item){
  switch(item.dimensionOwner){
    case 'layout':  return updateLayoutDimension(item);
    case 'content': return updateContentDimension(item);
    default: throw new Error('missing dimensionOwner');
  }
}
```

**A missing declaration is an error, never a default.** This is the load-bearing line of the whole
step: a default would silently restore the implicit model this ADR exists to remove, and it would do
it invisibly — the system would work, and the contract would be gone.

#### 6.3 — Audit, after implementation

| State | Allowed |
|---|---|
| Contact with a declared owner | ✅ |
| Contact without an owner | ❌ |
| Logic reading `position` to decide the owner | ❌ |
| Resize logic assuming a single owner | ❌ |

#### Why this ADR rests on firm ground

The initial premise was wrong **twice**, and both were caught by measuring before deciding:

1. *"one of 16 contact items"* → 8 live plus 8 hidden fallback duplicates; the population is **8**
2. *"`position:relative` is the distinguishing property"* → measured to have **no consequence**

The decision therefore does not rest on the existing code. It rests on an invariant that survived the
removal of the false differences — which is the only kind worth writing into this file.

#### The declaration is a birth property, not an acquired one

```
ContactElement does NOT read dimensionOwner from CSS.
ContactElement does NOT infer dimensionOwner from behaviour.
ContactElement is BORN with dimensionOwner.
```

Anything that lets the system work the model out after construction leaves the model implicit again —
just later, and harder to see.

#### Additional consequence

**Adding a new contact type requires choosing its dimension owner before it can be instantiated.** A
new contact cannot enter the system by accident: the constructor refuses an object that does not
carry the field. That cost is the point, not a side effect.

#### Change classification

```
Change class   behaviour-affecting architecture change
Risk           touches the interaction lifecycle
Entry framing  "migrate ContactElement to an explicit dimension contract"
               NOT "change professional-desc"
```

The entry framing is not presentation. Naming the work after one component would make the component
the subject and quietly restore the special case the ADR removes.

#### Migration order — a contract migration, not a CSS refactor

1. add the contract — `dimensionOwner` as a **passive** field, written, read by nothing
2. populate every existing instance, **from the component model**
3. **verify** 100 % of `ContactElement` instances carry a valid value
4. enable enforcement — a missing owner is an error
5. migrate the lifecycle paths, one at a time
6. verify regressions

**Step 3 is a gate, not a task, and it is separate from step 2 on purpose.**

```
population  ≠  assurance
```

That the code *writes* a value does not establish that every instance *received* one — a path that
constructs an item without going through the populated route, a persisted state restored from
storage, an item created before the field existed. Without the gate, enforcement can be switched on
over a half-migrated system and produce a failure that is entirely artificial: the guard becomes a
migration tool instead of a protection, and every gap surfaces as a thrown exception in a running
app.

Two earlier drafts of this list were wrong in the same direction — first by putting enforcement
before population, then by merging verification into it. Both corrections say one thing: **the
contract must be satisfiable, then verified satisfied, and only then required.**

#### Step 3 doubles as a test of this plan's own premise

The generic reasons a population check fails — a second construction path, a legacy loader, items
restored from storage — **should not exist in this codebase.** The measurement above found
`new ContactElement` exactly once, and restoration runs through the same door:

```js
_src.contacts.forEach(contact => { this.createContactElement(contact); });
```

So step 3 ought to be cheap here, and that is the interesting part: **if it is not — if any instance
turns up without an owner — then the single-construction-site measurement was wrong, and with it the
choice of `createContactElement()` as the declaration point.** The gate therefore checks two things
at once: whether the migration is complete, and whether the boundary this whole plan rests on is
real. A failure at step 3 is not a migration bug to patch; it is a reason to return to step 6's
premise before continuing.

**Triage, if an instance turns up without an owner.** The reflex — *"add another assignment where it
is missing"* — is the one response that must not be first, because it repairs the symptom and leaves
the premise unexamined:

```
Which assumption failed?
  ├── the migration was incomplete            → implementation gap, fix and re-verify
  ├── an undiscovered creation path exists    → the measurement was incomplete
  └── createContactElement() is not the real  → the architectural model is wrong,
      boundary                                   and the declaration point moves
```

Only the first branch is a coding task. The other two are corrections to the model, and both would
mean this ADR chose its boundary on a measurement that did not hold. **`new ContactElement = 1` is a
measured premise, not an axiom** — step 3 is where it is tested rather than assumed.

#### Pre-condition, from BUG-017's discipline — and this change is not V486

V486 shipped an SVG sanitiser: nothing on the path where the blackout appears, which is why the
`no change touches the monitored rendering paths` statement held. **An ADR-031 implementation touches
the drag path directly** — the one interaction the symptom is conditioned on. That does not block it,
but it changes what must be recorded:

```
Before the first commit :  read and record  GPU process crash count
After the cycle          :  read it again, and the Log Messages with it
```

If the count moves, there is a clean comparison; if it does not, that is recorded too. **The
architecture change and the rare-symptom investigation stay in separate channels** — the same
separation that made this cycle possible, applied to the cycle that follows it.

**ADR-031 does not claim to solve BUG-017, and must not be edited later to imply it did.** The
relationship is:

```
ADR-031    removes an architectural ambiguity
BUG-017    remains a GPU-process incident with an unestablished cause
```

Should content-owned sizing ever turn out to be a trigger for the crash, **that is a new finding, to
be recorded when it is made.** Writing it in now — as motivation, as a hypothesis, as a hopeful aside
— would make this ADR retroactively look prescient about something it never measured, and the file
would stop being trustworthy about the difference between what was decided and what was later
discovered.
- **Context:** an editor control (`+` / `−` / 🗑 / 📷 / ↩↪) must be visible in the editor and hidden
  everywhere else. Today "everywhere else" is enforced in **five independent places**:
  1. `.preview-mode …{display:none}` CSS rules (outer document)
  2. the JS `hideSel` list inside `setPreviewMode` (outer) and the iframe's message handler
  3. `ExportTheme`'s own hide list (the offscreen PDF export iframe)
  4. `.no-print` — which lives inside `@media print`, so it governs printing ONLY
  5. per-control defaults (`opacity:0` / `visibility:hidden`) which acted as an implicit catch-all
- **Why it is now visible as debt:** V482v made the controls visible by default, removing owner (5) —
  the implicit catch-all that had been silently covering the gaps in the other four. Two real leaks
  surfaced immediately, both the same shape: `.line-minus-btn` (27 elements) was missing from the
  preview rules **and** from `ExportTheme`, so it appeared in preview and would have been baked into
  the PDF. **A control added tomorrow must be registered in four lists; any omission is an invisible
  leak that only shows up in one output mode.**
- **Proposed direction (NOT decided):** one `editor-control` concept, registered once, with four
  derived states — `Editor → visible · Preview → hidden · Export → hidden · Print → hidden`.
- **⚠️ Counterweight discovered while verifying V483 — do not unify carelessly:** the offscreen export
  document carries the `preview-mode` class (every export is initiated from preview mode — the download
  button exists only there — so the captured `outerHTML` inherits it). The controls are therefore
  covered by **two independent mechanisms** (preview-mode CSS + the ExportTheme hide list). That
  duplication is exactly what this ADR complains about — but here it functions as **defense in depth**:
  if a future control is registered in one list and forgotten in the other, it is still hidden. Any
  unification must preserve that property deliberately, or it will trade five noisy owners for one
  silent single point of failure. Keep the redundancy through a stabilising release; revisit it only as
  part of the designed unification.

### Pre-promotion audit, 2026-07-29 — measured, and it corrected a wrong prediction

Ran on the operational definition *"editor control = element visible in the editor and hidden in
preview"*, so the audit could find controls no class list names.

| Question | Measured answer |
|---|---|
| How many editor controls? | **93** (control roots; +4 non-controls also hidden in preview) |
| Do 100% share one class? | **No** — `.no-print` covers **54/93 (58%)** |
| Still opacity-driven by inline/JS? | **Yes, 4 families** — Qualifikationen `−`/`+`, `.resize-handle`, `spawnLayer`, `.language-slider` |
| Registry membership | `.preview-mode` 15 · ExportTheme 14 · `@media print` 9 — none a subset of another |

**The finding, stated correctly.** Six controls (the five `#section-… #add…Btn` and `.reset-default-btn`)
were **not excluded semantically** in preview or export: each `#section-X #btnId{display:flex!important}`
carries specificity (2,0,0) and beats both `.no-print`/`.terminal-add-btn{display:none!important}` (0,1,0)
and `body.preview-mode .terminal-add-btn{display:none!important}` (0,2,1). They rendered with
`display:flex` in both modes. They were invisible only because the same guards also set
`visibility:hidden` and `opacity:0` — **visual properties doing the work of a logical exclusion.**

**A prediction this audit got wrong, kept as the reason the rule below exists.** From the specificity
finding alone it was predicted that the five `+` buttons "would appear in the exported PDF at 32%
opacity." A PDF the user had already exported was then inspected: **clean.** The mechanism was real, the
behavioural conclusion was not — because the visual properties still masked it. *Mechanism proven ≠
behaviour observed*; the sentence that survives evidence is "there is a provable path where the export
rule fails to hide these elements", not "they appear in the PDF".

**Also measured, and it reversed a fix.** The first attempt removed `!important` from the three ID
rules. That broke the editor: three of the five carry `display:none` **inline**, and only `!important`
overrides inline. Reverted. The correct direction is the opposite — **make the hiding rule win**
(`body[data-export] #…` at (2,1,1)), never weaken the rule that reveals.

- **Follow-up task (NOT this release):** unify to one `editor-control` contract. The audit shows what it
  must include beyond the class: **removing the `display:…!important` from the five ID rules is
  impossible while they carry inline `display:none`,** so unification must also remove that inline state
  (move it into the class contract). A class alone would still lose the specificity battle and the same
  leak would return — unification without this step buys the feeling of safety, not the substance.
- **Sprint rule (decided with the user at V483 closure, 2026-07-29):** this refactor gets a sprint of its
  own and shares it with nothing — in particular **not** with BUG-017 (`BUGS.md`). It changes the
  contract of 93 controls across three registries and the CSS specificity that binds them; if a Preview,
  Export or Print regression appears afterwards, attribution is only possible when that refactor was the
  single variable. **Order matters:** BUG-017 first (diagnosis, no behaviour change), this second — an
  unexplained layout defect must not be inherited into a layout refactor.
- **Entry gate for that sprint:** it may not start with code. It starts with the question the audit
  raised — *why does exactly one of sixteen contact items behave differently?* — because the
  `if (this specific element)` special case and the `relative`/`absolute` split are plausibly the same
  root as BUG-017. If that turns out to be true, the two debts are one debt, and the order above is what
  reveals it.

- **Deliberately NOT done during V483:** this changes the OWNERSHIP MODEL of control visibility. It is
  architectural work, not a bug fix, and folding it into a stabilising release would mix the two.
  Do it when the control set next changes.
- **Serves:** Neni 5 (single source of truth) · ADR-030 Inv-1 (one authoritative source per fact,
  here applied to a UI rule rather than to evidence). **Status:** Open (recorded as debt).

### Lesson learned

**A proven mechanism is not proof of runtime behaviour. When the two disagree, document both: the
mechanism as fact, the behaviour as observation.**

Applied to this audit, the three statements stay separate and are all true:

| | |
|---|---|
| **Fact** | An ExportTheme rule loses to a higher-specificity rule. |
| **Hypothesis** | Therefore those controls appear in the PDF. |
| **Observation** | The exported PDF did not show that behaviour. |

The hypothesis was wrong while the fact stood, because a second, unrelated property
(`visibility:hidden` / `opacity:0`) was masking the failure. Collapsing the three into one sentence —
"the rule loses, so the buttons appear" — would have shipped a false defect report *and* hidden the real
finding, which is that the exclusion was visual rather than semantic ([ADR-032]).

---

## ADR-034 — Intent Pipeline adoption: the transition plan (DESIGN ONLY · no code until BUG-017 closes)

Written to answer four questions before any implementation, so that when the cycle opens the work is
mechanical rather than exploratory. **Every number below is measured on production V484 `6fc7d00a`.**

### ⚠️ CORRECTION (2026-08-02) — the "single entry point" claim was false

This ADR first stated: *"The single entry point already exists. Every state mutation in the product
already funnels through one function."* **That is wrong, and it was wrong in the direction that makes
the migration look easier than it is.**

It was found by taking one question seriously instead of accepting the claim: *is the new path the
**only** path that changes state?* Measuring for that — rather than measuring inside the funnel, which
is all the first census did — produced:

| Mutation path | Call sites | What it writes |
|---|---|---|
| `_updateContentState(mutator)` | **50** | terminal 2–6 content (iframe): skills · languages · experiences · education · qualifications · motivation |
| `appState.setState(next)` — **direct, bypasses the funnel** | **14** | `language` · `prof.title` · `prof.content` · `contacts` · `skillsItems` · `userPlaced`/`layout` · `title` · `socialName` · `socialTitle` · `template` (×2) · `editorContent` (A4) · full-state reset |

Plus one legacy DOM-direct path (`addSkillToCategory`) that writes markup and never reaches state at
all — already flagged, still unused by the product.

**The two paths split along the document boundary.** `_updateContentState` is the *iframe content*
path; Terminal 1's canvas, the document title, the social fields, the template switch and the A4
editor each write straight to `appState`. Nothing forces them through the funnel, and nothing today
notices that they do not.

**Why the first census missed it:** it measured *inside* `_updateContentState` — 51 references, one
definition — and concluded from that internal completeness that the funnel was universal. It counted
what passed through the door without checking whether the room had other doors. *Choosing what to
measure is a hypothesis* (`METHOD.md` §2), and the hypothesis here was "the funnel is the boundary".

### What the transition actually is

**Not** "change what travels through one funnel" — and **not** "make the two paths converge" either.
Convergence is a routing goal, and routing is not the point. State it as a counterfactual:

```
if all 64 mutations were funnelled tomorrow:
    64 mutations · 1 corridor · 0 owners
```

Tidier. Not more controllable. Nothing would be validated, recorded or refusable that is not today.

**The objective is that every state change has a declared authoritative source.** The funnel may be
where that source is *implemented*, but it is not the goal, and reaching it is not progress toward the
goal. `_updateContentState` becomes the machinery beneath the command layer, and the 14 direct writers
must acquire an owner too — but a migration measured by *where calls go* rather than *what owns them*
would report success while changing nothing that matters.

> **Routing is a property of the path. Ownership is a property of the architecture.** The first can be
> fixed by moving code; the second cannot.

| Surface | Measured | Consequence |
|---|---|---|
| `_updateContentState` call sites | **51** (1 definition) | funnel exists; migration is per-call-site, not architectural |
| `HistoryEngine.record` call sites | **6** (6 distinct labels) | *the entire history surface is six places* |
| `CVCommand.registry` entries | **4** | `setLocalizedText` · `insertExperience` · `deleteExperience` · `moveExperience` |

Distribution of the 51: education 10 · skills 5 · languages 3 · experience 3 · motivation 1 · the rest
without an adjacent render call.

**The six is the important number.** The history migration was assumed to be the expensive half; it is
six call sites, four of which are photo operations.

### 1 · Entry point

`_updateContentState(mutator)` stays. It becomes the *implementation* beneath the command layer rather
than the interface the product calls:

```
today      caller ──▶ _updateContentState(anonymous mutator) ──▶ state
target     caller ──▶ CVCommand ──▶ CVReducer ──▶ CVPatch ──▶ _updateContentState(patch applier) ──▶ state
```

Migration is per call site, and a call site only migrates when a command exists for what it does.
`_updateContentState` is not deleted; it is *demoted*. Nothing needs a big-bang cutover, and at every
point the two forms coexist safely because both end at the same funnel — which is precisely why the
funnel's prior existence matters.

### Mutation Coverage — the metric that says how far the migration has come

```
Mutation Coverage = command-backed mutation sites / total mutation sites
```

**Baseline, measured: 0 / 51 = 0 %.**

A first estimate put it near 8 % by assuming the four registered commands back four call sites. They
back none. Every `CVCommand.make` occurrence in the artifact was read individually: each sits inside a
harness (`CVProperty`, `CVStruct.simulate`, `CVMutation`) or inside the pipeline's own definition.
`CVIntent` appears three times in total — it is a thin definition, not a wired layer.

*Registered ≠ reachable.* This is the same distinction as `BUILT · DORMANT` vs `LIVE`, applied to a
number, and it is why the metric is worth carrying: "the Intent Pipeline exists" is true and tells you
nothing, while "coverage is 0 %" tells you exactly how much work remains.

| Milestone | Coverage |
|---|---|
| today | **0 %** |
| after the census + first family migrated | — |
| adoption gap closed | 100 % |

### The census — COMPLETE (2026-08-02)

Every one of the 51 arguments was extracted by brace-matching (not a fixed text window) and classified
by **what the code observably does** — `splice`, `push`, `[lang] =` — with no reference to what command
shape might result. That constraint was set deliberately: classifying with the target design in mind
makes the measurement seek the expected answer.

51 references = **50 call sites + 1 definition**. Final classification: **0 unclassified.**

| Operation | Sites | Entities |
|---|---|---|
| `set-localized-text` | 29 | all six |
| `remove-one` | 13 | skills · languages · experiences · education · qualifications |
| `append` | 5 | skills · experiences · education · qualifications |
| `set-scalar` (`ratio` 3 · `level` 1 · `hidden` 1) | 5 | languages · experiences · education · qualifications |
| *(`init-container` 11 — excluded: a defensive guard, not an intent)* | — | — |

**The basis is 4 operations × 6 entities → 19 observed pairs of 24 possible.** Not 51 commands, not 26.

| Entity | append | remove-one | set-localized-text | set-scalar |
|---|:--:|:--:|:--:|:--:|
| `terminal2.skills` | ✅ | ✅ | ✅ | — |
| `terminal3.languages` | — | ✅ | ✅ | ✅ |
| `terminal4.experiences` | ✅ | ✅ | ✅ | ✅ |
| `terminal5.education` | ✅ | ✅ | ✅ | ✅ |
| `terminal5.qualifications` | ✅ | ✅ | ✅ | ✅ |
| `terminal6.motivation` | — | — | ✅ | — |

### The finding the census was not looking for

```
addressing by array index     36
addressing at container level 14
addressing by stable id        0
```

**Not one mutator locates its target by id.** Every one uses position — `items[ei]`, `columns[ci]`,
`panes[0]`. The command layer addresses only by id (`deleteExperience{id}`, `moveExperience{id,
beforeId}`).

So the migration is **a change of addressing mode, positional → identity** — not "wrap the mutator in a
command". This is precisely what the stable ids built in V481 exist for, and no production path has
ever used them.

**Stated more precisely, because the looser phrasing invites the wrong work:** this is not
`index → id`. It is **implicit identity → explicit identity**. The `Array` is not the problem. The
problem is a hidden contract:

```
items[index]   is read as   "the object I mean"
items[index]   actually is  "whatever sits at that position today"
```

Framed as `index → id`, the task looks like a mechanical sweep and invites replacing indices wherever
they appear — including where position is genuinely the concept. Framed as *making an implicit
contract explicit*, the question at each site becomes the right one: **was this position meant to
identify something, or to order something?** The census answers it for all 36 (identity, every time),
but the framing is what keeps the next migration from getting it wrong.

It also answers the safety question directly, and the answer runs opposite to the intuition: index
addressing fails **silently** — if the array reorders between read and write, `items[3]` finds the
wrong entity and writes it successfully. Id addressing fails **loudly** — the id is absent, the patch
does not apply, `CVStruct` sees it. **The migration increases safety here; it does not trade it away.**

### The design question the census leaves open — deliberately unanswered

`setLocalizedText` is entity-parameterised; `insertExperience` / `deleteExperience` / `moveExperience`
are entity-specific. Either the structural commands become parameterised, or `setLocalizedText` splits.

ADR-025 §3B forbade inventing the generic form before two real implementations existed. **That
condition is now met**, so the question is finally legitimate — but it is design, and the census was
measurement. It must be answered before the first migration, not during it.

> **Provenance note.** The census was prompted by a review exchange later found to have been conducted
> in a chat carrying a different project's context. The *measurements* are unaffected: every number was
> produced by reading this project's `index.html` directly, and none originated in the exchange. The
> constraint that shaped the method — *classify before designing* — was adopted because it is sound,
> and it is recorded here on that basis rather than on its source's authority. Recorded openly because
> an origin that cannot be stated is an origin that cannot be checked.

### 2 · History

**Transitional, not a single cut.** `HistoryEngine.record(label, undo, redo)` keeps working; a second
form `record(command, inverse)` is added beside it. A transaction that carries a command becomes
inspectable and serializable; a closure transaction stays exactly as it is.

Six call sites migrate individually. The engine is done when no call site passes closures — and
because there are six, that end state is reachable inside one cycle rather than being a permanent
"legacy path".

*Why not one cut:* the four photo transactions are the hardest (binary payloads, owner-scoped) and the
easiest to get wrong. They should migrate last, after the text commands have proven the shape.

### 3 · Verification

The point of the migration, stated as a testable property: **`CVStruct` currently judges
`(before, after, command)` and undo/redo has no command — so the one mutation path that reverses state
is the one the seven structural laws never see.**

A mutation is **complete** when all four hold:

1. it was expressed as a `CVCommand`;
2. `CVReducer` produced a `CVPatch` from it;
3. `CVStruct.check(before, after, command)` reports zero violations;
4. its inverse is recorded such that applying it satisfies (1)–(3) as well.

Hook point: inside `_updateContentState`, after the patch applies — the same place that already
triggers persistence. Running the full property suite there would be far too slow; the affordable
subset is the structural laws on the changed entity only.

### 4 · Exit criteria — objective, countable

The adoption gap is closed when **all** of these are true:

| Criterion | How it is counted | Today |
|---|---|---|
| **The command path is the ONLY path that changes state** | authoritative-state writes **not owned by** a command = **0** | **64** |
| **Positional addressing is gone from the product path** | mutators *locating* a target by array index = **0** | **36** |
| No product call site passes an anonymous mutator | `_updateContentState(` sites that do not take a patch = **0** | 50 |
| History holds no closures | `record()` sites passing functions = **0** | 6 |
| Every mutation kind has a command | 19 observed pairs − registry coverage = **0** | 19 − 0 |
| Undo is inside the law engine | `CVStruct` runs over undo/redo transitions and reports violations | no |

**The first row was added last and belongs first.** It exists because the original criteria measured
only inside `_updateContentState` — and 14 writers never go there. A migration that satisfied every
other row while leaving those 14 untouched would have produced a *second* path, not a replacement:
precisely the hybrid state this ADR exists to prevent.

**It counts ownership, not location — and the first draft got that wrong.** It read
*"`appState.setState(` call sites outside the command path = 0"*, which is a syntactic test of a
semantic property. After migration the correct path is:

```
Command → Reducer → Patch → setState
```

and that `setState` sits outside `CVCommand` lexically while being entirely inside the controlled
path. The literal count would have marked a correct implementation as a failure.

*This is the same error this ADR warns about one section above.* There, position was mistaken for
identity; here, call location was mistaken for mutation ownership. Both substitute where something
**is written** for what it **means** — which is worth recording, because the author made it twice in
one document while explaining why not to.

**How to count it:** a write is *owned* when its call chain originates in a `CVCommand`. Today none
do — the funnel's 50 and the 14 direct writers are all unowned, so the honest figure is **64**, not
14. The 14 are what the first census missed; the 50 were never owned either.

**The second row matters for the same reason, and it too was added after a census.** The original criteria
were written before the addressing finding existed, and they measured the *presence of commands* —
which this project has learned twice is the wrong question. `CVCommand` has existed and been registered
for weeks while reaching nothing.

*"Commands exist: yes"* is satisfiable without changing a single user edit. **"Positional mutation on
the production path: 0"** is not — it can only become true if the real path moved. That is the
difference between an artifact being present and an artifact being reached (`METHOD.md` §2).

The criterion is also the honest statement of what the migration buys: index addressing fails
**silently** when an array reorders between read and write; id addressing fails **loudly**. Counting
the positional mutators is counting the remaining silent-failure sites.

**What the count does NOT forbid — stated because the criterion will be measured by someone else.**
An index used *after* identity has been resolved is an implementation detail and stays legitimate:

```js
delete(id) { const i = items.findIndex(x => x.id === id); items.splice(i, 1); }   // ✅ counts as 0
delete(3)  { items.splice(3, 1); }                                                // ❌ counts as 1
```

The first resolves identity and then uses a position to act on it. The second *asserts* that position
is identity. The criterion counts the second kind only — **index as identity contract**, not index as
array mechanics. Written down because "positional addressing = 0" read literally would reject a correct
implementation, and a criterion that can be misread will be mis-measured.

### Is index ever the *correct* concept here? Measured: no

A blind `index → id` sweep would be wrong in general, because for a reordering operation the position
**is** the semantics — `moveItem(fromIndex, toIndex)` is not an identity lookup in disguise. So the 36
were checked for exactly that before the criterion above was accepted:

| Pattern that would make index legitimate | Found |
|---|---|
| `splice(i, 0, x)` — insert at a position | **0** |
| index swap `a[i] = a[j]` | **0** |
| `sort` / `reverse` | **0** |
| `fromIndex` / `toIndex` parameters | **0** |

Against: `splice(i, 1)` (13) — index standing in for identity — and `push` (5), which has no positional
target at all.

**There is no reordering operation anywhere on the production path.** All 36 use position as a *proxy
for identity*, which is precisely the failure mode. The migration therefore has **no carve-outs**, and
the exit criterion needs no exception clause.

The one operation where ordering genuinely is the concept already avoids indices by contract:
`moveExperience` takes `{id, beforeId | afterId}` — relative addressing, never a position (Part F,
Neni 78.4). The decision was made before the operation existed; the census confirms nothing in
production contradicts it.

Until the first three read zero, the pipeline is `BUILT · DORMANT`, and `ARCHITECTURE.md` must keep
saying so.

### A funnel is not a boundary

The correction above changes the unit of analysis, and it is worth naming because the first version of
this ADR treated the two as the same thing.

| | Question it answers | Today |
|---|---|---|
| **Funnel** | *does the call pass through here?* | 50 of 64 do |
| **Boundary** | *who has the authority to change state?* | **nobody — 0 of 64** |

A funnel is a corridor. Things travel down it; it does not decide, validate, or record. A boundary
owns the transition: nothing crosses without being expressed, checked and logged. `_updateContentState`
is the former and was mistaken for the latter — which is why "50 sites already share a funnel" felt
like progress toward the architecture, and is not.

**So this ADR has two outcomes, not one, and they must be tracked separately:**

| | Question | Today |
|---|---|---|
| **Ownership migration** | does every mutation have a declared owner? | 0 / 64 owned |
| **Routing migration** | does every mutation travel the authoritative path? | 50 funnelled · 14 bypass |

The 50 are *routed* but not *owned*. Completing routing alone — pushing the 14 into the funnel — would
close the second row and leave the first at zero: one tidy corridor, still with no authority at its
end. **Routing without ownership is the failure mode that looks most like success.**

### Ownership leads; routing follows

The two outcomes are not merely separate — they have an **order**, and it is the opposite of the
instinct. Compare two intermediate states:

| | Routing | Ownership | Verdict |
|---|---|---|---|
| **A** | 100 % funnelled | 0 % owned | every call in one place, and nothing can say who authorised any of them |
| **B** | 80 % funnelled | 100 % owned | two paths still exist, but every change names its owner |

**B is the healthier state**, even though A looks finished. In B the system can answer *"what
authorised this?"* for every mutation, and the remaining routing work is mechanical relocation. In A
nothing can answer it, and the work left is the hard part — with the tidiness of the corridor
disguising that.

So the sequence is: **declare the owner, then move the call.** Moving calls first produces A, and A is
the state that most resembles success while containing none of it.

*The three ideas this ADR conflated at the start, now separate:* **routing** — where a change travels ·
**boundary** — where alternative paths are refused · **ownership** — who authorised the change. A
system can have the first without either of the others, which is exactly V484: 50 of 64 routed, no
boundary, no owners.

### The same shape as BUG-018

This finding and BUG-018 are structurally identical, which is why both were invisible to reading and
visible to measurement:

| | Not the problem | The actual problem |
|---|---|---|
| **BUG-018** | dangerous SVG reaching production | a function named `Safe` did not prove its promise |
| **Here** | two different ways to call state | **no way declares ownership at all** |

In both, the defect is a **missing guarantee**, not a present danger. Nothing was broken in either
case; something was merely never true. That class of defect survives every review that asks *"does
this work?"* and falls only to one that asks *"what does this claim, and is the claim proven?"*

### A boundary shared with ADR-031 — noticed, not resolved

Several of the 14 direct writers touch exactly what the `editor-control` unification will touch:
`layout` · `template` · `title` · `editorContent` · the canvas `contacts`/`skillsItems` positions.

So ADR-031 and ADR-034 meet at a shared edge, and the queue order already in place handles it the
right way round: **ADR-031 runs first and will reveal which controls are still special cases**; ADR-034
then draws the final boundary knowing what it must contain. Reversing the order would mean drawing a
mutation boundary around a control surface that is still changing underneath it.

No decision is taken here. Recorded so the ADR-031 cycle knows it is standing on shared ground, and so
that whatever it finds about those controls arrives as input to this ADR rather than as a surprise.

**One thing ADR-031 must therefore produce, beyond a unified control class:** for each control it
touches — *what owns the state change it causes, and which invariant must remain true across it?*
An inventory of controls is not the deliverable; a map of responsibility is:

```
UI control → intent → owner → mutation → invariant that must survive it
``` A control that is visually unified while its mutation
remains unowned has been unified in appearance only — the same distinction as funnel versus boundary,
one layer up. The `editor-control` cycle is the cheapest place to discover that mapping, because it is
already reading every control; discovering it later means reading them all a second time.

### Status

**DESIGN + CENSUS COMPLETE. No code written.** The measurement half of this ADR is finished (2026-08-02);
the design question above is deliberately still open, and no artifact byte was touched.

The queue is unchanged: BUG-017 (observation) → `editor-control` (ADR-031) → the implementation half of
this ADR. Opening the implementation earlier would put three architectural debts in flight at once,
which is the failure mode `METHOD.md` §1 exists to prevent.

**What the next cycle inherits, already done:** the operation basis (4 × 6), the 19 observed pairs, the
addressing finding, and a `Mutation Coverage` baseline of 0 %. What it must decide first: parameterised
versus entity-specific structural commands.

---

## ADR-033 — A visual change is a performance change; count the painted layers (DECIDED)

- **Rule.** Any change that alters *how many elements paint an expensive effect* — blurred `box-shadow`,
  `filter`, `backdrop-filter`, large `border-radius` with overflow — is a **performance change**, and
  must be measured as one before it ships. Making previously hidden elements visible counts: an element
  at `opacity:0` costs nothing, the same element at `opacity:0.32` pays in full.
- **The measurement** (cheap, no profiler): in the affected template, count visible elements whose
  computed `box-shadow` is not `none`, and sum their blur radii. Compare against the previous release.
  A doubling is a red flag regardless of how small each element is.
- **Evidence that produced it.** V483 made 68 editor controls permanently visible and gave each a
  two-layer neumorphic shadow. Design 4 went from **59 to 125** shadowed elements (blur sum 340 → 736).
  Scrolling became heavy and the compositor dropped whole frames — the screen went black while the
  content was still present and hit-testable. It was a purely aesthetic change with no logic in it.
- **The counter-intuitive part, worth keeping:** those controls occupied only **4 %** of the painted
  area, yet they decided the outcome. Reducing their blur radius 6px → 2px — about 9× less blur work
  each — did **not** fix it; removing the layers did. **Cost tracked the NUMBER of blurred layers, not
  their size.** Do not reason about this from area or radius; count layers.
- **How to keep an expensive look without the cost:** pay for it only on the element being interacted
  with. Here the shadow was dropped at rest and restored on `:hover` — one element at a time is free.
  A gradient background can also imitate a soft shadow at near-zero paint cost.
- **Relation to ADR-031/032:** those govern *whether* a control is excluded and *by what mechanism*.
  This one governs what it costs to draw the ones that remain.
- **Status:** Decided 2026-07-29, from BUG-017 (`BUGS.md`).

---

## ADR-031 · IMPLEMENTED — steps 1b, 3, 4, 5, 6 (2026-08-16, sandbox only)

Production V486 `b2c238c6` was **not touched**. Everything below is in `index-test.html`.

### Step 1b — the first implementation was wrong, and the gate could not have caught it

Step 1 keyed the declaration on the six default contact ids and Gate C passed **8/8**. The table was
still wrong, and the gate was still right: it measured the population that existed.

```js
/* what step 1 shipped */
this.dimensionOwner = CONTACT_DIMENSION_OWNER[data.id]
                   || (data.type === 'skillItem' ? 'layout' : undefined);
```

A user-added contact is `{id: Utils.generateId("c"), icon:"👤", text:"Neuer Kontakt", left, top, width}` —
**no `type` at all**. Neither branch matches, so the owner is `undefined`. Enabling step 4 over that
table would have thrown on the first contact anybody added.

Measured, not argued — a real spawn dropped on the canvas in a clean browser profile:

```
droppedData        { id:"c-1786866928048-rbfxyx", icon:"👤", text:"Neuer Kontakt" }   ← no type
OLD table          UNDEFINED          ← step 4 would have thrown here
kind-keyed table   layout             ✅
```

**The defect is the exact trap this ADR names.** The table enumerated the instances that happened to
be present instead of declaring the categories the system has. *An instance id is not a category.*
The contract had become a transcription of the saved state — the one property that would have made it
worthless, arrived at by the author who wrote the warning against it.

#### The correction: the kind comes from the caller, because the caller structurally knows it

| call site | kind | how it knows |
|---|---|---|
| `handleNewElementDrop` | `contactKindFromSpawnType(dropData.type)` | the dataTransfer payload |
| `_src.skills` | `'skills'` | the field |
| `_src.prof` | `'prof'` | the field |
| `_src.contacts.forEach` | `'contact'` | the collection **is** the category |
| `_src.skillsItems.forEach` | `'skillItem'` | the collection **is** the category |
| touch drop | `contactKindFromSpawnType(type)` | the spawn closure |

```js
const DIMENSION_OWNER_BY_KIND = { contact:'layout', skills:'layout', skillItem:'layout', prof:'content' };
```

Four kinds, **no id ever consulted**. The spawn vocabulary (`'contact' | 'skill'`) is translated once,
and that translation returns `undefined` for anything unrecognised — otherwise the no-default rule
would simply move one level up and be lost there.

### ⚠️ A claim made during this work that was WRONG — kept, because it is the lesson

I reported that `LayoutEngine.calculateDefaultLayout()` would break a **fresh install**, having found
three branches emitting `Utils.generateId('c')` instead of the base id.

It does emit them. It changes nothing. All three consumers merge **positions only**:

```js
Object.assign({}, dc, {left: match.left, top: match.top, width: match.width || dc.width})   // id from dc
```

The code says so itself: *"Content is NEVER generated by LayoutEngine — it only calculates positions."*
A generated layout id never reaches the constructor.

**Finding a mechanism in the source is not measuring the behaviour, and here the two disagreed.** The
mechanism was real and the consequence was zero — the same shape as the `position:relative` finding in
step 2, made again by the same author in the same ADR, one step later. What separated the true defect
from the false one was not more reading. It was a browser.

### Step 3 re-run — the gate now covers the whole category space

A clean browser profile (default seed data, the user's document untouched) reached populations their
own session cannot produce.

```
fresh install            8/8 valid       ids preserved: c-email … prof-desc
+ real skill drop        spawn 'skill'  → skillItem → layout   ✅  ← the item step 4 waited for
+ real contact drop      spawn 'contact'→ contact   → layout   ✅
after save → reload     10/10 valid      restore path, both new items survive
```

```
categories the code admits   4 kinds
categories exercised         4 kinds        creation route: drop AND restore
```

`skillItem` is now **runtime-tested**, not source-verified. It was never necessary to mutate the user's
CV: a second browser with default data was a different document, and it answered the same question.

### Step 4 — enforcement, enabled

```js
this.dimensionOwner = DIMENSION_OWNER_BY_KIND[kind];
if (this.dimensionOwner !== 'layout' && this.dimensionOwner !== 'content') throw new Error(…);
```

Negative control — the guard must be shown to fire, or "no failures" means nothing:

```
createContactElement({…}, 'notAKind')   →  THROW
probeLeakedIntoRegistry  false
probeLeakedIntoDom       false
```

**A rejected element does not half-exist.** The constructor throws before `create()`, before
`appendChild`, before `contactElements.set` — so enforcement cannot leave orphans in the canvas.

### Step 5 — the size paths now read the declaration

Four identity tests existed. **They were not all on the same axis**, and that decided the scope:

| site | axis | action |
|---|---|---|
| `adjustHeight()` guard | vertical | reads `dimensionOwner === 'content'` |
| drag `onMove` pre-check | vertical | removed — the guard is inside |
| content-update pre-check | vertical | removed — the guard is inside |
| resize width clamp | **horizontal** | **untouched — out of scope** |

The width clamp only ever computes `newLeft`/`newWidth` and returns `{left, width}`. `dimensionOwner`
declares ownership of the **vertical** dimension; migrating a width rule to read it would silently
extend the contract to a second axis without a decision. Recorded as a finding, not migrated.

Three identity tests collapsed into **one declaration read** — the two callers pre-checked the same
class the callee already checked, so the knowledge lived in three places. Removing the pre-checks
exposed that `adjustHeight()` had been relying on a caller's `this.element &&` null guard; it now
carries its own.

### Step 6 — regression, measured

| check | before | after | verdict |
|---|---|---|---|
| content-owned grows with content | 113px | **341px** → 113px | ✅ |
| layout-owned with 56 extra chars | 58px | **58px** | ✅ |
| `adjustHeight()` on layout-owned | — | safe no-op | ✅ |
| drag prof-desc / c-email | — | moves, height stable, no error | ✅ |
| console errors | — | none | ✅ |

**The contract now has an observable consequence.** `content` and `layout` behave differently under
the same input, and the difference is decided by the declaration rather than by a stylesheet class.

### PROMOTED — V487, 2026-08-16

```
index.html == index-test.html == 487.html == d09626007a7534c1e311bdd6ccc184d0   (V487)
rollback                                     index.html.bak-v486-baseline (b2c238c6)
```

Verified on the promoted artifact: 8/8 owners valid · enforcement throws with no leakage ·
round-trip content-identical · `CVStableIdMigration` ok · `CVSecurity` 4/4 · 0 console errors.
Release record and full checklist in `RELEASE_PROCESS.md`.

### What this does NOT claim

- Nothing here bears on **BUG-017**. No new evidence about it was produced, and none was sought.
- Step 5 modified the drag path (`onMove`) — the interaction the symptom is conditioned on. The
  promotion therefore **is** an Arm B configuration change, and is recorded as one in `BUGS.md` with
  the pre-promotion `GPU process crash count` read at 2026-08-16T14:46:10Z (**0**, session-scoped).
  This is written down so that a later "it stopped happening" cannot be quietly credited to ADR-031,
  and equally so that a later recurrence is not mistaken for a regression it introduced. **A fourth
  variable now sits in an arm that already carried three.** That is a cost of shipping this, paid
  deliberately and recorded rather than absorbed.

---

## `cv-hist-btn` — ISOLATED DELTA AUDIT against V487 (2026-08-16) · the plan is FALSIFIED

```
BASELINE     V487 / d09626007a7534c1e311bdd6ccc184d0
ATTRIBUTION  V487 → V488
STATUS       audit complete · NO code written · the planned change must not be built as specified
OUTCOME      → ADR-035 (end of this file): decision (a), contract fixed, implementation NOT authorised
```

Audited before implementing, and the audit falsified three of the plan's own premises. Recording it
this way is the point: none of the three would have survived contact with the running page, and all
three came from reading.

### What was confirmed

`instance count ≠ behaviour count ≠ implementation count` holds exactly as measured:

```
12 instances    2 outer (Terminal 1 "personal") + 10 iframe (5 sections × 2)
 1 behaviour    every handler calls HistoryEngine.undo/redo('project')
 2 factories    mk(…) and _mkT1(…)
```

Scope `'a4'` is untouched by any of this, and HistoryEngine needs no change.

### Falsification 1 — the two factories live in DIFFERENT DOCUMENTS

```
mk()      + its 2 call sites     INSIDE the iframe template   (569018 … 727791)
_mkT1()   + its 2 call sites     OUTER document
```

The change was described as "move where the factory is invoked". It is not: it **deletes UI from
inside the iframe and recreates it in the outer document**. That crosses the boundary this project
has a standing rule about after M2 failed twice. Not automatically forbidden — M2 was *elimination*
and this is two buttons — but it is a different class of change than the plan named, and it must be
entered as such.

### Falsification 2 — the wrong factory was elected to survive

The plan concluded: *"`_mkT1` … already generic, its only Terminal-1-ness is the call site, so it
survives and is the one that moves"*, while `mk` *"becomes purposeless"*.

Measured, it is the reverse.

| | plan | measured |
|---|---|---|
| `_mkT1` | generic, only the call site is T1-specific | **declared three guards deep inside `wireT1()` — the PHOTO wiring** |
| `mk` | bound to a terminal header layout | **lives in a dedicated, well-named `_wireTerminalHist(sec)` with its own idempotence guard** |

```js
function wireT1(){
  var hdr = sec.querySelector('.terminal-header'), btn = sec.querySelector('.cv-photo-btn');
  if(hdr && !btn){                                  // ← only when the PHOTO button is CREATED
    btn = …photo button…
    if(!sec.querySelector('.cv-hist-btn-t1')){
      function _mkT1(…){…}                          // ← declared HERE
```

The history buttons of Terminal 1 exist **only because the photo button did not exist yet**. Its
body is generic; its *lexical position* is not, and the plan mistook the one for the other. The
iframe factory is the architecturally cleaner of the two — it even computes its offsets by measuring
the existing add-buttons rather than hard-coding them.

### Falsification 3 — the decisive one: the 12 instances are REACHABILITY, not redundancy

Q1 concluded the single control belongs "at document level, sibling to A4, above the terminals".
Measured on the running page:

```
document height           3991 px
viewport                   914 px
T1 control page-top          94 px    NOT sticky, NOT fixed
```

Scrolled to each terminal, the control's own `getBoundingClientRect()`:

| editing | control top | visible |
|---|---|---|
| top of page | +94 px | ✅ |
| `experience` | **−1337 px** | ❌ |
| `motivation` | **−2931 px** | ❌ |

**A single document-level control is off-screen for most of the document it governs.** Removing ten
instances and leaving one three viewport-heights away is a functional regression wearing the costume
of de-duplication.

So the framing *"UI multiplicity mistaken for behavioural multiplicity, by the people who built it"*
is **half right and the wrong half is load-bearing**. The behaviour count really is 1. But the UI
multiplicity is not an error — it buys proximity on a 3991 px document, and the count alone could
never show that. **The measurement that mattered was not how many buttons exist; it was how far away
they are.**

### What the real defect is, after the audit

Not the materialisation. **Nothing in the structure declares that this control is global** — the
tooltips say "(Projekt)" and that is the only place the scope is stated. That *is* ADR-031-shaped,
and the honest fix is one of two, to be decided rather than assumed:

- **(a)** declare the global scope explicitly and keep per-terminal materialisation as a
  *presentation* decision, now justified in writing instead of by accident; or
- **(b)** one control **plus sticky/fixed positioning** — which is a new positioning behaviour, a
  second change, and must be decided on its own merits, not inherited as a consequence of the first.

### Secondary finding, not acted on

`mk` is an overloaded local name in **three unrelated scopes** (the history factory, an SVG element
factory, a test-data factory). Any text-level removal keyed on `mk` would hit code that has nothing
to do with history. Noted so the next implementer does not discover it with a regex.

---

## ADR-032 — Logical exclusion may not rest on a visual property (DECIDED · project invariant)

- **Invariant.** If an element **must not exist** in a given mode (Preview, Export, Print), the
  mechanism must be `display:none` or removal from the DOM. It may **never** be `opacity:0`,
  `visibility:hidden`, or a colour matched to the background.
- **Why.** `display:none` means the element does not participate in layout or render — a *semantic*
  statement. `opacity:0` means the element still exists and is merely unseen — a *visual* statement.
  Anything downstream that reads geometry, text, or the DOM (a rasteriser, a print engine, a PDF text
  layer, a screen reader, a future exporter) sees an element that was supposed to be absent.
- **The evidence that produced it** (audit of 2026-07-29, recorded in ADR-031): six editor controls
  computed `display:flex` in both Preview and Export because ID-level `!important` rules outranked every
  hide rule. They were invisible **only** because `visibility:hidden`/`opacity:0` happened to be set by
  the same guards. Until V482u a whole class of controls was hidden in the PDF by exactly this accident;
  the "always-visible" UX change removed those two properties and with them the accidental protection —
  the hide rules had never actually worked.
- **This is the same principle as [Source over representation]:** the authoritative statement about an
  element's participation is `display`, not how it looks. Hiding by appearance is asserting the
  representation and hoping the source agrees.
- **Consequence for review:** when a control is added or a hide rule is written, the check is not "is it
  invisible?" but "**is it excluded?**" — assert `display === 'none'`, never `opacity === '0'`.
- **Status:** Decided (proposed by the user, 2026-07-29). Applies to Preview, Export and Print paths.
  ADR-031's unification task must satisfy it.

---

## Milestone — Evidence Architecture Stabilization — COMPLETE (2026-07-20)
A named "Done" for the qualification-layer phase, so the boundary is explicit rather than felt.
**Result:** the evidence architecture is stabilized; contracts are formalized and verifiable; the core
invariants are documented and (where meaningful) automated; the ONLY remaining decision is identity
semantics, isolated in the Foundational ADR-029. **The problem class has shifted** — the phase opened on
functions/merge/snapshots/cache/drift (implementation questions) and closes on *"what does it mean for
two pieces of evidence to be the same evidence?"* (a semantic question). That shift is itself the signal
the base layer is stable enough to stop.
- ✅ Snapshot contract is EXPLICIT and mechanically checked (ADR-030 Inv-1 via `hygiene`, set-equality).
- ✅ Schema is VERSIONED (`snapshotSchemaVersion`, currently `cvq-snap-2`).
- ✅ Consumers share ONE contract; unreadable schema is a TYPED answer, not a throw.
- ✅ Migration is conceptually ISOLATED (`SnapshotMigration` seam at `schemaOf`; not yet built — no
  second schema in play yet needs it).
- ✅ PRIMARY FACTS are protected mechanically (single source of truth; Inv-1 enforced).
- ✅ Compatibility Matrix guards format regressions (fixture × consumer, golden fixtures).
- 🟡 **Identity SEMANTICS is the single open architectural decision — ADR-029.**
**Closure rule:** no evidence-identity-touching code until ADR-029 answers Identity → Representation →
Versioning (a chain: representation cannot be chosen before identity; versioning cannot precede a chosen
representation). This is why #3 (fingerprint-over-bodies) stays frozen.

**The test that ADR-029 is REALLY closed (stronger than "implementation is a consequence"):** once
decided, the implementation must contain **no architectural decision at all** — only "which functions,
where, how tested, how optimized," never "what is identity / representation / versioning." *If an
identity/representation/versioning debate arises during implementation, ADR-029 was not actually
closed.* That is the clean boundary between architecture and engineering.

**The next cycle has exactly two gates:**
- **Gate A — Architecture Gate:** `ADR-029 == DECIDED`, else `fingerprint implementation = BLOCKED`.
- **Gate B — Promotion Gate:** `Implementation → Foundation Gate → Compatibility Matrix → Delta Audit
  (prod → candidate) → Promotion`. Separates decision, implementation, and promotion cleanly.
  *(That gate was executed for the V479 → V482u release on 2026-07-24; the baseline is now V482u.)*

**Explicitly OUTSIDE ADR-029 (orthogonal — do NOT wait on the fingerprint decision):**
`MoveExperience` (Author) and Promotion / Delta-audit. Neither depends on identity semantics; blocking
them on ADR-029 would be a false dependency.

---

## Vision (non-binding — NOT Foundation, recorded so it isn't lost)

**Document Intelligence Engine.** Beyond "CV/Document Builder": the document *understands itself*
— intelligence built ON the Domain, not a chat bolt-on. Examples: "3 experiences have no date",
"this skill repeats 4×", "this paragraph is too long for one A4 page", "the German version does
not match the English", "the Albanian translation is missing", "this section could move for ATS".
This is the long-term differentiator; it is only feasible BECAUSE the Domain is explicit,
typed, and id-addressed (ADR-014). Do not build it during Foundation; keep the Domain rich
enough that it becomes possible.

---

## ADR-035 — `cv-hist-btn`: one behaviour, many materialisations (DECIDED 2026-08-16 · CONTRACT ONLY, no code)

```
STATUS        DECIDED
IMPLEMENTED   NO
AUTHORIZED    NO
BASELINE      V487 / d09626007a7534c1e311bdd6ccc184d0

Q1  global HistoryEngine          CONFIRMED
Q2  iframe boundary               RESOLVED
Q3  per-terminal presentation     JUSTIFIED
Q4  viewport accessibility        UNTESTED
Q5  sticky/fixed                  OUT OF SCOPE
```

**DECISION (a):** declare the global scope; KEEP per-terminal materialisation.

### ADR-035 DOES NOT AUTHORISE

The permissions are stated negatively and in one block on purpose. Spread across three sections —
Term 5, the factory-cleanup subsection, and Q5 — this list was individually complete and collectively
easy to miss, which is the same failure mode as a contract nothing enforces.

```
✗  merging mk() and _mkT1()
✗  extracting _mkT1() out of wireT1()
✗  replacing or removing mk() as "duplication"
✗  renaming/refactoring keyed on the overloaded identifier `mk`
✗  any change that crosses the iframe boundary
✗  any architectural change to the factories
✗  sticky/fixed positioning
```

**The separation this enforces:**

| | |
|---|---|
| **ADR-035's contract** | *what must be true* of the UI |
| **A future implementation** | *how that is realised* — without changing the architecture |
| **A factory refactor** | different work · different ADR · different delta |

Nothing above is a claim that the forbidden items are wrong. Several may be improvements. They are
forbidden **under this ADR**, because this ADR decided presentation and none of them are
presentational.

### Context

Raised as *"each terminal's undo/redo has its own logic — merge them?"* The premise was false: there
is one shared `'project'` history and there never was per-terminal isolation. A plan followed to
materialise a single control at document level. The isolated delta audit against V487 (above)
falsified that plan on three counts, the decisive one being that the 12 instances buy **proximity**,
not redundancy: on a 3991 px document with a 914 px viewport, one document-level control measures
−1337 px at `experience` and −2931 px at `motivation`.

**This ADR exists because the plan was wrong in a way that reading could not detect and the code
would not have complained about.** De-duplicating the materialisation would have produced a green
suite and a worse product.

### Decision — (a)

| # | Term | Value |
|---|---|---|
| 1 | **Behaviour owner** | `HistoryEngine` — sole authority; unchanged by this ADR |
| 2 | **Scope** | **global**: every `cv-hist-btn` acts on the same `'project'` history |
| 3 | **Presentation** | **terminal-local / per-section** — a deliberate decision, not an accident |
| 4 | **Placement invariant** | a control must be reachable from the viewport of the section it governs |
| 5 | **Iframe boundary** | **no migration between documents.** `mk()` stays inside, `_mkT1` stays outside |
| 6 | **No behavioural duplication** | 12 UI instances ≠ 12 history implementations, and never may become so |

Scope `'a4'` is outside this ADR entirely.

### What term 3 actually changes

Nothing at runtime — and that is the point. Per-terminal materialisation was already the behaviour;
what was missing was anyone having **decided** it. It existed by construction, so it could have been
"cleaned up" by any future reader as incidental duplication, exactly as this cycle nearly did.
**The change is that removing an instance now requires contradicting a written term, instead of
noticing a repetition.**

### Term 4 is a TEST INVARIANT, and it is currently `UNTESTED`

The audit exposed a real gap: **the suite cannot measure whether a control is reachable.** Every gate
this project runs — counts, hashes, round-trips, qualification — would pass on a build whose undo
button sits 3000 px off-screen.

Stated so it can be executed later, rather than left as a sentiment:

> For each section *S* carrying editable content, when *S* is scrolled into view, at least one
> control acting on the history scope that governs *S* has a `getBoundingClientRect()` intersecting
> the viewport.

```
current state   SATISFIED BY CONSTRUCTION, NOT BY ENFORCEMENT
                (each section wires its own pair, so it holds today for the same
                 reason the old contract "held": nobody has broken it yet)
```

**It is recorded as `UNTESTED`, never as `PASS`.** The audit measured three points on one document at
one viewport size; that is an observation, not coverage. Writing the test is separate work and is not
authorised here.

### Term 5 — and why it is a boundary, not a preference

The two factories are in different documents (`mk()` inside the iframe template, `_mkT1()` outside).
Any consolidation moves UI across that boundary. M2 attempted iframe changes twice and failed twice.
This ADR does not relitigate that: it forecloses the move, so a future reader does not rediscover the
idea and pay for it again.

#### This ADR may not be cited as authority for a factory cleanup

The term above forbids moving the **UI** across the boundary. It must also foreclose the quieter
route, which is the one a tidy-minded reader will actually take:

```
FORBIDDEN under this ADR
  merging mk() and _mkT1() into a shared helper          "for consistency"
  extracting _mkT1 out of wireT1() to pair it with mk()  "it's generic anyway"
  removing mk() as duplication of _mkT1()                "same function twice"
  any rename/removal keyed on the identifier `mk`        it is overloaded in 3 unrelated scopes
```

Each of these leaves the twelve controls exactly where they are — so each *looks* like presentation
being left alone — and each still changes code across the iframe boundary. **The audit established
that this is an architectural change, not a presentational one; ADR-035 decides presentation and
therefore cannot authorise it.** A factory consolidation needs its own decision, on its own evidence,
naming the iframe boundary as its subject rather than inheriting it as a side effect.

The `mk` overloading recorded in the audit is a **warning to whoever eventually does that work**, not
a defect this ADR opens. Nothing in this ADR asks for it to be fixed.

### Q-table

| | Question | State |
|---|---|---|
| Q1 | global behaviour | **CONFIRMED** — 1 behaviour, measured |
| Q2 | factories / iframe boundary | **RESOLVED** — different documents; no migration |
| Q3 | per-terminal UI | **JUSTIFIED** — proximity, now written down |
| Q4 | viewport proximity | **UNTESTED** — invariant stated, no test exists |
| Q5 | `sticky` / `fixed` | **OUT OF SCOPE** — a new behaviour, needs its own decision |

**Q5 is not a rejection.** Sticky positioning may well be the better product one day; it is simply not
a consequence of anything audited here, and adopting it as a side effect of a de-duplication task is
how an unexamined behaviour enters a codebase.

### Implementation

**None is authorised by this ADR.** It fixes the terms; the work that follows them is a separate
change with its own delta-audit against V487, its own release record, and — per BUG-017's monitoring
contract — its own GPU baseline if it touches an interaction path.

### The transferable part

Three separate premises about this component were produced by reading and all three were wrong: the
factories' locations, which one was generic, and whether the multiplicity was waste. **A count is not
a conclusion — this cycle's fourth instance of the same error.** The number that settled it was not
how many controls exist but *how far away they are*, and no amount of further reading would have
produced that number.

---

*Origin: decisions reached across the 2026-07 architecture dialogue (user relaying ChatGPT +
Claude's independent analysis). Memory: `cdm_evolution.md`.*

---

## ADR-035 — ONE GLOBAL UNDO/REDO · IMPLEMENTED IN SANDBOX (2026-08-21)

**Status:** implemented in `index-test.html`, verified, **NOT promoted**. V487 untouched.

### The premise that had to be checked first — and it was FALSE
The task looked like "each terminal has its own undo/redo; merge them". It was not. `HistoryEngine`
has exactly two scopes:
```js
var S = { project:{u:[],r:[]}, a4:{u:[],r:[]} };
```
Every per-terminal button already called `undo('project')` / `redo('project')` — **the single shared
project history. There was never any per-terminal isolation to merge.** A design that preserved
per-terminal histories would have preserved something that does not exist.

### Measured shape before the change
```
creation sites   2      _wireTerminalHist -> mk()   (iframe, per terminal)
                        _mkT1()                     (outer document, Terminal 1)
runtime buttons  12     2 in Terminal 1  +  2 x 5 terminals in the iframe
behaviours        1     all of them: HistoryEngine.{undo,redo}('project')
```
**instance count != behaviour count != implementation count.** The debt was never copy-pasted logic —
it was one global control materialised once per terminal, with nothing declaring it global.

### What changed — the materialisation, not the engine
```
REMOVED   _wireTerminalHist(sec){...}                    2 493 chars (iframe method + its comment)
REMOVED   self._wireTerminalHist(sec);                   its only call site, in the terminal loop
REMOVED   .cv-hist-btn from 4 shared CSS selector lists  8 selectors, precisely; sibling selectors
                                                         (.cv-photo-btn, .cv-photo-btn-t1,
                                                          .cv-hist-btn-t1) verified untouched
KEPT      _mkT1() and Terminal 1's two buttons           unchanged
UNTOUCHED HistoryEngine · scope 'project' · scope 'a4' · A4 toolbar (rtUndo/rtRedo) ·
          keyboard shortcuts (they were always global) · photo buttons · terminal-add buttons
```

### Verified in the browser
```
Terminal 1        2 history buttons                        (cv-hist-undo, cv-hist-redo)
iframe            5 terminals, 0 leftover history buttons  (was 10)
untouched         4 photo buttons · 11 add buttons · rtUndo · rtRedo all present
engine            HistoryEngine present, currentScope 'project', full API
node --check      27 script blocks, 0 syntax errors
```

### Chronological behaviour — the substance of the request — PROVEN
Three project changes made 600 ms apart, then driven from Terminal 1's buttons:
```
depth after 3 changes   undo:3 redo:0        one entry per change
undo  572 -> 532 -> 492 -> 452, then canUndo:false
redo  452 -> 492 -> 532 -> 572
chronological: true    chronologicalForward: true
```

**A NOTE ON MERGING, so it is not later mistaken for a bug.** A first test made the same three changes
120 ms apart and got ONE undo entry. That is deliberate: the bridge records with `merge=true` and the
engine collapses same-label records inside a 350 ms window. It exists so that a drag — which fires
many `setState` calls — becomes ONE undo step instead of dozens. Human edits are never 120 ms apart;
the collapse was an artifact of a synthetic test, not a defect.

### Coverage of the single history
```
AppState.setState bridge  'Ndryshim (Projekt)'  -> every contact, drag, text edit, structure change
photo operations          'Shto/Fshi/Zëvendëso foton', 'Rregullo pamjen'
A4 document               'Shkrim (A4)'  -> the SEPARATE 'a4' scope, deliberately not merged
```

`index.html` / `487.html` `d09626007a7534c1e311bdd6ccc184d0` — untouched.
Sandbox build tag `V487+adr035`; the instrumented BUG-017 build is preserved as
`index-test.html.bak-ctxrec`.

### ADR-035b — LETTER-BY-LETTER TEXT HISTORY (2026-08-21, sandbox only)

User's requirement: *"kur fshiva … i fshiva shkronjë me shkronjë — kështu duhet të funksionojë"* —
undo must mirror the granularity of the edit. Chosen explicitly over word-level and session-level.

**Why it did not behave that way before — two separate causes, both measured:**
```
_makeEditable (28 call sites, iframe terminals)   committed only on BLUR
    -> an entire editing session in one field = ONE undo entry
titleEditable / .social-name / .social-title      committed on debounce(input, 500 ms)
    -> a whole typing burst = ONE undo entry
```
Two different granularities in the same product, neither of them per-keystroke.

**What was built**
```
_makeEditable   an `input` listener records ONE transaction per keystroke, merge explicitly FALSE
_histText       the same contract for the three outer-document editables, which never went
                through _makeEditable
both            innerHTML snapshots (not textContent) so inline formatting survives the round trip
both            the state commit is wrapped in HistoryEngine.suspend()/resume() so the AppState
                bridge cannot add a second, coarser entry on top
```

**A REAL DEFECT FOUND AND FIXED ALONG THE WAY — the bridge recorded on object identity**
```js
if (rec && this.state !== prev) { HE.record('Ndryshim (Projekt)', …) }   // reference test
```
Traced with a `record()` interceptor: `CanvasTerminal.update() -> ContactManager.saveState() ->
setState()` fires periodically and snapshots the DOM into a FRESH state object. With only a
reference test, every such re-save appended a spurious undo entry even when nothing had changed —
which is why undo steps stopped matching keystrokes and redo walked a different path than undo.
**Now it compares CONTENT and records only a real change.** This defect predates ADR-035 and
affected every undo in the product, not just text.

### VERIFIED — 4 keystrokes deleted, then driven from Terminal 1's buttons
```
field                           entries   undo            redo            verdict
terminal editable               4         8,9,10,11       10,9,8,7        PASS
.social-name                    4         10,11,12,13     12,11,10,9      PASS
titleEditable                   4         22,23,24,[23]   24,23,22,21     redo PASS · last undo WRONG
.social-title                   4         38,39,40,[13]   40,39,38,37     redo PASS · last undo WRONG
```
**One entry per keystroke everywhere. Undo and redo both step one letter at a time.**

### OPEN — NOT SOLVED, and not to be reported as working
`titleEditable` and `.social-title` restore correctly for every step EXCEPT the final undo back to the
original value, where a stale value appears instead. Both are fields with a SECOND writer:
`applyState()` writes `titleEl.textContent = state.title` independently of this path. Two attempted
fixes (commit-then-rewrite, and a next-frame re-assert) improved but did not eliminate it.
The remaining failure has NOT been isolated; it is not to be called fixed.
Note also that the probe drives `textContent` directly, which destroys the `<br>` in `.social-title` —
the synthetic edit is not identical to a real keystroke, and that difference is itself unexcluded.

---

## ADR-035c — THE OPEN DEFECT ISOLATED: `title` / `socialName` / `socialTitle` HAVE NO OWNER IN STATE

**Status:** ROOT CAUSE MEASURED — **FIX IMPLEMENTED AND VERIFIED IN SANDBOX 2026-08-21.** Not promoted.
**Date:** 2026-08-21. Sandbox `index-test.html` only. Production V487 (`d09626007a7534c1e311bdd6ccc184d0`) untouched and verified byte-identical before and after.

### The previous entry named the wrong second writer — corrected here
ADR-035b recorded the second writer as *"`applyState()` writes `titleEl.textContent = state.title`"*.
**That was wrong.** The measurement below shows the render path never reads `state.title` at all.
The correction matters, because it is the difference between a race (fixable by ordering) and an
ownership gap (not fixable by ordering) — and it is why both ordering fixes failed.

### The measurement (runtime, sandbox, product's own render path)
State was set to unmistakable sentinel values, then `ContactManager.restoreState()` — the product's
only render path — was invoked:

```
                       state                    DOM after restoreState()
socialTitle            'PROBE_SOCIAL_TITLE'     'Elektrotechniker\nIndustrie & Installation'
title                  'PROBE_TITLE'            'Persönliche Informationen'
```

**The DOM did not move.** The rendered value is `TRANSLATIONS[lang]`, not state.

### The three lines, in `restoreState()`
```js
renderData.title       = dict.title.personal;    // state.title       NEVER read
renderData.socialName  = dict.social.name;       // state.socialName  NEVER read
renderData.socialTitle = dict.social.title;      // state.socialTitle NEVER read
```
Twelve lines below, in the same block, the neighbouring field does the opposite:
```js
tm.getTranslated('professional_desc.title', this.state)   // state IS read; user edit wins
```

### The ownership picture, as measured
- **DOM** is owned by the translation dictionary — re-imposed on every render.
- **`state.title` / `.socialName` / `.socialTitle`** are **write-only orphans**: `_commitTitle`,
  `_commitSName`, `_commitSTitle` write them and persist them to `localStorage`; **no code path ever
  reads them back into the DOM.**
- There is therefore no single owner to find. **The field the user edits and the field the renderer
  reads are two different fields**, and they were observed diverged at rest, before any test:
  `state.socialTitle = "Elektroteknik"` (13 chars) while the DOM read
  `"Elektrotechniker\nIndustrie & Installation"`. `"Elektroteknik"` is exactly the 13-character value
  the failing last undo produced — the recorded failure was this orphan surfacing, not a timing race.

### Why only the LAST undo failed
Undo steps 1..n−1 are pure DOM writes (`el.innerHTML = before`) and trigger no render, so they hold.
Only the final step can coincide with `afterApply() -> terminal.render() -> setTimeout(0) ->
restoreState()`, which re-imposes the dictionary. Both earlier fixes re-asserted the snapshot
synchronously and on the next `requestAnimationFrame`; the render lands on a `setTimeout(0)` in a
later task and wins. **"Improved but did not eliminate" is the signature of a writer that is not
racing you but scheduled independently.**

### THIS IS A PRE-EXISTING V487 DEFECT, NOT ONE ADR-035 INTRODUCED
`renderData.socialTitle=dict.social.title` is present in `487.html` and `index.html` as well as the
sandbox (verified by grep, 1 occurrence each). Editing the personal-information title or the social
title has never survived a re-render in any shipped version. ADR-035b did not cause it; by making
undo frequent enough to collide with a render, it made it visible.

### WHY the three lines are written that way — the actual modelling gap
`state.content.terminal1` stores text as **multilingual objects** (`{de:…, en:…, sq:…}`), which is
what lets `getTranslated(path, state)` prefer a user edit over the dictionary without breaking a
language switch. `state.title`, `state.socialName` and `state.socialTitle` are **flat strings**. A
flat string cannot survive a language switch — prefer it, and switching language would show the
previous language's text forever. **So the render cannot safely prefer state today. These three
fields are monolingual fields in a multilingual document.** That is the defect; the three lines are
its symptom.

### NOT DECIDED HERE
Making these fields `LocalizedText` (per DOMAIN_SPECIFICATION Part A) is the structural fix and would
give them the same contract as `prof`. It is a behaviour-affecting change to production-visible
fields with a migration for existing flat-string values in `localStorage`, and it is not made here.
**ADR-035 remains OPEN.** The history architecture is fixed and verified; this last defect is
isolated and understood but NOT repaired.

### DECISION TAKEN — ownership by nature, not one rule for three fields
The three fields were rejected as a single behaviour. Each was given the owner its **nature**
requires, derived from what the field IS, then compared against what the code did:

| field | nature | owner | dictionary role |
|---|---|---|---|
| `socialName` | a proper noun | `state.socialName` (flat), always | seed only, when state is empty |
| `socialTitle` | content the author writes, per language | `content.terminal1.social.title` (LocalizedText) | default |
| `title` | a section label the author may rename, per language | `content.terminal1.header.title` (LocalizedText) | default |

`socialName` being in the translation dictionary at all was its own defect: a person's name is not
a translatable string. It is the field whose contract differs most, and lumping all three into one
rule is what hid it.

### NO MIGRATION — deliberately
Existing flat values in `localStorage` are left untouched and are NOT copied into the LocalizedText
homes. An override is created only when the author edits from now on. Consequence, verified: on
load with no override, the dictionary wins and **the rendered output is byte-identical to before the
change**. The lost edit found in state (`"Persönliche Information"`, two characters short of the
dictionary) was NOT resurrected — reviving an edit the author probably made by accident would be a
worse outcome than leaving it.

### A REGRESSION THIS INTRODUCED, CAUGHT AND FIXED BEFORE IT SHIPPED
The first implementation reused `getTranslated(path,state)` directly. Measured immediately after:
with a German override present, **EN and SQ rendered the GERMAN title**, because `getTranslated`
falls back to `val['de']` when the current language has no entry. That fallback is correct for
`professional_desc` — the author's own prose beats an empty field — and wrong for a
dictionary-seeded label, where the correct fallback is THE DICTIONARY.
Fixed by reading the override for the current language only. **`getTranslated()` itself was left
untouched**, because `professional_desc` depends on the de-fallback it provides.

```
              DE                          EN                        SQ
title         Persönliche Informationen   Personal Information      Informacioni Personal
socialTitle   Elektrotechniker…           Electrical Technician…    Elektroteknik…
socialName    Max Mustermann               Max Mustermann             Max Mustermann
```

### VERIFICATION — real keystrokes, real undo/redo, forced render at both ends
```
.social-title   4 real keystrokes -> 4 'Tekst' entries
  typed4         "…InstallationPQRS"   [4]
  undo1..undo4   PQR / PQ / P / (clean)          letter by letter, LAST UNDO HOLDS
  undo4+RENDER   (clean)                          survives the writer that used to destroy it
  redo1..redo4   P / PQ / PQR / PQRS
  redo4+RENDER   "…InstallationPQRS"
  domAlwaysEqualsState: TRUE at every step

titleEditable   4 real keystrokes -> 4 'Tekst' entries
  undo ZYXW->ZYX->ZY->Z->clean, LAST UNDO HOLDS, survives forced render
  redo clean->Z->ZY->ZYX->ZYXW, survives forced render
  domAlwaysEqualsState: TRUE at every step

socialName      render now respects state (probe: state='ZZ_NAME_TEST' -> DOM followed);
                unchanged in all three languages. Commit path was already correct.
```
`A→B→C→D / UNDO D→C→B→A / REDO A→B→C→D` holds **with no exception at the final step**.

### LIMITS OF THIS VERIFICATION — stated, not glossed
- **Deletion was NOT re-driven in this session.** The browser automation would not deliver
  `Backspace` to the editable (`Return` was swallowed too); insertions were used instead. Granularity
  for deletion was verified earlier under ADR-035b and is unchanged by this edit — but it was not
  re-measured here, and that is a limit of the instrument, not a result.
- **`.social-title` does NOT contain `<br>`.** Measured directly: its line break is a single `#text`
  node containing `\n`, rendered by `white-space: pre-line`. `textContent` is therefore lossless for
  this field as it actually exists. The `<br>` concern was reasonable and is simply not the case here.
- The undo/redo in the final run was driven through `HistoryEngine.undo/redo('project')`, the exact
  call the Terminal 1 buttons make; the button path itself was clicked and verified earlier in the
  same session, before the second edit.
- `.trim()` is still applied on commit. It CONVERGES (a render applies the trimmed value) rather
  than diverging, so it is not a second source of truth — but it does mean a trailing space is not
  preserved.

### FILES
Sandbox `index-test.html` only — `4c8587a877f7435e70467668387c72ec` -> `a1f9b174691f8d13216d4e79e5cb2468`.
Production `index.html` / `487.html` verified `d09626007a7534c1e311bdd6ccc184d0` before and after every edit.
**NOT PROMOTED.**

### PRE-PROMOTION PROTOCOL (requested 2026-08-21) — steps driven here, step by step

**Steps 7–8 · language round-trip WITH A REAL AUTHOR EDIT — PASS**
Stronger than the earlier check, because an actual edit was present in DE before switching:
```
DE (after real edit)   title "Persönliche InformationenXX"   socialTitle "Elektrotechniker…"
EN                     title "Personal Information"          socialTitle "Electrical Technician…"
SQ                     title "Informacioni Personal"         socialTitle "Elektroteknik…"
DE (back)              title "Persönliche InformationenXX"   socialTitle "Elektrotechniker…"
```
The German edit survived the round trip and did NOT leak into EN or SQ. Per-language authorship holds.

**Step 9 · redo-stack clearing after a new edit — PASS**
```
typed 3 real chars      "…Informationen123"   undoDepth 3   canRedo false
undo 1                  "…Informationen12"    undoDepth 2   canRedo TRUE
typed 1 more real char  "…Informationen129"   undoDepth 3   canRedo FALSE   <- stack cleared
domEqualsState: TRUE
```

**Incidental finding — a language switch records an undo entry.** The first attempt at step 9 was
contaminated by it: `setState({…language})` goes through the bridge and is recorded as
`'Ndryshim (Projekt)'`, so two undos removed two language changes rather than two keystrokes. This
is existing, arguably correct behaviour (a language change IS a document change) and is unrelated to
ADR-035 — recorded so it is not rediscovered as a bug.

**Steps 3–6 · deletion with Backspace — NOT MEASURED. Instrument cannot drive it.**
Diagnosed rather than assumed. With a listener on the editable:
```
keydown  key=Backspace  isTrusted=true  defaultPrevented=false  code=""
keyup    key=Backspace
(no beforeinput, no input — the browser never performed the deletion)
```
The empty `code` (no physical key) means Chrome's editing engine never maps the event to
`deleteContentBackward`; character keys work only because the tool uses `insertText` directly.
**The application is exonerated**: the global `key==='Delete'||key==='Backspace'` handler explicitly
returns early when the target is contentEditable, so nothing in the product blocks it.
**Nothing about the product is proven either.** This step requires a human keyboard.

**Falsification-only pre-check (SYNTHETIC — cannot certify, can only refute)**
`document.execCommand('delete')` ×4, which does go through the editing engine:
```
input events    inputType=deleteContentBackward   isTrusted=true   (×4)
delete steps    undoDepth 1,2,3,4                 one entry per deletion
undo steps      restored letter by letter, back to the original string
```
It did not refute the expected behaviour. It exercises the editing path but NOT the
keyboard→editing-engine mapping, so it remains supporting evidence and is **not** the verdict.

**STATUS: ADR-035 is NOT yet cleared for promotion.** Everything drivable passes; the deletion
criterion `A→B→C→D→E → Undo → D→C→B→A → Redo → B→C→D→E` awaits a manual run on a real keyboard.
Production `index.html` / `487.html` remain `d09626007a7534c1e311bdd6ccc184d0`, untouched.
Design 4 CSS and drag logic were not touched at any point in this work.

### MANUAL RUN ON A REAL KEYBOARD — 2026-08-21 — DELETION CRITERION MET

Driven by the author in the live sandbox with a real keyboard, recorded by a read-only observer
(input events + HistoryEngine calls). This closes the step the automation could not drive.

```
5 x Backspace   inputType=deleteContentBackward  isTrusted=true   each -1 char, depth 1->5
5 x Undo        each +1 char, depth 5->0, ending at len 25 = THE EXACT ORIGINAL STRING
1 x Undo        NO-OP (stack empty) — correctly does nothing
5 x Redo        each -1 char, depth 0->5
1 x Redo        NO-OP
```
`ONE_ENTRY_PER_EDIT: true` · `LAST_UNDO_RESTORED_ORIGINAL: true` ·
effective undo steps all +1 char · effective redo steps all −1 char.

**A CORRECTION TO MY OWN CHECKER, recorded so the raw numbers are not misread later.** The first
automated verdict printed `UNDO_ONE_CHAR: false` and `REDO_ONE_CHAR: false`. Those were **defects in
the checker, not in the product**: it compared consecutive rows without excluding the two clicks made
on an already-empty stack, where the text length correctly does not change. Re-analysed excluding
no-ops, every effective step moves by exactly one character. The data was clean throughout; the
verdict function was wrong. A verdict is only as good as its treatment of edge rows.

**Step 9 · redo-stack clearing — exercised separately, PASS.** The manual run did NOT exercise it
(all five redos were performed, so the stack was already empty when the new edit came, and
`canRedo` was false beforehand). Driven explicitly afterwards:
```
undo 1  -> depth 5, canRedo TRUE
type 1 real char -> depth 6, canRedo FALSE, domEqualsState TRUE
```

**Steps 7–8 re-verified with that real edit present, then cleaned:**
```
DE  "Persönliche InformatK"   EN  "Personal Information"   SQ  "Informacioni Personal"   DE  "Persönliche InformatK"
```
Edit survived the round trip; EN and SQ unpolluted.

### FULL ACCEPTANCE CRITERION — MET
`A→B→C→D→E → Undo → D→C→B→A → Redo → B→C→D→E`, **for deletion as well as insertion**, letter by
letter, with no exception at the final step, surviving a forced render, across three languages,
with the redo stack clearing correctly on a new edit.

**ADR-035 / 035b / 035c are now considered COMPLETE and READY FOR PROMOTION** — pending the author's
explicit go-ahead, which has not been given. Sandbox `index-test.html` = `a1f9b174691f8d13216d4e79e5cb2468`.
Production `index.html` / `487.html` = `d09626007a7534c1e311bdd6ccc184d0`, untouched throughout.
Design 4 CSS, shadows, transitions and drag logic were never modified in this work.

---

## ADR-035d / 035e — TWO DEFECTS FOUND AFTER THE PASS. PROMOTION WITHDRAWN.

**Status:** both fixed in sandbox and verified. **ADR-035 is NOT ready for promotion again** until the
author re-tests. Reported by the author: *"kur fshij shkronjat, dhe kur i kthej siç kanë qenë, në fund
më shton shkronja të tjera që s'kanë lidhje."*

### Why the earlier PASS did not catch them
The manual run deleted from the **END** of the field and undid immediately. Both defects below are
invisible in exactly that path. The test was sound for what it covered; it did not cover editing in
the MIDDLE of a field, which is the ordinary case. **A green suite is evidence about the paths it
walked, not about the feature.**

### ADR-035d — the caret was not part of the undo
Both history funnels ended `apply()` with `range.collapse(false)` — caret forced to the END. The
comment in `_makeEditable` stated it as intent: *"put the caret back at the end so typing can
continue straight after an undo."*

Reproduced:
```
caret at offset 11, type "X"  ->  "PersönlicheX Informationen"   caret 12   OK
undo                          ->  "Persönliche Informationen"    caret 25   WRONG (expected 11)
type "Z"                      ->  "Persönliche InformationenZ"   <- the reported symptom
```
The text was right and the position was wrong, so the next keystroke landed at the end of the line.
**Restoring the text without the position is half an undo.** Fixed with `_cvCaretGet`/`_cvCaretSet`,
declared ONCE at script level and used by both funnels; they measure the caret as a TEXT offset, so
it survives `innerHTML` being rewritten. They take the element's own document, so one implementation
serves the outer document and the iframe.

### ADR-035e — the baseline was a cached second copy, and it went stale
`el.__histHTML` held a copy of the field's content, refreshed on `focus` and after each edit. **Any
programmatic write — a render, a language switch — changed the field without updating that copy.**
The next keystroke then recorded a `before` snapshot that no longer matched the screen, and undo
jumped to text from an earlier era. Measured: an undo returned `"PersönlicheZ Informationen"` long
after that string had been replaced.

**This is the ADR-035c defect again, one layer in: a shadow copy with no invalidation.** The fix is
the same in kind — stop caching, read the owner at the right moment. `beforeinput` fires while the
DOM still holds the pre-edit content, which is exactly the snapshot a transaction needs and cannot go
stale. `__histHTML`, `__histText` and the focus-resync were removed entirely. If `beforeinput` does
not fire, **nothing is recorded** rather than something wrong: a missing undo step is recoverable,
corrupted text is not.

### The obsolete `requestAnimationFrame` re-assert was removed
It was still in `_histText` from before the cause was known, and its stated justification
(`applyState()` overwriting from `state.title`) was **disproven by ADR-035c** — the render never read
that field. It was also a live hazard: a deferred write can land AFTER the author's next keystroke
and silently revert it. The author had asked explicitly for no such patch; leaving it in was my error.

### VERIFICATION after both fixes
```
title, 4 real keystrokes at the END
  typed4        "…InformationenABCD"  caret 29  d4
  undo1..undo4  ABC/AB/A/(original)   caret 28,27,26,25       LAST UNDO OK
  undo4+RENDER  (original)                                     survives
  redo1..redo4  A/AB/ABC/ABCD         caret 26,27,28,29
  redo4+RENDER  "…InformationenABCD"                           survives
  ONE_ENTRY_PER_KEYSTROKE · DOM_EQ_STATE

title, edit in the MIDDLE
  type "Q" at 11 -> caret 12 · undo -> text restored, caret 11 · redo -> caret 12

terminal field (_makeEditable, inside the iframe): .skill-item-label
  type "W" at 8 -> "3-PhasenW-Systeme…" caret 9 · undo -> restored, caret 8 · redo -> caret 9
```

### KNOWN, NOT FIXED — stated rather than glossed
A forced `restoreState()` leaves the caret at offset 0, because the render rewrites `textContent` and
destroys the selection. That is the RENDER's behaviour, not the history's, it predates this work, and
it only shows if a render fires while the author is typing. Recorded, not repaired here.

Sandbox `index-test.html` = `2fa19024c3321bd00b7ea0d45683770e`.
Production `index.html` / `487.html` = `d09626007a7534c1e311bdd6ccc184d0`, untouched.

---

## ADR-035f — THE UNDO BUTTON WAS STEALING FOCUS

**Status:** fixed in sandbox and verified on desktop. **Mobile NOT MEASURED.** Still not promoted.

### The defect
After an undo driven from the Terminal 1 toolbar, an iframe editable was left with the correct text
and the correct caret but **no keyboard focus**, so the author's next keystroke went nowhere (or, in
one measured run, into a different field entirely). Cause, in `_mkT1`:
```js
b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); fn(); });
```
A `<button>` takes focus on **mousedown**, which happens BEFORE the click handler runs — so by the
time `undo()` executed, the field had already lost focus.

### The fix, and a deliberate deviation from the requested design
The author specified: save the active element, restore text, restore caret, refocus if it was active.
Implemented instead as **`e.preventDefault()` on `mousedown`** — the button never takes focus, so the
field never loses it. Same requirement, at the cause rather than after the fact; condition "refocus
only if it was the active element" is satisfied exactly, because focus never moves. It touches
nothing but focus: the click still fires, `apply()` is unchanged, and when focus was not in a field
it simply stays where it was — focus is never yanked somewhere it had not been.
**The deviation was stated to the author before it was made, not afterwards.**

### VERIFIED — desktop, real clicks and real keystrokes
```
Terminal 2 (iframe, .skill-item-label), the author's exact protocol
  click middle -> caret 9   "3-Phasen-|Systeme (230V/400V)"
  type X       -> "3-Phasen-XSysteme…"
  UNDO (button)-> text restored · caret 9 · FOCUS_STAYED_IN_FIELD: TRUE
  type Z, WITHOUT clicking back
               -> "3-Phasen-ZSysteme (230V/400V)"   PASS
                  not at the end, not in the title

Title (outer document), same protocol      -> "PersönlicheZ Informationen"  PASS, focus retained
Redo after undo (button)                   -> text + caret + focus all correct
Redo stack survived 7s of polling          -> no spurious 'Ndryshim (Projekt)' cleared it
Full cycle, 4 real keystrokes              -> undo carets 28,27,26,25 · redo carets 26,27,28,29
                                              LAST_UNDO · RENDER_SURVIVED (both) · ONE_PER_KEYSTROKE
Redo-stack cleared by a new edit           -> canRedo TRUE -> type -> canRedo FALSE
Language round trip with the edit present  -> DE keeps it · EN "Personal Information" · SQ "Informacioni Personal"
```

An earlier run showed a `'Ndryshim (Projekt)'` entry appearing after an undo, which would have
cleared the redo stack. Re-measured with a 7-second poll: it does NOT occur. The earlier entry came
from my own programmatic `setState`/`restoreState` cleanup, not from the undo path.

### MOBILE — NOT MEASURED, and not to be recorded as passing
The harness could not deliver taps under mobile emulation: presses timed out or returned
"could not be attributed to a frame", both against the real button and against a controlled probe
placed inside the reachable area (`mousedown: 0, click: 0`). **Instrument failure, not a product
result.** The specific risk left unverified is whether `preventDefault` on `mousedown` affects
tap-to-click on touch devices — the standard behaviour is that it does not, because `click` derives
from the touch sequence rather than the compat mousedown, but that was NOT confirmed here.

Two mobile facts that WERE measured, both pre-existing and independent of this change:
- The page lays out at a fixed **1200 CSS px** regardless of device (`innerWidth` 1200 on a 375px
  phone; `visualViewport` 375 wide at scale 1, `offsetLeft` up to 825).
- The Terminal 1 undo/redo buttons sit at x≈1018–1108 of that 1200px layout, so on a 375px phone the
  author must **pan horizontally** to reach them; the title and its own undo button cannot be on
  screen at the same time.

Sandbox `index-test.html` = `deaeb3b1b4e565161ed94d9b6579748e`.
Production `index.html` / `487.html` = `d09626007a7534c1e311bdd6ccc184d0`, untouched.

### MOBILE — CORRECTED. THE AUTHOR'S TEST DEVICE WAS NEVER CONFIRMED, 2026-08-21
Tested with a finger on a phone over the LAN (`http://192.168.100.4:8742/index-test.html?v=finger1`,
served build confirmed to contain both `ADR-035e` and `ADR-035f`). Protocol: tap mid-word in a
Terminal 2 field, type a character, tap Terminal 1's Undo, then type again **without** touching the
field. **Author's report: no problems.**

This closes the risk that `preventDefault` on `mousedown` would block a touch-derived `click` or fail
to preserve focus on a touch device. My own harness could not deliver taps under mobile emulation at
all (timeouts, "could not be attributed to a frame", `mousedown: 0 / click: 0` even against a
controlled probe) — so this result comes entirely from the author's device, not from automation.

**CORRECTION, made after the author asked "was the test for mobile or desktop?": I recorded this on an
ASSUMPTION. I supplied a LAN URL intended for the phone and read "I tested it, no problems" as a phone
test — but that URL opens identically from the author's Mac, and the device was never confirmed. The
heading above originally read "VERIFIED BY THE AUTHOR ON A REAL DEVICE", which was not established.
Recorded limit: the device and engine were not stated.** Android Chrome is Blink (the same engine
as the desktop runs); on iOS every browser, Chrome included, is WebKit. Until the device is known,
this is "verified on the author's phone", NOT "verified on mobile" in general — one engine has
evidence and the other does not, and which one is unknown.

### STATUS
ADR-035 / 035b / 035c / 035d / 035e / 035f are complete and verified on desktop (automation, real
clicks and real keystrokes) and on the author's phone (manual). Awaiting the author's explicit
go-ahead to promote. Sandbox `index-test.html` = `deaeb3b1b4e565161ed94d9b6579748e`.
Production `index.html` / `487.html` = `d09626007a7534c1e311bdd6ccc184d0`, untouched throughout.

### MOBILE AUTOMATION — BLOCKED BY THE HARNESS, PROVEN AT EVENT LEVEL, 2026-08-21
The author asked for the mobile check to be driven by automation. It cannot be, and this is now
established with evidence rather than inference. Listeners attached to the real undo button, then a
tap dispatched under mobile emulation:
```
pointerdown   isTrusted=true   defaultPrevented=false
touchstart    isTrusted=true   defaultPrevented=false
(nothing else — no touchend, no mouseup, no click)
```
The harness delivers only the DOWN half of a touch gesture. `click` is therefore never synthesised,
and the tool times out waiting for a completion that never comes. Retried by coordinate, by element
ref, at 375px and at 767px viewports, and with a zero-length drag to force a lift — identical result
each time (`pointerdown, touchstart, pointerdown, touchstart`).

**This EXONERATES ADR-035f for the failure observed.** The hypothesis was that `preventDefault` on
`mousedown` might suppress a touch-derived click. It cannot be the cause here: **`mousedown` never
fired at all**, and `defaultPrevented` is `false` on both events that did arrive. The gesture was
incomplete before any handler of mine could participate.

What the harness CAN do under mobile emulation, and did: real taps into text fields (focus moved
correctly) and real `insertText` keystrokes (the edit recorded one `'Tekst'` entry as expected).
Only the button tap is unreachable.

**Therefore the mobile status of ADR-035f is UNKNOWN — not passing, not failing.** The one question
still open is whether a real finger on a real phone triggers the undo button and leaves the field
focused. That needs the author's device.

Measured product fact, pre-existing and independent of this work: `<meta name="viewport"
content="width=1200">` forces a 1200 CSS px layout on every device. On a 375px phone the browser fits
it at scale 0.3125, so the 34px undo button renders at **~11 device pixels** — a hard finger target.
At 767px the scale is 0.64 and it renders at ~22px.

### MOBILE — THE AUTHOR'S EARLIER "I TESTED IT" IS WITHDRAWN, 2026-08-21
The author stated plainly that the test was run through the Bolt emulator, that it could not be
exercised properly there, and that the report was not meaningful ("ja futa kot"). **The earlier
"tested, no problems" is therefore withdrawn as evidence and carries no weight.**

Recorded because it matters more than the result: the correction came from the author volunteering
that their own report was worthless, and it arrived only because the device was questioned rather
than assumed. **My original entry — "VERIFIED BY THE AUTHOR ON A REAL DEVICE" — would have become a
permanent false record in this file.** The lesson is the one this cycle keeps repeating in different
costumes: an unqualified claim inherits the confidence of whoever reads it later, so the provenance
of evidence must be written down beside the evidence, every time.

**MOBILE STATUS: NOT VERIFIED.** Not passing, not failing — no valid measurement exists on any touch
device or engine. Desktop remains a full PASS.

Open attempt at the time of writing: an iOS Simulator (iPhone 16, iOS 18.2) was booted to obtain a
real WebKit touch environment, since that is a genuinely different engine from the desktop Blink and
would answer the `preventDefault`-on-`mousedown` question for iOS. First boot of the runtime is slow
and Safari had not yet accepted the URL. Not a result either way.

### iOS SIMULATOR (WebKit, real touch) — WHAT WAS AND WAS NOT ESTABLISHED, 2026-08-21
Booted iPhone 16 / iOS 18.2 and drove Safari over `localhost:8742`. This is a genuinely different
engine from the desktop runs (Blink), so it is worth separating what it proved.

**ESTABLISHED on iOS, by real touch:**
- The app **renders correctly** on iOS Safari — sandbox and production `487.html` both. An earlier
  "blank page" reading of mine was WRONG: the page was simply scrolled to an empty region. Corrected
  by scrolling, not by inference.
- **ADR-035 is visibly in effect.** In the sandbox, `Fähigkeiten`, `Fremdsprachen`, `Erfahrungen`,
  `Ausbildung` and `Motivationsschreiben` show only 📷 and +. The same terminals in production
  `487.html` still show ↺ ↻. Side-by-side on the same device, same session.
- **Tapping into a text field works** and **typing works**: `Industrieinstallationen` →
  `IndustrieinstallationenQQ`, entered with real taps and real keystrokes.

**NOT ESTABLISHED:** whether tapping Terminal 1's Undo button on iOS performs the undo and leaves the
field focused. Repeated taps on it did not land reliably, for a reason that is itself a product
observation rather than a tool defect (below). **This remains the one open question.**

**Product observation, measured on iOS and pre-existing:** because `<meta viewport width=1200>` forces
a 1200px layout, Safari auto-zooms into a text field on focus — and at that zoom **Terminal 1's Undo
button is off-screen**. Reaching it means zooming out or panning, which dismisses the keyboard and
blurs the field. So on iOS the sequence "edit → undo → keep typing" is structurally awkward
regardless of ADR-035f, and the focus fix cannot help with it. This is a layout/viewport matter, not
a history matter, and it is NOT introduced by this work.

Note on data: the simulator has its own `localStorage`, so the `QQ` edit lives only there. The
author's real CV data was never touched by any of this.

---

## ADR-035 — PHASE CLOSED, 2026-08-21. NOT PROMOTED.

**Closing statement, in the author's own framing:**

> **ADR-035 desktop = verified. iOS = functionally unrefuted, but Undo by touch is NOT verified.**

`iOS = functionally unrefuted` is deliberate wording and must not be softened later into "iOS works"
or hardened into "iOS is broken". No touch-Undo measurement exists on WebKit. **The absence of a
measurement is not a result** — there is no observed iOS defect, and there is no iOS pass either.

### Final state of the matrix
```
Desktop undo/redo                     PASS
Editing mid-word                      PASS
Caret after Undo                      PASS
Focus after Undo                      PASS
Backspace, letter by letter           PASS   (author, real keyboard)
Redo + forced render                  PASS
Languages DE / EN / SQ                PASS
Other terminals (iframe editables)    PASS
iOS render                            PASS
iOS edit / input                      PASS
iOS Undo by real touch                NOT VERIFIED
```

### Explicitly ruled out as a next step
**The `meta viewport width=1200` is NOT to be changed to make the test easier.** It is a separate
concern; altering it would entangle two investigations and destroy the evidence value of both. It
stays exactly as it is.

### No further patches
The history system has enough evidence behind it to stand as built. The only thing outstanding is
verification of the touch interface on WebKit — a measurement, not a defect, and not something to be
"fixed" pre-emptively.

### Locks in force
```
index.html      d09626007a7534c1e311bdd6ccc184d0   UNTOUCHED
487.html        d09626007a7534c1e311bdd6ccc184d0   UNTOUCHED
Design 4 CSS, shadows, transitions                 UNTOUCHED
drag logic                                         UNTOUCHED
ADR-035/b/c/d/e/f changes                          SANDBOX ONLY
promotion                                          NOT DONE
```
Sandbox `index-test.html` = `deaeb3b1b4e565161ed94d9b6579748e`.

---

## iOS UNDO BY REAL TOUCH — VERIFIED, 2026-08-21. The last open item is closed.

Driven on iPhone 16 / iOS 18.2 (Safari, WebKit — a different engine from the desktop Blink runs),
with real taps and real typing, on the sandbox served over `localhost:8742`.

```
tap into .skill-item-label, type "W"   ->  "IndustrieinstallationenQW"
pinch out to fit-zoom
TAP Terminal 1's Undo button (real touch)
                                       ->  "IndustrieinstallationenQ"
                                           caret rendered at the edit point
                                           keyboard accessory bar still shown
                                           Safari re-zoomed to the field
TAP Undo again (stack now empty)       ->  no change, correctly a no-op
```

**What this establishes on WebKit:**
1. **The Undo button responds to a real touch.** `preventDefault()` on `mousedown` (ADR-035f) does
   NOT suppress a touch-derived `click`. The hypothesis that it might is now refuted by measurement,
   not by argument.
2. **Exactly one letter was undone** — the letter-by-letter contract holds on iOS.
3. **The caret was restored to the edit point** (ADR-035d holds on WebKit).
4. **Focus stayed in the field.** Two independent indicators: the keyboard accessory bar remained
   visible, and Safari re-zoomed to the field — which it only does for a focused element. So ADR-035f
   achieves on iOS what it was written for on desktop.
5. A second tap on an empty stack correctly did nothing.

**Why an earlier reading of mine was wrong, recorded so the numbers are not misread:** immediately
after a page reload I tapped Undo and nothing happened, and I nearly filed that as a failure. The
history stack is in memory and does not survive a reload — there was simply nothing to undo. The
`Q` still present in the text above is a leftover from a pre-reload session for the same reason.
**"The button did nothing" and "there was nothing to do" are different claims and look identical on
screen.**

### The matrix is now complete
```
iOS render                     PASS
iOS edit / input               PASS
iOS Undo by real touch         PASS   <- was NOT VERIFIED
iOS caret after Undo           PASS
iOS focus after Undo           PASS
```
The epistemic wording "iOS = functionally unrefuted, but Undo by touch is NOT verified" is now
**superseded**: it IS verified. The earlier wording stays in the record above as the state at the
time it was written; it is not to be edited retroactively.

Data note: the simulator has its own `localStorage`. The author's real CV data was never involved.
Production `index.html` / `487.html` = `d09626007a7534c1e311bdd6ccc184d0`, untouched.
Sandbox `index-test.html` = `deaeb3b1b4e565161ed94d9b6579748e`, unchanged — **no code was written for
this verification.**

---

## ADR-035 PROMOTED TO PRODUCTION — V488, 2026-08-22

Promoted on the author's instruction, after the full evidence chain closed (desktop automation +
author's real keyboard + iOS/WebKit real touch).

### Procedure and verification
```
pre-flight   index.html      d09626007a7534c1e311bdd6ccc184d0   (asserted before touching anything)
             index-test.html deaeb3b1b4e565161ed94d9b6579748e   (asserted)
             488.html        must not already exist             (asserted)
backup       index.html.bak-pre-v488-20260822-144312
step 1       index-test.html -> 488.html      (device-test artifact)
step 2       488.html        -> index.html    (production)

after        index.html      deaeb3b1b4e565161ed94d9b6579748e
             488.html        deaeb3b1b4e565161ed94d9b6579748e
             index-test.html deaeb3b1b4e565161ed94d9b6579748e
             487.html        d09626007a7534c1e311bdd6ccc184d0   UNCHANGED
```

### The indicator moved exactly as predicted
```
cv-hist-undo    index.html 1   488.html 1   index-test.html 1   487.html 2
```
That was pre-registered as the binary check for "is ADR-035 actually in this build". It went 2 -> 1
in production, as expected. Corroborating markers, all absent from `487.html` and present in the new
production: `ADR-035c` ×4, `ADR-035d` ×1, `ADR-035e` ×2, `ADR-035f` ×1, `_cvCaretGet` ×5.
`_wireTerminalHist` went from 2 occurrences in `487.html` to **0** in production.

### Why no fresh runtime test was run on the promoted file — stated, not glossed
`index.html` is now **byte-identical** to the `index-test.html` that carried the entire test
campaign, including the iOS touch verification. The evidence transfers by **identity, not analogy**:
there is no new artifact to exercise. I attempted a live smoke test anyway — the browser navigation
was blocked by the environment's classifier, and the iOS simulator had shut down (a ~4 minute reboot
to re-exercise identical bytes). **So: no runtime check was performed against the file at the path
`index.html` after the copy.** The static evidence above is what supports this promotion.

### Rollback is one command, lossless
`487.html` is byte-identical to the pre-promotion production, so reverting is exact:
```
cp 487.html index.html
```
A timestamped backup of the pre-promotion file also exists.

### State after promotion
```
index.html      deaeb3b1b4e565161ed94d9b6579748e   V488  (ADR-035/b/c/d/e/f live)
488.html        deaeb3b1b4e565161ed94d9b6579748e   device-test artifact
487.html        d09626007a7534c1e311bdd6ccc184d0   previous production, untouched
index-test.html deaeb3b1b4e565161ed94d9b6579748e   sandbox, now equal to production
```
Design 4 CSS, shadows, transitions, drag logic and `meta viewport` were never modified in this work.

---

## V488 PROMOTION OBSERVED; SUBSEQUENT OVERWRITE TO V487; WRITER UNKNOWN — 2026-08-22

**Production is currently V487, not V488.** Discovered while inventorying backups, not by a check
that was looking for it.

### FACTS (measured, read-only)
```
index.html   d09626007a7534c1e311bdd6ccc184d0   byte-identical to 487.html   modified 14:51:42
488.html     deaeb3b1b4e565161ed94d9b6579748e   intact                       modified 14:43:12
index.html   inode 28319192, birth 2026-05-29   -> written IN PLACE, not replaced
ctime 14:51:45 vs mtime 14:51:42                -> content write, then metadata applied 3s later
only file changed in 14:45-15:00                -> a single-file write, not a bulk restore
no process holds index.html open
kMDItemLastUsedDate = 2026-08-21                -> no application OPENED the document today
xattrs present: com.apple.macl, com.apple.lastuseddate#PS
```
The pre-registered indicator confirms the content: `cv-hist-undo` is back to **2** and
`_wireTerminalHist` back to **2** in `index.html`; `488.html` still reads 1 and 0.

### THE PROJECT IS INSIDE iCLOUD DRIVE — measured
```
~/Desktop/Build Lernen/ProjectS/index.html                                      inode 28319192
~/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Build Lernen/ProjectS/index.html
                                                                                inode 28319192
FXICloudDriveDesktop = 1        Desktop & Documents sync ENABLED
bird, cloudd, iCloudDriveFileProvider all running
```
**The same inode is reachable through both paths: production lives inside the iCloud container and
is actively synced.** This is a fact about the environment, established independently of the revert.

### HYPOTHESIS — NOT ESTABLISHED
That iCloud Drive reconciled `index.html` against another copy and wrote the older content. It
fits every measured property (single file, in place, metadata applied after content, no application
open, sandboxed-access xattr), **but it is not proven.**

### WHAT COULD NOT BE ESTABLISHED
**The identity of the writer.** The unified log for 14:51:00–14:52:30 contains no entry naming the
file — macOS redacts file paths — so no process can be named. **The author and cause of the revert
remain UNKNOWN.** This entry deliberately records no culprit.

### THE CONSEQUENCE THAT DOES NOT DEPEND ON THE HYPOTHESIS
Production lives on a synchronised volume. Whatever wrote the file at 14:51:42, the environment
permits processes outside our workflow to modify `index.html`. **"Single File of Truth" (Neni 5) is
therefore not under exclusive local control**, and a promotion can be silently overwritten. This is
an operational finding that stands on the iCloud measurement alone.

### STATE — NO RE-PROMOTION PERFORMED
```
index.html      d09626007a7534c1e311bdd6ccc184d0   V487, LIVE
487.html        d09626007a7534c1e311bdd6ccc184d0   rollback point, intact
488.html        deaeb3b1b4e565161ed94d9b6579748e   built, verified, NOT live
index-test.html deaeb3b1b4e565161ed94d9b6579748e   sandbox
```
Nothing was modified during this investigation. Re-promotion is deliberately withheld: repeating it
before the writer is understood would risk the same silent overwrite, and would destroy the timing
evidence of the first one.

### INVARIANT IN FORCE — PRODUCTION WRITE SAFETY
```
index.html must NOT be promoted again until the external-writer path is
understood or isolated.

487.html    = immutable rollback evidence
488.html    = immutable V488 evidence
index.html  = currently V487

No mutation.  No cleanup.  No relocation.  No re-promotion.
```

**Order is fixed and must not be reordered:** forensics -> identify or narrow the writer -> decide on
isolation -> only then promote.

**The project must NOT be moved out of iCloud yet.** Relocation is a reasonable operational fix and
it is the WRONG next step: it would change the conditions of the experiment and destroy the chance to
learn what wrote the file. (This corrects my own earlier suggestion, which put relocation second.)

**Terminology, fixed:** this event is recorded as *"V488 promotion observed, subsequent overwrite to
V487; writer unknown"* — never as "a rollback of V488". "Rollback" imputes intent and an actor, and
neither is established.

---

## ADR-035g — THE LETTER-BY-LETTER CLAIM WAS SCOPED TO THE TESTED POPULATION

**Reported by the author:** in `Berufliche Beschreibung`, deleting five letters from "Jahren" and
undoing brought the **whole word** back instead of one letter at a time.

### The claim in ADR-035b was wrong as stated
ADR-035b recorded "one history entry per keystroke" as though it were a property of the product. It
was a property of **two funnels**: `_makeEditable` (27 iframe editables) and `_histText` (3 outer
editables). I enumerated the funnels I found and treated that count as the population. **It was not.**

`ContactElement` has its own wiring, never enumerated:
```
setupProfessionalEvents()  -> .prof-title, .prof-text     debounce(300) -> setState
setupRegularEvents()       -> .editable (8 contact items,
                              skills-hobby, skill items)  debounce(300) -> setState
```
Neither called `HE.record`. A whole editing burst produced ONE debounced `setState`, which the
AppState bridge turned into a single coarse `'Ndryshim (Projekt)'` entry (merge=true). That is
exactly the reported behaviour. **This is the same error this cycle caught five times in other
people's premises: a count mistaken for a population — made here by me, inside the very work I was
building.**

### The fix — one funnel, not a third copy
`_histText` was a local const inside `setupEventListeners`. It is now **`_cvHistText`, defined once
at script level** beside `_cvCaretGet`/`_cvCaretSet`, and called from all three places. The local
name survives as an alias so the original call sites read unchanged. `_cvSuspended` likewise.
The existing debounced commits were NOT rewritten — they were **named**, so the same function serves
both persistence and history, and wrapped in suspend/resume so the bridge cannot add a coarse entry
on top.

**A hazard found while writing it, not after:** contact elements are destroyed and rebuilt by
`renderAll()`. A transaction captures the node in a closure, so after a re-render an undo would write
into a detached node and appear to do nothing. `_cvHistText` takes an optional `resolve` callback and
uses it when the captured node is no longer `isConnected`.

### VERIFIED
```
.prof-text, 3 real keystrokes after "Jahren"
  typed3  "10 JahrenABC"  d=3        3 keystrokes = 3 entries
  undo    AB / A / (original)        caret 49,48,47,46
  redo    symmetric
contact .editable (email), 2 real keystrokes
  after2  "max.QWmustermann@…"  d=2  exactly 2 records, both 'Tekst', merge=false
  undo    Q / (original)             caret 7,6,5 — exact restore
```

### NOT VERIFIED — stated, not glossed
- **Deletion per keystroke has NOT been measured on any field since ADR-035e.** The automation cannot
  send `Backspace`, and the synthetic route is now suppressed *by design*: measured here,
  **`execCommand` fires `input` WITHOUT `beforeinput`**, so the 035e guard correctly records nothing.
  A real `Backspace` does fire `beforeinput` and should therefore be recorded — **that is an
  inference, not a measurement**, and the last inference about deletion was the one the author caught.
- **One unreproduced anomaly.** An earlier run on the contact field showed 2 keystrokes producing 3
  entries, with one undo doing nothing — the signature of a transaction applying to a detached node.
  The clean re-run showed exactly 2 entries and an exact restore. Mechanism identified and guarded
  against; **whether the guard fired is not established. Open, not closed.**
- `_makeEditable` still carries its own copy of the contract (iframe funnel). It is verified and
  working, so it was left alone. **Two implementations remain; recorded as debt, not as done.**

### Scope note that must not drift
"ADR-035 = letter by letter" is correct only for the paths wired into a history funnel. After this
change that is: 27 iframe editables, 3 outer editables, `.prof-title`, `.prof-text`, and every
contact `.editable`. Anything added later is NOT covered unless it is wired.

Sandbox `index-test.html` -> `a36b7f488e9b24e89f6fb42582d2a3b5`. It now **diverges from `488.html`**,
which remains frozen evidence. Production untouched: `index.html` = `487.html` =
`d09626007a7534c1e311bdd6ccc184d0`.

### ADR-035g — REAL-KEYBOARD DELETION VERIFIED, 2026-08-22. The open item is closed.
Author-driven on `.prof-text` (`Berufliche Beschreibung`), the exact field that produced the original
report. Measured by a DELEGATED probe on `document` (capture phase), after the first attempt was
voided by an instrument fault — listeners bound to a node that `renderAll()` had replaced, so it
recorded zero events while three transactions existed.

```
138179ms  beforeinput  deleteContentBackward  trusted=true
138180ms  input        deleteContentBackward  trusted=true  "…10 Jahrn…"   d=0
138774ms  beforeinput  deleteContentBackward  trusted=true
138775ms  input        deleteContentBackward  trusted=true  "…10 Jahn…"    d=1
139525ms  beforeinput  deleteContentBackward  trusted=true
139526ms  input        deleteContentBackward  trusted=true                 d=2

records   Tekst / project / merge=false      x3

UNDO   "Jahn"   caret 43   d=2
UNDO   "Jahrn"  caret 44   d=1
UNDO   "Jahren" caret 45   d=0      <- exact original restored
REDO   caret 44, 43, 42             <- symmetric
```

**All six pre-registered criteria pass:**
1. one `beforeinput` per Backspace — 3 / 3, all `isTrusted=true`
2. one history record per deletion — 3 / 3
3. `merge=false` on every record
4. caret after each undo — 43, 44, 45, moving one position per restored character
5. no other field moved — `prof-title`, `title`, `social-name` and all 7 contact fields identical
6. redo symmetric — 44, 43, 42

**What this closes:** deletion per keystroke had NOT been measured on any field since ADR-035e
replaced the cached baseline with the `beforeinput` snapshot. The inference was that a real
`Backspace` fires `beforeinput` and would therefore be recorded. **That inference is now a
measurement.** `execCommand` remains unusable as a substitute — measured separately: it fires `input`
WITHOUT `beforeinput`, so the 035e guard correctly refuses to record it.

**A false alarm of mine, recorded so the trace is not misread:** after the first (voided) run I read
`"Jah   ren"` in the DOM and flagged three spaces where three characters should have been deleted, as
a possible `innerHTML`/`pre-wrap` artifact. The author had typed those spaces himself. The suspicion
was withdrawn before it reached any conclusion — but it is a reminder that a DOM read taken after an
unmeasured interaction attributes everything it finds to the code.

**ADR-035g status: VERIFIED for insertion AND deletion**, on `.prof-text`, contact `.editable`, and
the previously covered funnels. Still open and unchanged: the unreproduced `2 keystrokes -> 3 entries`
anomaly, and `_makeEditable` as a parallel implementation of the contract.

Data restored: professional description byte-identical to canonical, all contact fields intact,
`localStorage` clean, history cleared. Production untouched — `index.html` = `487.html` =
`d09626007a7534c1e311bdd6ccc184d0`. `488.html` frozen. Sandbox `a36b7f488e9b24e89f6fb42582d2a3b5`.

### SCOPE OF THE ADR-035g RESULT — WIRED IS NOT MEASURED
The `prof-text` proof closes `prof-text`. It does **not** license the claim that every editable in the
product has the same property. That conflation is exactly what made the ADR-035b claim wrong, and it
must not be repeated one layer up. The two populations are therefore recorded separately.

**WIRED — reached by a history funnel (counted from source, not assumed):**
```
_cvHistText   3 call sites   -> #titleEditable, .social-name, .social-title
                              (+ .prof-title, .prof-text and every contact .editable via
                                setupProfessionalEvents / setupRegularEvents, one call per element
                                at construction time)
_makeEditable 27 call sites  -> iframe terminal editables
```

**MEASURED — behaviour observed, per element:**
```
.prof-text            insert 3 real keystrokes  +  delete 3 real Backspaces   FULL
contact .editable     insert 2 real keystrokes (email)                        INSERT ONLY
#titleEditable        insert + delete (author, real keyboard, pre-035e build) FULL
.social-title         insert, undo/redo, forced render                        INSERT ONLY
one iframe editable   insert, undo/redo, caret                                INSERT ONLY
```

**NOT MEASURED:** `.prof-title`, the six remaining contact fields, `skills-hobby`, skill items, and
26 of the 27 iframe editables. They are **wired**, which is a statement about the code path, not
about observed behaviour. If any of them is later found to misbehave, that is a NEW finding, not a
regression of ADR-035g — because ADR-035g never claimed them.

**The correct sentence, and the only one that should be quoted later:**
> Letter-by-letter undo is verified for `prof-text` in both directions, and for a sample of the other
> funnels in the insert direction. Everything else is wired, not verified.

### ADR-035g — PASS / VERIFIED, with two limits carried forward
1. `2 keystrokes -> 3 entries` on a contact field: observed once, not reproduced. Neither PASS nor
   FAIL — an unreproduced observation. A plausible mechanism exists (a transaction applying to a node
   `renderAll()` had replaced) and a guard is in place; **whether the guard fired is not established.**
   Note: the same class of fault later voided one of my own probe runs, which is indirect support for
   the mechanism being real — but that is about my instrument, not about the product.
2. `_makeEditable` remains a parallel implementation of the contract. Verified working; unification
   not done. **Architectural debt, not a proven defect.**

Artefacts unchanged: `index.html` V487, `487.html` frozen, `488.html` frozen, sandbox is the ADR-035g
candidate, `prodwatch` alive, no promotion.

### WRITER INVESTIGATION — MEASUREMENTS SO FAR, 2026-08-23
No artefact touched. Everything below is read-only.

**Established:**
- iCloud Desktop & Documents sync is active at ACCOUNT level, not merely by path:
  `MobileMeAccounts` shows `com.apple.Dataclass.CloudDesktop` and `com.apple.Dataclass.Ubiquity`
  (`MOBILE_DOCUMENTS`, `Enabled = 1`) for `max.mustermann@example.com`.
- The project directory contains **no iCloud conflict copies** — only `486/487/488.html`,
  `index.html`, `index-test.html`.
- **No `.icloud` placeholders** anywhere in the project: every file is materialised locally.
- `index.html` has NOT changed since the event: mtime still `2026-08-22 14:51:42`.

**Weight of the negative findings — deliberately limited.** The absence of a conflict copy does NOT
exclude iCloud: last-writer-wins can overwrite silently without producing one. It is weak evidence
against a *concurrent two-device conflict*, and no evidence at all against iCloud as the writer.
**iCloud stays on the candidate list.**

**Could not be established locally:** the list of devices signed into the Apple ID. It is not stored
in readable local state, and `brctl status` enumerates containers, not peers. This is the cheapest
remaining discriminator and it needs the author: *System Settings -> Apple Account -> device list.*
- Only this Mac -> the "another device" branch weakens sharply; move to local processes/services.
- Other devices -> that branch becomes the primary line.

**Observation windows, classified:**
```
14:51:42                          the event                       KNOWN
15:06:43 -> session teardown      0 events, LOG DESTROYED         NO EVENT (unverifiable)
teardown -> 00:35:37              not observed                    UNKNOWN
00:35:37 -> now                   prodwatch alive, heartbeat 10m  open window
```
The first watcher did not die on its own — the scratchpad was wiped with the session, taking its log
with it. **That result is now testimony, not an artefact.** The restarted watcher writes a heartbeat
every 10 minutes precisely so a future gap reads as UNKNOWN from the log itself rather than from
memory of when it stopped.

### WRITER INVESTIGATION — EXISTING TRACES EXHAUSTED, 2026-08-23
Every trace of the 14:51:42 event that could be examined without changing the environment has now
been tried. Recorded in full, because "we looked and found nothing" and "we could not look" are
different results and must not merge later.

```
unified log        UNREADABLE FROM HERE. `log show` returns 0 lines for EVERY window, including the
                   last 5 minutes, while /var/db/diagnostics holds 1.0 GB. Permission, not absence.
                   Yields NOTHING in either direction — it is not evidence that iCloud was quiet.
Time Machine       No local snapshots exist for disk /. No data.
brctl log          READABLE (238 lines) but coverage ends 2026-08-16 — it does not reach the event.
xattrs / mdls      No device attribution of any kind on index.html.
com.apple.macl     WITHDRAWN as evidence: identical on index.html, 487.html and 488.html — including
                   488.html, which I created myself with `cp`. It carries no information about any
                   writer. I had cited it as part of the fingerprint; that was wrong.
conflict copies    None in the project directory.
directory scan     index.html was the ONLY file changed in 14:45-15:00.
```

**Device topology, from the author:** one MacBook Pro (this machine) and one iPhone, same Apple ID.
**No second Mac.** Desktop & Documents keeps a full, continuously-pushed local copy only on Macs, so
the "another Mac pushed an older copy" branch is largely closed. The author also reports opening
`index.html` on the iPhone to view it — recorded as **access, not a write**: viewing through Files
does not modify, and no evidence of an iPhone write exists.

**The candidate this leaves, which needs no second device:** reconciliation between THIS Mac and the
cloud copy. V488 was written locally at 14:43:12 (1.16 MB to upload); the overwrite to V487 came
8 minutes later. If the upload had not completed or was superseded, iCloud pushing the cloud's older
copy down would explain every measured property. **Plausible, timing-consistent, NOT established.**

**Consequence:** no further information can be extracted from the event itself. Learning anything more
now requires an experiment that changes the environment — which is why the canary was proposed and
deliberately NOT run before this point.

### CANARY EXPERIMENT #1 — QUIET, BUT PROBABLY THE WRONG SIZE, 2026-08-23
Run under the author's ten-point protocol. No project artefact touched at any point.

```
00:58:26  _icloud_canary.txt created   109 bytes   3fbf195a…   inode 35872649
00:59:08  canarywatch armed, 2s poll, 5min heartbeat
01:01:42  controlled change            4d98e4f0…   same inode (written in place)
01:01:44  the change is logged — our own write, correctly attributed
01:04:09  heartbeat, unchanged
01:09:11  heartbeat, unchanged
+9 min    UNCHANGED
```

**Result under the pre-registered rule:** the iCloud hypothesis **WEAKENS**. It is **NOT excluded** —
the conditions of 14:51:42 may simply not have recurred.

**And a limitation of my own design, which makes the result weaker still.** The hypothesis was that
V488's upload (**1.16 MB**) had not completed or was superseded, leaving the cloud copy authoritative.
The canary is **109 bytes** — it uploads effectively instantly and therefore **never enters the state
the hypothesis is about**. A quiet 109-byte canary is close to uninformative for a 1.16 MB mechanism.
I chose the size without thinking about it; size may be part of the mechanism.

**What the run does establish:** a small file written locally in this directory was not reverted
within 9 minutes, and our own write was captured cleanly with correct attribution — so the instrument
works and would have caught a revert.

**Proposed correction:** repeat with a **size-matched** canary (~1.16 MB), same protocol, same
watcher. That is the experiment the hypothesis actually calls for. Not run — the size change is a
change to the protocol the author specified, so it is theirs to authorise.

`_icloud_canary.txt` is still present, awaiting the author's word on deletion (protocol point 10).
Artefacts unchanged: `index.html` V487, `487.html`, `488.html`, `index-test.html`. Both watchers alive.

### THE HYPOTHESIS WAS TWO HYPOTHESES — author's correction, 2026-08-23
My reading of canary #1 ("wrong size, weak result") silently assumed a single hypothesis. There are
two, and the evidence lands on them differently:

```
H1  iCloud can overwrite a local version with the cloud version.
    -> a SMALL canary is a valid test. Canary #1 was quiet for 9 minutes.
    -> H1 is WEAKENED on its own terms. Not excluded.

H2  The event happened because of a conflict while a LARGE file was still uploading
    (V488 = 1.16 MB, overwritten 8 minutes after it was written).
    -> a 109-byte canary never enters that state, so canary #1 says NOTHING about H2.
    -> H2 is UNTESTED. Not weakened, not supported.
```

**My error, and it matters more than the result:** I concluded "the canary was the wrong size" and
proposed replacing it with a 1.16 MB one. That is the move of enlarging an experiment because it did
not give the answer you were hoping for. The author stopped it: **a new size means a new
pre-registered protocol, not a quiet substitution inside the old one.** Otherwise the experiment gets
adjusted until it produces the expected result — the exact failure mode this whole investigation has
been built to avoid.

**Decision: stop here.** No size-matched canary without a protocol agreed in advance. H2 stays
explicitly UNTESTED rather than being converted into a result.

`_icloud_canary.txt` is **kept, not deleted** — it is part of the current evidence, and its continued
quietness is itself an ongoing observation of H1. `canarywatch` stays alive alongside `prodwatch`.

```
index.html       V487 🔴          487.html   V487 🔒
488.html         V488 🔒          index-test ADR-035g 🧪
canary 109 B     not reverted     prodwatch + canarywatch  ALIVE
writer           UNKNOWN          promotion  BLOCKED
```

---

## SLIDER BAR — HOVER-EXPAND FROM HOME, 2026-08-23 (sandbox)

**Request:** the top control bar should behave like the ByteWebster "Default" glowing dropdown —
hovering **Home** opens the other controls **horizontally to its right**, and they stay open.
Explicit constraint: **no button's function may change**, only the way they open.

### Due diligence before touching anything — measured, not assumed
```
recreated by renderAll()?   NO — the bar is static HTML, id="sliderBarMenu" appears once, never rebuilt
existing JS hover/focus?    NONE — hover was already purely CSS
events on the buttons?      only flagButton has a direct click; the rest go through data-function
renderAll() mentions it?    NO
```
This matters: because the bar is static and carries no JS hover logic, **a CSS-only change cannot
create a second code path and cannot suffer the detached-node failure that bit ADR-035**. That risk
was raised and is answered by measurement, not by argument.

### Implementation — CSS only, no JavaScript touched
By construction no handler, id or `data-function` is altered: nothing but stylesheet rules changed.
- items after the first collapse to `max-width:0 / opacity:0 / margin-left:0`, and open on
  `.slider-bar-menu:hover` **and** `:focus-within` so it is not mouse-only
- spacing carried by `margin-left`, list `gap:0` — `gap` does not animate reliably, which would have
  made the expansion step rather than glide
- staggered `transition-delay` 0 / .05 / .10 / .15 / .20s so items unfold in sequence
- `@media (prefers-reduced-motion: reduce)` disables the travel

### HOME MUST NOT MOVE — a defect found and fixed during the work
First version: on open, **Home drifted 109px left**. Cause: the original rule centres the bar with
`margin:0 auto`, so a growing bar expands in both directions. That is not "opens from Home to the
right". Fixed by anchoring the left edge at `calc(50% - 55px)` (half the collapsed 110px), which
keeps the collapsed pill visually centred while every added item extends only rightward.
```
collapsed  bar x=537  w=110   Home x=567
open       bar x=537  w=431   Home x=567     drift 0px, grows rightward only
```

### MOBILE — the whole thing is guarded
The collapse lives inside `@media (hover: hover) and (pointer: fine)`. A touch screen has no hover,
so applying it everywhere would leave the controls **permanently unreachable** on phone and tablet.
Verified at 375x812: `hover:hover` false, rules do not apply, all five buttons 124px wide, bar 800px
— **identical to before the change**.

Sandbox only: `index-test.html` -> `d515b30438a99cbd895a64fccec7fa35`. Production untouched
(`index.html` = `487.html` = `d09626007a7534c1e311bdd6ccc184d0`), `488.html` frozen.

**Not from this work:** the template switched to `tpl-neumorphic` at 01:34 — the author changed the
design while this was in progress. Recorded because it was briefly unexplained.

### SLIDER HOVER-EXPAND — CLIPPING DEFECT, REPORTED AND FIXED, 2026-08-23
**Reported by the author with screenshots:** in Design 3 the circles looked cut off; in Design 4 the
corners looked square. Both were caused by my first implementation.

**Cause.** The collapse used `overflow:hidden` + `max-width:0` on each `li.icon-content`. The buttons
**paint outside their own box** — the neumorphic shadow in Design 3, the edge treatment in Design 4 —
so clipping each item to its box cut exactly the part that makes the button look round. The bar looked
correct in the default dark design, which is why my own check missed it: **I verified one design and
treated it as the product.** Same error class as ADR-035b, in a different costume.

**Fix — stop clipping rather than widen the clip.** The collapse now uses a negative margin
(`margin-left:-50px`, exactly `.link`'s fixed width) so a closed item contributes zero layout width
while nothing is painted away. Every design keeps its own shadow geometry untouched. `overflow` is no
longer used anywhere in these rules.

**Verified across designs, open and closed:** `design-1 tpl-default`, `design-3 tpl-default`,
`design-3 tpl-neumorphic`, `design-4 tpl-neumorphic` — round buttons, full shadows, no square corners,
in both the collapsed and expanded state. Home stays at x=568 in every case; the bar grows from 110px
to 433px rightward only.

Sandbox `19e119f9b9ffb095afe15b3844c16b6d`. Production untouched, `488.html` frozen.

### SLIDER HOVER-EXPAND — CENTRING REVERSED AT THE AUTHOR'S REQUEST, 2026-08-23
The earlier anchoring is **deliberately undone**. Recorded as a reversal, not as a correction of a
defect, so the two entries do not read as contradicting each other.

**What was asked first:** "options open from Home to the right" — I read that as *Home must not move*
and pinned the bar's left edge. It did what it said.

**What was actually wanted, once seen in use:** the open bar then sat off-centre, with unequal space
to its left and right. The requirement is the opposite of pinning: **the whole group of buttons must
stay on the project's centre line**, so Home glides left as the bar grows and returns to centre when
it closes.

`margin-left/right:auto` gives exactly that, and it animates for free — the items' margins animate,
the content width changes each frame, and the auto margins re-centre continuously. No JavaScript, no
extra transition, nothing measured in pixels that could go stale if the layout changes.

**Measured, project centre = 592:**
```
closed   bar 110px   centre 592   space L 345 / R 345    Home centre 592
open     bar 431px   centre 592   space L 184 / R 184    Home centre 431
                                  Home glides left 161px = half the added width
CLOSED_HOME_ON_CENTER  true
OPEN_GROUP_ON_CENTER   true
OPEN_SPACES_EQUAL      true
```
Visual check in `design-4 tpl-neumorphic`: buttons round, shadows intact, group centred.

**Lesson worth keeping:** the first reading of "open from Home to the right" was defensible and still
wrong, because it fixed on the *mechanism* (Home doesn't move) rather than the *result* (the group
looks balanced). The description of a motion is not the same as the intent behind it — when they
diverge, the intent wins.

Sandbox `acfe9627a24446ade12402a73a05832a`. Production untouched, `488.html` frozen.

---

## V489 PROMOTED — 2026-08-23, on the author's instruction, with the writer still UNKNOWN

The author's own invariant said `index.html` must not be promoted until the external-writer path was
understood or isolated. **It is not.** The author overrode that deliberately; it was stated before
executing, not glossed over.

**What changed since the invariant was set, and why the risk is materially lower than at V488:**
`prodwatch` is running with a 10-minute heartbeat. The V488 overwrite was found hours later by
accident; a repeat now surfaces within 5 seconds with inode, xattrs, open handles and daemon state
attached. Rollback remains one command.

```
pre-flight   index.html      d09626007a7534c1e311bdd6ccc184d0  asserted
             index-test.html acfe9627a24446ade12402a73a05832a  asserted
             489.html        must not exist                    asserted
backup       index.html.bak-pre-v489-20260823-020450
             index-test.html -> 489.html -> index.html

after        index.html      acfe9627a24446ade12402a73a05832a
             489.html        acfe9627a24446ade12402a73a05832a
             487.html        d09626007a7534c1e311bdd6ccc184d0  frozen
             488.html        deaeb3b1b4e565161ed94d9b6579748e  frozen
```

**Indicators, all as predicted:**
```
                cv-hist-undo  _wireTerminalHist  ADR-035g  HOVER-EXPAND
index.html/489       1               0              4           1
488.html             1               0              0           0
487.html             2               2              0           0
```

**This promotion carries TWO bodies of work**, not one: the ADR-035b–g history contract, and the
slider hover-expand. If a regression appears, attribution between them is not free — the bundle was
the price of holding promotion during the writer investigation.

**`prodwatch` proved itself end to end on this operation** — it logged all four sandbox edits and the
promotion itself, each with full context, and its heartbeat confirms continuity:
```
01:31:12 / 01:37:02 / 01:47:29 / 01:57:00   index-test.html   (the four sandbox edits)
02:04:51                                     index.html  d0962600 -> acfe9627
02:06:29 heartbeat                           index.html = acfe9627
```
Its baseline for `index.html` is now V489, so any silent revert is captured with a timestamp.

**Still open and unchanged:** writer UNKNOWN · H2 untested · canary quiet and kept ·
`_makeEditable` parallel implementation · ADR-031 needs re-adjudication.

### SLIDER HOVER-EXPAND ON TOUCH — DELIBERATELY NOT IMPLEMENTED, 2026-08-23
Author's decision after the options were laid out: **leave touch as it is for now.** Recorded as a
choice so it is not later read as an oversight or a broken mobile case.

**The guard is on device CAPABILITY, not screen width** — `@media (hover: hover) and (pointer: fine)`.
That one condition covers every case correctly without a size breakpoint:
```
desktop / laptop        collapses, opens on hover
iPad + trackpad         collapses, opens on hover      (measured: hover:hover, pointer:fine, touch 0)
iPad by finger          stays open, all five reachable
phone                   stays open, all five reachable
```
A `max-width` breakpoint would have been wrong: an iPad with a trackpad would have lost the animation
for no reason, and so would a small laptop.

**Measured at 768x1024 with a fine pointer:** closed bar 112px centred on the project centre (384),
open bar 433px still centred and fitting the viewport, and the collapsed items are genuinely inert —
`opacity:0` and `pointer-events:none`, so they cannot be hit by accident.

**Why touch was not given the same behaviour.** There is no hover on touch, so the only equivalent
trigger is a tap — and Home already carries `data-function="home"`. Making the first tap expand would
change what Home DOES on a phone, which is the one thing the author excluded when asking for this
feature. The alternatives (long-press, or a separate handle) either hide the gesture or add a control.
So the author's mobile rule is met in the sense that matters — **every button works on touch exactly
as before** — while the animation, whose trigger simply does not exist there, is not forced.

Options A (tap-to-expand, changes Home on touch) and C (separate trigger) remain available and
un-chosen.

---

## NARROW DESKTOP WINDOW — OPTION B IMPLEMENTED (sandbox), 2026-08-23

**The reported symptom was not a tablet problem.** Measured: at the tool's "tablet" preset the browser
reports `innerWidth 768`, `touchPoints 0`, a Macintosh UA and **ignores the meta viewport** — that is a
narrow desktop window, not a tablet. With proper device emulation the same width reports
`innerWidth 1200`, honours `<meta viewport content="width=1200">`, and Terminal 1 and 2 render exactly
as on desktop (contacts at x=422/796, two columns beside the photo). **Real phones and iPads were never
affected.** The author chose to fix the narrow-desktop-window case anyway.

### Two rules, not one — and both thresholds were measured, not guessed
```css
@media screen and (max-width: 1179px) and (pointer: fine) and (hover: hover){
  html{ overflow-x:auto; }
  body:not(.a4-mode){ min-width:1180px; }
}
```
- **1180px** is the design's measured intrinsic width (`documentElement.scrollWidth` with the rule
  disabled). My first attempt used 1199/1200 and produced a needless scrollbar at 1183px, where the
  layout was already fine.
- **`overflow-x:auto` is required.** `html` carries `overflow-x:hidden`; a bare `min-width` would have
  CLIPPED the right-hand side instead of letting it be reached — worse than the reflow it replaces.
- **`(pointer:fine) and (hover:hover)` was added after a measurement, not for tidiness.** Without it
  the rule reached touch devices: releasing `overflow-x:hidden` made the browser recompute the layout
  viewport from 1200 to 1180 (canvas 1096 -> 1076). Harmless to look at, but it contradicted the claim
  that touch was untouched.
- `screen` keeps it out of the six `@media print` blocks; `:not(.a4-mode)` keeps it off the ~794px A4
  document.

### VERIFIED
```
desktop 1183   rule inactive · min-width 0 · overflow-x hidden · no scrollbar   UNCHANGED
narrow  900    canvas 1076 · contacts 422/786 · nothing below the photo · scrolls
narrow 1000    canvas 1076 · contacts 422/786 · nothing clipped · scrolls
mobile  375    layout viewport 1200 · min-width 0 · overflow-x hidden · canvas 1096   UNTOUCHED
A/B on production V489 (no rule) at 900: canvas 796, contacts 72/442, items BELOW the photo
```

### A RESIDUAL, MEASURED AND NOT FIXED
**Live-resizing** the window narrow still disturbs the contact positions until the next reload: the
`resize` handler runs `ContactLayout.applyDesktopLayout`, which recomputes default positions from the
canvas rect and writes inline coordinates before the CSS width settles. The CSS keeps the canvas at
1076, but the JS positions lag. **It self-heals when the window is widened again** (measured: back to
422/788, nothing below the photo), and a page *loaded* at a narrow width is correct from the start —
which is the case that actually occurs.

Fixing the lag means touching the resize path in JavaScript. **Not done**; it is a separate change and
was not what was asked for.

Sandbox `b41432793e023d07238a47bc77b00f7c`. Production `index.html` = `489.html` =
`acfe9627a24446ade12402a73a05832a`, untouched. `487.html` / `488.html` frozen.

## V490 PROMOTED — 2026-08-23
Option B (narrow-desktop-window: scroll instead of reflow) promoted on the author's instruction.

```
pre-flight   index.html      acfe9627a24446ade12402a73a05832a  asserted (V489)
             index-test.html b41432793e023d07238a47bc77b00f7c  asserted
             490.html        must not exist                    asserted
backup       index.html.bak-pre-v490-20260823-025043
             index-test.html -> 490.html -> index.html

after        index.html = 490.html = b41432793e023d07238a47bc77b00f7c
             489.html   acfe9627a24446ade12402a73a05832a   frozen
             488.html   deaeb3b1b4e565161ed94d9b6579748e   frozen
             487.html   d09626007a7534c1e311bdd6ccc184d0   frozen
```

**Indicator table — V490 differs from V489 by exactly one thing, as intended:**
```
             cv-hist-undo  _wireTerminalHist  ADR-035g  slider  narrow-window
index/490          1              0              4        1          1
489                1              0              4        1          0
487                2              2              0        0          0
```

`prodwatch` logged the promotion at 02:50:45 (`acfe9627 -> b4143279`) and its baseline for
`index.html` is now V490. Rollback ladder, each one command:
`cp 489.html index.html` (before the narrow-window rule) · `cp 488.html index.html` (history only) ·
`cp 487.html index.html` (before ADR-035).

Residual carried forward, measured and documented: live-resizing a desktop window narrow still lets
the JS `resize` path reposition contacts until the window is widened again or the page reloads.

### TWO THINGS V490 IS NOT — author's framing, recorded to stop a future misreading
1. **`narrow` is not a closed defect.** It is a promoted change with a known, measured limitation:
   initial load at a narrow width is correct, reload at a narrow width is correct, **live resize still
   displaces the contacts** until the window is widened or the page reloaded. The JS `resize` fix was
   not attempted.
2. **V490 running without incident is NOT evidence about the unknown writer.** They are separate
   matters. A quiet period after a promotion says nothing unless the condition that produced the
   14:51:42 overwrite was present during it — and that condition is still unidentified. Any future
   "we promoted twice and nothing happened" must be read as an OBSERVATION WINDOW, never as
   exoneration. Same ARMED / SPENT distinction the author fixed earlier in this investigation.

Register unchanged: writer UNKNOWN · H2 OPEN · canary observation only · `_makeEditable` parallel
implementation · ADR-031 reread required · backup debt, no deletion authorized.

### THE WATCHER IS THE WRONG INSTRUMENT FOR "DID IT HAPPEN" — 2026-08-23 20:25
Both watchers were found stopped and their logs gone: the scratchpad is wiped at every session
boundary, so **continuous observation across sessions is not achievable this way.** I was about to
classify the 17.5-hour gap as UNKNOWN under our own rule. That was wrong, and the file itself says so:

```
index.html          b41432793e023d07238a47bc77b00f7c   still V490
                    mtime 2026-08-23 02:50:43   =   the promotion write, unmoved for 17.5 h
_icloud_canary.txt  4d98e4f0bd1a3c7208c27ea0305033c3
                    mtime 2026-08-23 01:01:42   =   my controlled edit, unmoved for 19+ h
```

**`mtime` is a retroactive witness.** For the narrow question "was this file written?", it answers
for the whole gap with no watcher running at all — and it answers NO. So the period is not UNKNOWN;
it is a measured no-write interval.

**Refinement of the reading rule:**
```
mtime unchanged      -> NO WRITE occurred. Known retroactively, no watcher needed.
watcher running      -> CONTEXT at the moment of a write: processes, xattrs, daemon state.
                        Irrecoverable afterwards — this is the watcher's only real value.
watcher stopped      -> context would be lost IF a write happened; it does not make the
                        interval unknown.
```
The practical consequence: **a `stat` at the start of each session covers every gap**, and the
watcher is worth running only to catch the context of a recurrence.

**Effect on the hypotheses:** H1 (iCloud can overwrite a local file here) is now quiet across ~19
hours rather than 9 minutes — a materially longer window. Still **weakened, not excluded**: the
condition that produced 14:51:42 remains unidentified, so its absence proves nothing on its own.
H2 remains untested.

Watcher restarted 20:25:28, now covering `index.html`, all four frozen artefacts, the sandbox and the
canary in one process.

### THE THREE-WITNESS MODEL — author's framing, 2026-08-23
```
hash    -> the CONTENT has not changed
mtime   -> the MODIFICATION TIME has not changed
ctime   -> the INODE STATE has not changed
```
`ctime` is **change** time, not creation time (a common confusion, pinned here deliberately). It
updates whenever the inode is touched at all — content, permissions, xattrs — and a normal process
cannot set it arbitrarily: `touch` writes atime/mtime, and doing so *updates* ctime. That makes it the
hardest of the three to forge, and the reason the combination is strong rather than merely suggestive.

Measured over the unobserved interval:
```
index.html   b41432793e023d07238a47bc77b00f7c   inode 28319192   mtime 02:50:43   ctime 02:50:50
canary       4d98e4f0bd1a3c7208c27ea0305033c3                    mtime 01:01:42   ctime 01:01:45
```

**What this supports, exactly:** *there is no evidence of any change to `index.html` during this
interval.* **What it must not be turned into:** a statement about the process that caused the earlier
event. The writer of 14:51:42 remains UNKNOWN. A long quiet window weakens H1 and says nothing about
H2, which is still untested.

---

## ADR-036 — Contact text authority: the invariant, raised BEFORE any implementation

**Status: OPEN. No code written. `restoreState()`, `hasZeroSeedLayout` and `dict.contacts` deliberately UNTOUCHED — they are the variables under observation.**

### The invariant

> When `state.contacts[].text` differs from the dictionary value, the sequence
> **render → save → reload** must preserve the state's text.

### Why it is raised now

ADR-035h fixed the `Event→''` regression, which had been *masking* this. With the stored
text no longer destroyed at commit time, the second mechanism became measurable — and it
is destructive, not cosmetic:

```
user edit → commitText → state + localStorage        ✅ correct (035h)
reload    → loadState reads the stored text          ✅ preserved
          → restoreState() builds renderData from dict.contacts
          → ContactElements are CREATED from renderData → ce.data.text = DICTIONARY
any interaction → t.update() → saveState()
          → stateItem = {...ce.data, id, left, top, width, icon}   ← text from ce.data, NOT the DOM
          → dictionary value persisted                 ❌ the author's text is destroyed
```

The destroying step is **the save after the render**, not the render itself. A snapshot taken
immediately after reload shows the text intact, which is why a single badly-timed measurement
would "prove" the opposite.

### Test procedure (isolated origin, no product code changed)

Second server on a different port ⇒ different origin ⇒ separate `localStorage`; the author's
real CV is never touched. `localStorage.clear()` and the reload must happen in ONE operation,
or the old page's in-memory state races the clear and re-saves itself.

1. Clean origin, fresh load.
2. Real typing (not programmatic `textContent`) into the subject and the control.
3. Snapshot A — state / localStorage / DOM.
4. `contactManager.restoreState()` → snapshot B.
5. `cvApp.getTerminal('personal').update()` → snapshot C.
6. Reload → snapshot D.

**Subject:** `c-location`. **Control:** `socialName` — ADR-035c made state its owner, so it
must pass the identical sequence. Without the control this is a test that always fails,
which is not a test.

### Result at V490 + ADR-035h (sandbox `4c9ab707660344039f36e0997bbf0171`)

| step | subject `c-location` | control `socialName` |
|------|----------------------|----------------------|
| A after commit | `Tirana, Albanien_INV` ✅ | `Max Mustermann_INV` ✅ |
| B after render | state ✅, DOM → dictionary | ✅ |
| C after save   | **`Tirana, Albanien`** ❌ | ✅ |
| D after reload | **`Tirana, Albanien`** ❌ | `Max Mustermann_INV` ✅ |

**INVARIANT: FAIL for contacts, PASS for the control. The test discriminates.**

### The decision this invariant is FOR (not made here)

- **Alternative A — `state.contacts[].text` is authoritative.** The dictionary seeds a first
  run and never outranks a stored value. The fields stay editable.
- **Alternative B — the dictionary is authoritative.** Then these fields must not be presented
  as editable. A UI that accepts an edit and discards it is not an option.

Both are better than the present state, where the field looks editable and the edit disappears.
The choice is the author's and belongs in its own ADR — it must not be smuggled into ADR-035h.

`textMinWidth`'s wrong constant (`len*8+80` vs a real advance of 8.4 px/char) is a separate
defect and is not part of this.

---

## ADR-037 — Contact text ownership: state is authoritative, the dictionary is a seed

**Status: DECIDED by the author 2026-08-23. Implementation NOT started. No code written.**

### Decision

**Alternative A.** `state.contacts[].text` owns the user's value. `dict.contacts` supplies a
default for a field that has no stored value, and never outranks one that does.

```
dictionary  →  seed / default only
                    ↓
        state.contacts[].text   ← authority after initialisation
                    ↓  render
                   DOM
                    ↓  save
        state.contacts[].text
```

NOT the present chain, in which the dictionary re-enters through the renderer and is then
persisted as if it were the user's value:

```
dictionary → render → ce.data.text → save → dictionary value overwrites the user's
```

### Rationale (author's)

The field is presented as editable and the user can really change it; ADR-035h already
guarantees the edit reaches state correctly; ADR-036 shows the loss occurs *only* because
`restoreState()` seeds `ce.data.text` from the dictionary and `saveState()` then treats that
as authoritative. `socialName` proves the state-owned model already exists and works in this
codebase. So this is not a new semantics for the system — it brings contacts onto the contract
`socialName` already uses.

### MEASURED FINDING THAT SHAPES THE IMPLEMENTATION — the contacts are not one behaviour

Comparing the three dictionaries directly:

| contact | varies by language? | de / en / sq |
|---|---|---|
| `c-email` | **no** | identical in all three |
| `c-phone` | **no** | identical in all three |
| `c-birthday` | **no** | identical in all three |
| `c-location` | **YES** | `Tirana, Albanien` / `Tirana, Albania` / `Tiranë, Albania` |
| `c-license` | **YES** | `Führerschein: Klasse B, C` / `Driver's License: Class B, C` / `Patentë: Klasa B, C` |
| `c-nationality` | **YES** | `Albanisch` / `Albanian` / `Shqiptar` |

A clean 3/3 split. **Consequence: a single flat `state.contacts[].text` that wins over the
dictionary is sufficient for three contacts and silently WRONG for the other three** — an
edit made in German would then render in English and Albanian too, and the language switch
would quietly stop working for exactly those fields.

This is the ADR-035c trap repeating. There, reusing `getTranslated()` for a
dictionary-seeded label made a German override render in EN and SQ; it was caught only by
measuring the language switch immediately after. The lesson recorded then applies verbatim
here: **derive ownership from each field's nature, do not apply one rule to a group because
the group shares a CSS class.**

### What implementation must therefore decide (NOT decided here)

1. **Shape of the override for the three language-dependent contacts.** ADR-035c's precedent
   is `LocalizedText` at `content.terminal1.<key>.title` with a current-language-only read and
   the dictionary as fallback — deliberately no cross-language fallback. Whether contacts reuse
   that location, or gain their own, is open.
2. **Shape for the three language-independent contacts.** `socialName`'s rule — state wins
   unless `undefined | null | ''` — is the obvious candidate, and a phone number is a proper
   noun in the same sense a person's name is.
3. **Migration.** Existing stored values were overwritten with dictionary text by the very
   defect being fixed (ADR-036). After the fix those values become authoritative, which means
   a user whose state holds the German string would see German in EN and SQ. A candidate rule:
   *a stored value equal to the dictionary value for any language is treated as "no override".*
   Its only cost is that a user who deliberately types text identical to the dictionary loses
   an override that produces an identical result. This is a decision, not a conclusion.

### Structural observation, recorded but not actioned

`saveState()` takes contact text from `ce.data.text`, never from the DOM. That makes whatever
the renderer put into `ce.data` become truth at the next save. Fixing what `renderData` carries
is therefore sufficient to close ADR-036 — but the underlying hazard is that the render seeds
the object the save trusts. Whether that coupling should change is out of scope here.

### Acceptance criteria

The ADR-036 test, unchanged:

```
c-location :  commit PASS · render PASS · save PASS · reload PASS
socialName :  commit PASS · render PASS · save PASS · reload PASS
```

Plus a mandatory regression guard stated by the author:

> **Changing the contacts' contract must not change the control's result.**
> `socialName` must still pass, by the same mechanism it passes today.

And, from the 3/3 finding above, one more that the original criteria do not cover:

> **The language switch must still produce the dictionary value for a contact with no override,
> in all three languages** — and an override made in one language must not leak into the others.
> ADR-035c was declared done once before this check existed.

### Explicitly NOT in this ADR

- ADR-035h (the `Event→''` regression fix) — separate, already verified, still unpromoted.
- `textMinWidth`'s wrong constant (`len*8+80` vs a measured 8.4 px/char advance) — separate defect.
- Production promotion of anything.

Sequence agreed with the author: 035h (B) · 036 (the proof) · 037 (this decision) · implementation ·
036 re-run as acceptance · only then any merge or promotion. 035h must not become a bundle that
quietly ships B + A + `textMinWidth` together.

### ADR-037 addendum — sharpened formulation and the migration trade-off (author, 2026-08-23)

**The rule is NOT "state > dictionary" as a universal render rule.** That phrasing is what
would repeat the ADR-035c mistake. The precise formulation:

> **State is the authority for the user's value. The dictionary is the authority for
> localisation when no override exists for the CURRENT locale.**

Two ownership classes, derived from the measured 3/3 split:

```
locale-independent : c-email · c-phone · c-birthday
    state override applies when stored !== undefined && !== null && !== ''

locale-dependent   : c-location · c-license · c-nationality
    dictionary remains the source for the current language
    state stores the override PER LOCALE
```

Required behaviour, stated as a table because it is the thing that must not regress:

```
no override          DE → Albanisch      EN → Albanian     SQ → Shqiptar
override made in DE  DE → user's value   EN → Albanian     SQ → Shqiptar
```

**An override must not leak between locales.**

#### The migration rule is a HEURISTIC, and is declared as one

> *If a stored value equals one of the dictionary values for that contact, treat it as
> "no override".*

This is **not** a reconstruction of the data's history. It cannot be — nothing in the stored
state records who wrote the value. It is justified here only because ADR-036 proved the defect
*could and did* write dictionary values into state, so a stored value identical to a dictionary
value carries no evidence of user intent.

The accepted cost, stated plainly rather than discovered later:

```
stored = "Albanisch"   →  treated as no override
                          DE Albanisch · EN Albanian · SQ Shqiptar
                          If the user HAD deliberately chosen "Albanisch",
                          that override is lost.
```

That trade-off is accepted. It is recorded here so that nobody later reads the heuristic as a
claim about what actually happened to the data.

### ADR-037 implementation — sandbox only, 2026-08-23

Three edits in `index-test.html`. `dict.contacts`, `hasZeroSeedLayout` and `saveState()` untouched.

1. **Helpers** (script level, beside `_cvHistText`): `_cvContactLocaleClass`, `_cvIsDictValue`,
   `_cvResolveContactText`, `_cvWithContactOverride`.
2. **`restoreState()`** — the unconditional `dict.contacts[key]` mapping replaced by
   `_cvResolveContactText(c, key, lang, tm.TRANSLATIONS, this.state)`.
3. **`commitText`** (`setupRegularEvents`) — a locale-dependent contact additionally writes
   `content.terminal1.contacts[id][lang]`.

**The locale class is DERIVED from the dictionary, not enumerated in a table.** ADR-031 already
paid for that lesson: a table keyed by instance id enumerated the contacts that happened to
exist and broke on the first user-added one. Here, `de === en === sq` means the dictionary
carries no localisation for that field, so an override is locale-invariant; differing values mean
overrides must be per locale; no dictionary entry at all means no localisation authority exists
and the contact is state-owned outright. Verified at runtime: email/phone/birthday → `invariant`,
location/license/nationality → `localized`, a contact with no dictionary key → `none`.

`contacts[].text` is retained as a **mirror** that `saveState()` maintains from `ce.data`. It is
not an authority: it is read only as a pre-migration fallback, and only while no override exists
in any locale. Once one does, reading it would leak one locale's text into the others.

#### Results

| check | result |
|---|---|
| ADR-036 subject `c-location` — commit · render · save · reload | **PASS** |
| ADR-036 control `socialName` — same sequence | **PASS** |
| Override made in DE does not leak — EN `Tirana, Albania`, SQ `Tiranë, Albania` | **PASS** |
| Contact with no override still localises — `Albanisch` / `Albanian` / `Shqiptar` | **PASS** |
| Locale-invariant contact identical in all three languages | **PASS** |
| DE override survives a `saveState()` performed while displaying SQ | **PASS** |
| Console errors | none |

The strongest single result: after a save performed in SQ the mirror held the SQ dictionary
value, and returning to DE still rendered the user's override. The authority is genuinely the
per-locale entry, not the flat field.

#### Two things this implementation exposed, neither fixed here

**1. ADR-036's acceptance criterion, as literally written, no longer states the invariant.**
It asserts on `state.contacts[].text`. Under ADR-037 that field is the mirror, and after a
language switch it legitimately holds the last rendered value. The criterion passes in a
single-language flow and becomes misleading in a multilingual one. It must be restated against
the authority (`content.terminal1.contacts[id][lang]`) plus the rendered DOM.

**2. A 32 px clip on an overridden contact — reported, NOT fixed.**
`commitText` computes the new width and applies it to `element.style.width` *after* `setState`
and `save`, and never puts it into the committed state:

```js
self.manager.appState.setState(next); self.manager.storage.save(next);   // next carries TEXT only
const minW=...; self.element.style.width=w+'px';                          // width → DOM only
```

The width therefore depends on a later `saveState()` reading it back off the DOM. A
`restoreState()` occurring between the commit and that save recreates the element at the OLD
stored width and the new one is lost. Measured: text `Tirana, Albanien_INV` (20 chars, needs
240 px) rendered in a pill stored at 200 px → `hiddenPx: 32`.

This mechanism is **pre-existing**; it became visible only because the text now survives the
sequence where it previously did not. Attribution checked rather than assumed: `c-license` and
`c-nationality`, which have no override, show `hiddenPx: 0` — so this is the override path, not
a general width fault. It is **not** the `textMinWidth` constant defect (`len*8+80` vs a measured
8.4 px/char advance), which remains separate and out of scope.

### ADR-036 v2 — the invariant, restated against the contract (author, 2026-08-23)

The v1 invariant — *"`state.contacts[].text` must be preserved"* — **no longer describes the
model** and is superseded. Under ADR-037 that field is a mirror maintained by `saveState()` from
`ce.data`; after a language switch it legitimately holds the last rendered value. A test asserting
on it passes in a single-language flow and misleads in a multilingual one. It is not enough that
the old criterion happened to go green.

**The invariant, per contact:**

```
locale-independent  (dictionary identical in de/en/sq)
    the authoritative state value is used,
    and it must survive  render → save → reload.

locale-dependent    (dictionary differs across de/en/sq)
    override[locale] is authoritative for THAT locale
    no override      → dictionary[locale]
    an override made in DE must not affect EN or SQ
    render → save performed in one locale must not destroy
        the overrides belonging to other locales
```

**This is the acceptance criterion for promotion.** A run that checks only `contacts[].text` is
not accepted, because that field is now known to be a mirror rather than the sole authority.

The control clause stands unchanged and is part of the criterion: **changing the contacts'
contract must not change `socialName`'s result, and it must still pass by the same mechanism.**

#### ADR-036 v2 — acceptance run against the restated invariant (2026-08-23)

Sandbox `a71de5fa197606303cf7850333bc2dfe`, isolated origin, clean storage, real typing.
Edits made: `c-email` (locale-independent) `_INVAR`, `c-location` (locale-dependent, in DE) `_DE`,
`socialName` (control) `_CTRL`. Sequence: commit → render → save → language sweep → **save while
displaying SQ** → reload → sample all six contacts in all three languages.

| clause | result |
|---|---|
| C1 locale-independent value used, identical in de/en/sq, survives render·save·reload | **PASS** |
| C2 `override[locale]` authoritative for its own locale | **PASS** |
| C3 no override → `dictionary[locale]`, verified for `c-license` and `c-nationality` in all three | **PASS** |
| C4 a DE override does not affect EN or SQ | **PASS** |
| C5 a save performed in another locale does not destroy other locales' overrides | **PASS** |
| CONTROL `socialName` accepts an edit and holds it in all three languages | **PASS** |
| console errors | none |

Rendered result after reload, `c-location`:
`DE Tirana, Albanien_DE` · `EN Tirana, Albania` · `SQ Tiranë, Albania`.
The stored authority remained `{de:'Tirana, Albanien_DE'}` throughout, while the mirror
`contacts[].text` ended holding `Tiranë, Albania` — the last rendered value, exactly as the
contract permits. A v1-style test asserting on the mirror would have reported failure here; that
is precisely why the criterion was restated.

**Open and NOT part of this run:** BUG-018 (derived dimension not persisted atomically with its
content — the 32 px clip), the `textMinWidth` constant, and `skills-hobby`, which stays outside
ADR-037's population because `state.skills.text` is a different field and needs its own ownership
decision.

#### ADR-037 mobile/touch parity — verified 2026-08-23, iPhone 16 / iOS Safari (WebKit)

Gathered because the ADR-035h touch evidence was taken on build `4c9ab707…`, **before ADR-037
existed**. Ticking it across to `a71de5fa…` would have been a claim about a build nobody had run.

Real taps, real soft keyboard, sandbox `a71de5fa197606303cf7850333bc2dfe`, origin
`http://127.0.0.1:8901`, on storage that already contained a **genuine pre-ADR-037 value**
(`c-location` = `Tirana, AlbanienZ`, non-dictionary, no per-locale override) — so this run also
exercised the migration fallback on real legacy data rather than on a fixture.

| check | result |
|---|---|
| legacy non-dictionary value preserved and rendered | **PASS** — shown, not replaced by the dictionary |
| edit by touch creates a per-locale override | **PASS** — `{"c-location":{"de":"Tirana, AlbanienZ_IOS"}}` read from WebKit's own store |
| DE → SQ: no leak | **PASS** — `Tiranë, Albania`, `Patentë: Klasa B, C`, `Shqiptar` |
| SQ → EN: no leak | **PASS** — `Tirana, Albania`, `Driver's License: Class B, C`, `Albanian` |
| EN → DE: override returns | **PASS** — `Tirana, AlbanienZ_IOS` |
| locale-invariant contacts identical in all three | **PASS** — email and phone unchanged throughout |

Language switching was driven through the app's own flag control by touch, not by calling
`setLanguage()` — the UI path, on the engine the author actually uses on their phone.

---

## V491 — PROMOTED 2026-08-23 22:19:58

**Declared package, not "ADR-037 was promoted".**

```
V490  b41432793e023d07238a47bc77b00f7c   ← ROLLBACK POINT, frozen
  │
  ├── ADR-035h   REQUIRED DEPENDENCY
  │     └── input/event regression fix — `node||el` accepted the InputEvent, committing ''
  │
  └── ADR-037    PRIMARY CHANGE
        └── contact ownership + locale-aware override
  ▼
V491  a71de5fa197606303cf7850333bc2dfe   ← index.html == 491.html == index-test.html
```

035h is recorded as a dependency rather than folded into ADR-037 because **ADR-037 is inert
without it**: with the regression live, `commitText` receives the Event, `val` is `''`, and
`_cvWithContactOverride` would write an empty override that the resolver rejects. A V491
carrying only 035h would have been worse than either endpoint — edits would land in state and
then be destroyed by the contact contract on the next render/save/reload.

**Verified before promotion:** functional (comment-free) diff = three type guards + the ADR-037
mechanism, nothing else; five excluded code paths byte-identical to V490; ADR-036 v2 clauses
C1–C5; `socialName` regression guard; locale isolation; reload; and ADR-037 re-verified on
iOS/WebKit by real touch on this exact build.

**Post-promotion check against the author's real data** (read-only, no edit made): all six
contacts render unchanged. Every stored value equals a dictionary value — the residue of the
defect just fixed — so the migration heuristic correctly treats them all as "no override" and the
dictionary supplies each locale. `content.terminal1.contacts` is absent, as it should be until a
first edit. Zero console errors. **The CV looks exactly as it did; the difference is that an edit
will now survive.**

### LIMITATION — written down deliberately

**V491 does NOT fix BUG-018 and does NOT fix the `textMinWidth` constant.**

If a width/content mismatch appears after this promotion — text clipped inside a pill that is too
narrow — it **must not be read as a regression of ADR-035h or ADR-037**. It is BUG-018, already
identified, measured (32 px on an overridden contact) and separated before promotion, with its
mechanism recorded: `commitText` writes the recomputed width to the DOM only, after `setState`
and `save`, so a `restoreState()` in between discards it.

`skills-hobby` also remains untouched and still overwrites its text from the dictionary
unconditionally; it is a different field (`state.skills.text`) and needs its own ownership decision.

Write captured by the passive watcher: in-place, inode 28319192 unchanged, no process holding the
file, size 1175930.

---

## OPEN QUESTION — is `cvStaticFallback` a snapshot or a representation?

**Raised 2026-08-23 from an analysis-only investigation. NOT opened as a bug, deliberately:
the answer is an ownership decision, not a fix. No code changed.**

### What was measured

Opening the project from the iOS **Files** app has exactly ONE path, not two: iOS Safari
**refuses to display a `file://` HTML document** — it offers "Save to Files" instead. So the
only renderer is **Quick Look**, which does not execute JavaScript. The `<html class="no-js">`
→ `js` swap therefore never runs and `#cvStaticFallback` is what the user sees. That part is
by design and works well.

**Works** (measured on a booted simulator): full CV renders — Personal, Fähigkeiten,
Fremdsprachen with progress bars, Erfahrungen, Ausbildung/Qualifikationen, the complete
Motivationsschreiben; scroll; pinch zoom; share sheet with **Print** (→ PDF), Copy, Save to Files.
`width=1200` persists so the whole CV fits, zoomed out.

**Not available** (expected, not a regression): editing (tapped a contact — no keyboard, only a
`:hover` style change), language switching, undo/redo, drag, any `localStorage` persistence,
and the real profile photo (the fallback carries a placeholder SVG).

### The finding that matters

**The app never touches the fallback.** Of 192 occurrences of `cvStaticFallback`, **191 are CSS
selectors** and the last is the `id` attribute itself — zero `getElementById`, zero
`querySelector`, zero writes. It is a hand-baked snapshot (its own comment dates it to V408;
production is now V491).

And it is a snapshot of **one language**:

```
fallback          Tirana, Albanien · Albanisch     ← equals dict.de
getDefaultState   Tiranë, Albania  · Shqiptar      ← different
```

So divergence has two axes, not one: **staleness** and **locale-freezing**. The second became
sharper with ADR-037, which allows state to hold up to three per-locale versions while the file
holds one German snapshot.

**Current divergence: ZERO.** The author's real state still carries no override
(`content.terminal1.contacts` absent), so the fallback matches what the app renders in DE today.
**The first real edit creates the split** — silently, with no error anywhere.

### The question to decide (not decided here)

- **Snapshot** — the fallback is an export/viewing artefact, deliberately frozen, and drift is
  accepted. Then the open item is only *when* it gets re-baked, and by what process.
- **Representation** — it must stay consistent with state. Then something has to generate it,
  and the locale axis has to be answered too: which language does a single static file show?

Until that is answered, "fix the fallback" has no defined target.

### Evidence limitation, recorded rather than smoothed over

The author asked about **iPhone 11 Pro Max (414×896 pt)**. That device is **not installed** as a
simulator on this machine. Testing ran on **iPhone 16 (393×852 pt)**.

```
iPhone 16          → TESTED
iPhone 11 Pro Max  → NOT TESTED
```

The viewport difference is not expected to change the behaviour category for a fallback pinned at
`width:1200px`, but that is an **inference, not a measurement**, and must not be recorded as a pass.

### Measured input to the decision: a generated export ALREADY exists — and it produces PDF

Traced 2026-08-23, analysis only. The option "a representation generated at export time" is not
hypothetical in this codebase; it is built, and its output is **PDF, not HTML**:

```
document.documentElement.outerHTML   ← parent document, live DOM
  + frame.contentDocument…outerHTML  ← iframe document, live DOM
  → iframe element replaced by the serialized frame
  → ALL <script> stripped
  → ExportTheme injected before </head>
  → body forced to data-export="pdf"
return exportHtml   →   /* Module 4: PdfPipeline — render iframe, capture canvas, build PDF */
```

`exportHtml` is an **intermediate**, never delivered as a file: no `Blob`, no `download`
attribute, no `createObjectURL` anywhere on that path. The only downloadable artefact is the PDF
(`pdf.output('blob')` + `<a download>` in `_downloadCascade`).

Because it serializes the **live DOM**, that PDF always carries the author's current state,
including any ADR-037 per-locale override, in whatever language is on screen at the time.

**How this narrows the question:**

```
exported PDF        → always current · Quick Look renders it natively · zero divergence
index.html in Files → the app itself · no JS · the static fallback is what shows
```

If the PDF is the sharing/viewing artefact, then `cvStaticFallback`'s job is not to represent
state — it is to keep the app file from rendering blank if someone taps it. That is graceful
degradation, not a representation, and it argues for **SNAPSHOT**, with drift accepted by design
rather than treated as debt.

This does not decide the contract. It removes one branch from guesswork: no export mechanism needs
inventing, because one exists — it simply emits PDF rather than HTML.

### The canonical source, mapped — input for the `cvStaticFallback` ADR (2026-08-23)

`editorContent` was measured and is **a DEAD FIELD, not a bug**: `captureCurrentState()` works
(it returns the live edit), but the branch that would persist it tests `window.appState` **from
inside the iframe**, where `appState` is undefined. It is never written, causes no data loss, and
is authority for nothing. It must not enter this ADR.

The real owner was found, and it works. Everything editable persists as **LocalizedText per
language**:

```
content.terminal1 → contacts · header · professional_desc · social
content.terminal2 → skills
content.terminal3 → languages
content.terminal4 → experiences
content.terminal5 → education · qualifications
content.terminal6 → motivation
```

plus the flat `contacts` / `skills` / `prof` / `skillsItems` that carry Terminal 1's canvas
geometry and the render mirror.

Commit triggers differ by layer and this matters when testing: **Terminal 1 commits on `input`**
(300 ms debounce — the ADR-035h/037 path); **every lower-terminal field commits on `blur`**.
Measured paths that survived a reload: `content.terminal2.skills.columns.0.items.0.de` and
`content.terminal4.experiences.title.de`.

Note that `terminal1.contacts` — the node ADR-037 introduced — slots into a pattern that already
existed (`header`, `social`, `professional_desc`). ADR-037 did not invent a shape; it joined one.

**What this gives the fallback decision:**

1. The source is single and coherent — a generated representation has something to generate from.
2. The locale question has ONE answer covering all six terminals, not six separate answers.
3. The constraint is now quantified, not vague: **a single static HTML can represent exactly one
   of three languages**, because every editable field in the product exists in three variants.

### Two hard constraints, measured before the ADR is written (2026-08-23)

**On "which process generates the fallback" — the state has no file representation.**
There is no state import/export: `application/json` appears twice and both are drag-and-drop
`dataTransfer`; `input type="file"` is the photo upload (`motPhotoInput`, images only); there is
no `importState` / `exportState`. The canonical state exists **only in the browser's
`localStorage`**.

Two consequences that constrain the mechanism before it is chosen:

- **No script outside the browser can read the state** — it is not on disk in any form. A Node or
  shell build step has nothing to read.
- **A browser page cannot write its own source file.**

Therefore any generation path necessarily includes a human step: the app produces the HTML in the
browser and hands it over, the author replaces the file. That is not a design preference, it is a
property of the current architecture — and it can only be removed by changing where state lives,
which is a larger decision than this ADR.

The existing export pipeline already has exactly this shape (serialize the live DOM → deliver an
artefact); it simply emits PDF rather than HTML.

**On "when is the snapshot stale" — the mechanism already exists.**
`state.timestamp = Date.now()` is written on every save. Staleness is therefore mechanically
decidable: the snapshot records the state timestamp it was baked from, and
`state.timestamp > snapshot.bakedFrom` means stale. No new source of truth, no new mechanism —
which matters under the project's own no-new-source-of-truth rule.

#### Correction to the staleness claim above (author, 2026-08-23)

The wording "staleness is mechanically decidable" was **too strong** and is corrected here rather
than edited away. `state.timestamp` is a **staleness indicator**, not proof that a snapshot equals
a given state. The relation is asymmetric:

```
state.timestamp  >  snapshot.bakedFrom   → the snapshot is definitely POTENTIALLY stale
state.timestamp ==  snapshot.bakedFrom   → same save time only;
                                           NOT proof that the baked content equals the state
```

**The failure direction matters and lands on the dangerous side.** A false "stale" is harmless —
an unnecessary re-bake. A false "in sync" is not: it reports agreement that may not exist, and a
signal that can wrongly say "fresh" is worse than no signal, because it creates confidence.

So `state.timestamp` is sufficient to RAISE the alarm and insufficient to CLEAR it. Proving
equality would need a content digest of the baked output. **No such digest exists today.** It
would not be a new source of truth — a digest is a derived value, not an authority — so it does
not conflict with the no-new-source-of-truth rule, but it is something to add, not something
already available.

---

## ADR-038 — `cvStaticFallback` is a generated static snapshot of canonical state

**Status: DECIDED by the author 2026-08-23. Implementation NOT authorized. No code written.
The digest of clause 4 is explicitly NOT authorized.**

### Decision

> `cvStaticFallback` is **not** a data source and **not** an alternative copy of state. It is a
> **static snapshot of the CV, for use when the JavaScript runtime is unavailable** — concretely
> the `Files → Quick Look` path on iOS.
>
> Its **owner is the CV representation/export layer**, not `localStorage` and not the interactive
> runtime.

In one line:

```
cvStaticFallback = generated static snapshot of canonical AppState,
                   one locale per snapshot,
                   with explicit provenance / freshness metadata.
```

The owner was chosen from the **function the component must serve**, not from who could most
easily be made responsible for writing it. That distinction is deliberate: it is the same trap
ADR-031 named and paid for, where deriving a contract from the current implementation would have
produced an audit that passed and a system that had not changed.

### The contract

1. **Canonical source** — canonical state remains `localStorage` / AppState.
2. **Representation** — `cvStaticFallback` represents a snapshot generated from that state.
3. **Locale** — every static snapshot represents exactly ONE locale, and that locale must be
   **declared**, not inferred from whatever the DOM happened to contain.
4. **Freshness** — the snapshot carries a declared `bakedFrom` / timestamp.
   `state.timestamp > snapshot.bakedFrom` marks it **potentially stale**; timestamp equality is
   **not** treated as proof of synchronisation.
5. **Update mechanism** — because state lives only in `localStorage` and the page cannot rewrite
   `index.html`, re-baking is a **declared generation/export process**, never an automatic
   synchronisation of the source file.
6. **Failure semantics** — a stale snapshot must not claim to be current, but must remain
   functional as a static fallback.
7. **Scope** — the contract covers the whole CV represented by all six terminals, not Terminal 1
   alone.

### What actually changes — and what only gets ratified

This separation matters: three clauses describe today's reality and three introduce something that
does not exist at all.

| # | today (measured) | under the contract | effect |
|---|---|---|---|
| 1 | state is canonical in `localStorage` | unchanged | **RATIFIES** |
| 2 | fallback is hand-baked HTML, generated by nobody | a snapshot generated **from state** | **CHANGES** |
| 3 | locale is **implicit** — it is DE, discoverable only by comparing the baked text against `dict.de` | locale **declared** in the snapshot | **NEW** |
| 4 | no provenance of any kind | `bakedFrom` recorded | **NEW** |
| 5 | no defined re-bake process; the file was edited by hand at V408 | a declared generation/export process | **CHANGES** |
| 6 | a stale snapshot is silently presented as the CV | must not claim currency; stays functional | **NEW** |
| 7 | the baked HTML already covers all six terminals | unchanged | **RATIFIES** |

So the contract adds **three declarations** (locale, provenance, honesty-when-stale) and changes
**two processes** (who generates, how it is re-baked). Clauses 1 and 7 are confirmations, and are
written down precisely so nobody later "implements" them as though they were changes.

### Consequence the ADR records rather than letting implementation discover

Clause 6 requires a stale snapshot not to claim currency. Anything rendered into the fallback to
express that — a marker, a date, a banner — **also appears in whatever the author prints from
Quick Look**, because Print → PDF renders the same document. So clause 6 cannot be satisfied by a
visible marker without deciding what happens to it on the printed CV. That tension is real, it
belongs to this contract, and it is left open here rather than resolved by whoever writes the code.

### On the digest — proposed answer: NOT needed for the minimal contract

The author reserved this. My assessment, stated plainly rather than hedged: **clause 4 as written
does not require a digest.** It only asks the freshness signal to be sound in the alarm direction,
and it already forbids reading timestamp equality as proof. A digest would be needed only if the
contract were strengthened to *prove* synchronisation — which clause 4 deliberately does not claim.
Adding one now would be building a mechanism for a promise the contract does not make.

### Not in this ADR

- Implementation of any kind.
- BUG-018 (derived dimension not persisted atomically) and the `textMinWidth` constant.
- `editorContent`, classified DEAD FIELD — no data loss, not on the real path, authority for
  nothing.
- Any change to the PDF export pipeline, which remains a separate mechanism and does not replace
  the HTML contract used by the Files path.

**Acceptance for this ADR is verification of the contract itself, not of code.** V491 stays frozen:
`index.html` = `a71de5fa197606303cf7850333bc2dfe`.

### ADR-038 AMENDMENT — C2, C4, C7 decided (author, 2026-08-23)

The acceptance audit returned `BLOCKER 1 · QUESTION 2 · PASS 4`. All three are resolved here by
decision, not by measurement. Implementation remains **NOT authorized**.

#### C2 — DECIDED: option (a), `seed ⊕ canonical AppState`

> The fallback represents the CV produced by the **canonical seed overlaid with AppState
> overrides**. The rendered DOM is **not** an authority; serializing it would make the DOM the
> source and would confuse the contract with its implementation.

```
seed  +  canonical AppState  →  rendered CV  →  static fallback snapshot
NOT:  DOM → fallback
```

This also explains why state does not contain every string in the CV: defaults live in the seed,
AppState holds only the overrides.

**Precision added when writing this clause, and flagged as mine rather than the author's:** "seed"
is **not one artefact**. It has two distinct forms, and an implementation that merges only one
would silently drop the other:

| layer | seed source |
|---|---|
| Terminal 1 (contacts, header, social, professional_desc) | `getDefaultState()` + `TranslationManager.TRANSLATIONS` — the dictionary, per ADR-037 |
| Terminals 2–6 | the `<template id="bodyFrameSrcdoc">` HTML (152 KB) |

Naming both is factual precision about what the seed *is*, not a normative change to the author's
decision. It is called out because ADR-037 was created by exactly this class of omission.

#### C4 — DECIDED: one-way signal, no digest

> `state.timestamp > snapshot.bakedFrom` ⇒ the snapshot is **potentially stale**, and may not be
> treated as proof of currency.
> `state.timestamp == snapshot.bakedFrom` ⇒ **does not prove** the snapshot is identical.

`state.timestamp` is a **state-mutation timestamp**, not a content-freshness timestamp — `save()`
writes `Date.now()` unconditionally, so a 1 px drag bumps it. The contract therefore claims only
what the signal can support. Distinguishing content changes from geometry changes would require a
content digest; that is **explicitly deferred to a separate ADR** and not authorized here.

#### C7 — DECIDED: the profile photo enters canonical AppState

> The fallback contract covers the whole CV including the photograph. The photograph must
> therefore become part of canonical state and be restored from it.

This resolves the blocker: today `profileImage.src` is assigned in exactly one place
(`reader.onload`) with no `setState` and no `storage.save`, no path restores it, and the persisted
state has no photo field — so the photo is DOM-only and lost on reload. That is an architectural
change required by ADR-038, not a fallback fix, and it is recorded as such.

**Measured constraint on the implementation, recorded so it is not discovered later.** The upload
limit is 5 MB, which is ≈6.85 MB as a base64 data URI. Storage capacity is not the problem —
probing this engine reached 20 MB with no error (the probe hit its own ceiling, so the real quota
is **≥20 MB**; measured in **Blink only**, WebKit not measured). The problem is the save path,
because `storage.save()` stringifies the entire state on **every commit**:

| photo | state JSON | `JSON.stringify` + `setItem` |
|---|---|---|
| none | 0.02 MB | **0.3 ms** |
| 1 MB | 1.02 MB | 17.5 ms |
| 3 MB | 3.02 MB | 50.7 ms |
| 6.85 MB | 6.87 MB | **116 ms** |

116 ms of synchronous main-thread work on every debounced text commit is roughly seven dropped
frames, while typing. **This does not invalidate the contract** — "canonical state" does not
dictate that everything share one JSON blob. It constrains the storage layout that implementation
may choose, and that choice is not made here.

### ADR-038 AMENDMENT 2 — C2 approved, C7 resolved as option (b) (author, 2026-08-23)

**C2 — APPROVED as written, with the mechanism/authority distinction made explicit.**

> `seed ⊕ AppState → render into a DOM → serialize the snapshot`.
> The DOM is permitted as a **rendering/serialization mechanism**. It is **never an authority**.
> Authority is the seed plus canonical AppState; the DOM is a buffer that happens to be the
> convenient way to compose them.

**C7 — RESOLVED: option (b).**

> The photograph is part of the canonical authority of AppState, but the **binary payload is
> stored in a separate storage key**. AppState holds the reference/metadata that binds it.
> Base64 image data must **not** live inside the main state blob.

Grounds: measured. With the photo inside the blob, `storage.save()` — the single write path, with
no partial-save route — stringifies ~6.87 MB on **every** text commit: 116 ms of synchronous
main-thread work while typing, against 0.3 ms today. `cv_language` establishes that canonical data
may have separate physical storage without creating a second authority.

#### New normative consequences of choosing (b) — reported before any code

**1. The `cv_language` precedent does NOT transfer cleanly, and the difference matters.**
`cv_language` is a **mirror**: `state.language` is authoritative and `loadState` rewrites the key
from state, so losing the key loses nothing. **The photo key is not a mirror** — the bytes exist
nowhere else. The discipline that makes `cv_language` safe (state overwrites the key on load) is
therefore *unavailable* here, and applying it literally would erase the photo on every load.

The correct shape is **authority split by aspect, not duplicated**: AppState is authoritative over
*which* photo is current (the reference/metadata); the separate key holds *the bytes*. Neither is
a copy of the other, so there is no second source of truth — but this must be written down, or an
implementer following the `cv_language` example will implement mirror semantics and destroy data.

**2. C4's staleness signal goes blind to photo changes unless the reference changes with them.**
`state.timestamp` only advances when state is saved. Under option (a) any photo change *was* a
state change. Under (b), a write that touches only the photo key leaves `state.timestamp`
untouched, so a snapshot baked before a photo swap would still look fresh — **a false "in sync",
which is exactly the failure direction C4 was written to forbid.**

Therefore, as a required property of (b): **changing the photo must change the AppState reference
and be saved through the normal path.** Without that, C4 is silently weakened by C7.

**3. The snapshot grows by the photo, and it lands in the file the author actually opens.**
`index.html` is 1.12 MB today; a maximum photo adds ~6.85 MB as a data URI, giving a snapshot of
**~7.97 MB — roughly six times the current file**, to be loaded by Quick Look on a phone. This does
not conflict with any clause, and it is a consequence of C7 rather than of (b) — option (a) would
produce the same file. It is recorded because it affects the very workflow ADR-038 exists to serve,
and because the upload cap (5 MB) is the only thing currently bounding it.

**No clause is contradicted by any of the three.** Consequences 1 and 2 are requirements that (b)
imposes on implementation; consequence 3 is a property of the contract that the author may wish to
bound separately.

---

## ADR-039 — Kontrata e Aftësive CSS-only (Quick Look)

**Data:** 2026-08-27 · **Statusi:** ACCEPTED · **Prodhimi:** V492 `56b0c30757f79a36a8e1afe4169a1ea9`

### Konteksti

Modeli i punës deri më 2026-08-27 ishte *"artefakti statik është inert"*. Ai model ishte **i gabuar** dhe u përgënjeshtrua nga vëzhgimi i përdoruesit se pikat e terminaleve funksionojnë në iPhone, i konfirmuar pastaj me matje.

Kufiri i vërtetë nuk është *statik kundrejt interaktiv*. Është:

> **"ndryshon PAMJEN" (CSS e mbërrin) kundrejt "ndryshon DOKUMENTIN" (kërkon JS).**

**Provë që Quick Look ekzekuton zero JavaScript** — strukturore, jo empirike:

```css
#cvStaticFallback{display:none}
html.no-js #cvStaticFallback{display:block!important}
```

Fallback-u shfaqet **vetëm** kur `<html class="no-js">`; JS-i e heq atë klasë sapo starton. Nëse e shohim fallback-un, JS-i nuk ka startuar.

Aftësitë nuk ishin aksident: V376 dhe V380–V391 i ndërtuan **qëllimisht**. Ato u ndërtuan, por **nuk u deklaruan kurrë si kontratë** — pikërisht defekti që ADR-031 emërton: *modeli ekziston, por nuk është i deklaruar*.

### Vendimi

**Të 11 aftësitë e mëposhtme deklarohen si KONTRATË e prodhimit.** Ato nuk janë efekte anësore të implementimit; ato janë sjellje e premtuar, dhe çdo ndryshim që i heq është **regresion**, jo thjeshtim.

| # | Aftësia | Mekanizmi |
|---|---|---|
| 1 | Minimizo terminalin 🟡 | `radio.ts-min` + `:has()` |
| 2 | Rikthe terminalin 🟢 | `radio.ts-restore`, i njëjti grup |
| 3 | Mbyll terminalin 🔴 (T2–T6) | `checkbox.tw-close` + `:has()` |
| 4 | Renderim i plotë i 6 terminaleve | Markup i pjekur |
| 5 | Animacione & tranzicione | 7 `@keyframes` |
| 6 | Lidhja `mailto:` | `<a class="cv-ql-link">` |
| 7 | Lidhja `tel:` | Ndërtim identik |
| 8 | Rrëshqitja | Native |
| 9 | Zvogëlim-për-përshtatje | `<meta viewport content="width=1200">` |
| 10 | Toolbar i hapur në prekje | `@media (hover:hover) and (pointer:fine)` **e përjashton** palosjen |
| 11 | Përzgjedhja e tekstit | Mungesa e `user-select:none` |

### Mekanizmi — TRE rregulla, jo më shumë

```css
#cvStaticFallback .terminal:has(.ts-min:checked) .terminal-body{display:none!important}
#cvStaticFallback .terminal:has(.ts-min:checked) .terminal-window{min-height:0!important}
#cvStaticFallback .terminal:has(.tw-close:checked){display:none!important}
```

**`ts-restore` NUK ka rregull të vetin.** Puna e tij e vetme është të jetë radio motër në grupin `ts-{terminalId}`: kur zgjidhet, `ts-min` çzgjidhet. Prej kësaj rrjedh një veti që duhet kuptuar, jo "rregulluar":

> **Një radio nuk mund ta çzgjedhë vetveten.** Prandaj trokitja e dytë mbi të verdhën **nuk bën asgjë** — matur në iPhone 16 / iOS 27.0. Rikthimi bëhet nga e gjelbra. Kjo është sjellje e projektuar.

### Invariantet — çfarë e prish kontratën

| # | Invarianti | Nëse thyhet |
|---|---|---|
| I1 | Chrome-i emetohet si `<label>` + `<input>` fshehur | Aftësitë 1–3 zhduken |
| I2 | `name="ts-{terminalId}"` izolon çdo terminal | Terminalet ndikojnë njëri-tjetrin |
| I3 | Të tria rregullat `:has()` mbeten të skopuara te `#cvStaticFallback` | Prek aplikacionin e gjallë |
| I4 | Asnjë `<script>` në artefaktin e gjeneruar | Nuk është më no-JS |
| I5 | `viewport width=1200` nuk ndryshohet pa JS | Aftësia 9 |
| I6 | Asnjë `user-select:none` mbi përmbajtjen e CV-së | Aftësia 11 |
| I7 | Palosja e toolbar-it mbetet brenda `@media (hover:hover) and (pointer:fine)` | Aftësia 10 humbet në prekje |

### Asimetritë e QËLLIMSHME — riprodhohen, nuk normalizohen

Të tria u matën dhe **nuk janë mospastërti**:

| Asimetria | Arsyeja |
|---|---|
| `personal` **pa** `tpl-*`; T2–T6 **me** `tpl-default` | T1 vjen nga dokumenti i jashtëm, T2–T6 nga `srcdoc` |
| `tw-close` = **5**, jo 6 | V391: × e T1 është dekorative — mbyllja do të fshihte vetë header-in e CV-së |
| 🔴 e T1 është `<span>`, jo `<label>`, me `cursor:default` | E njëjta arsye; deklaruar shprehimisht |

> **Kompozitori riprodhon modelin autoritativ. Nuk barazon struktura që janë realisht të ndryshme, sepse barazimi duket më elegant.**

### Verifikimi

Kontrata provohet me teste **të ekzekutueshme**, jo me përshkrime — sepse ky cikël tregoi se përshkrimet devijojnë nga kodi ndërsa testet jo (shih ADR-039-A më poshtë).

```text
CHROME_CONTRACT      17 label · 6 ts-min · 6 ts-restore · 5 tw-close · name=ts-{id}
ASYMMETRY_PRESERVED  personal pa tpl-* · tw-close = 5
NO_EDITOR_CHROME     pohim NEGATIV — 0 butona krom editori
DESIGN_IDENTITY      dështon PARA renderimit nëse `design` s'ka klasë CSS
LOCALE_PROVENANCE    locale nga persistedState.language; divergjenca regjistrohet
TOOLBAR_INERT        zbaton klauzolën e kushtëzimit të R6
NO_FALSE_AFFORDANCE  asnjë kontroll i klikueshëm pa sjellje
```

Pranimi funksional kryhet **në iPhone real, në Quick Look** — jo me analizë statike. V492: **11/11**.

### ADR-039-A — Përse dokumentimi u korrigjua bashkë me deklarimin

Komenti V388 në burim përshkruante sjellje që **nuk ekziston**:

| Komenti thoshte | Kodi bën |
|---|---|
| "`<label>`s wrapping a hidden **checkbox**" | 2 nga 3 janë **radio** |
| "minus = collapse (**tap again to restore**)" | Trokitja e dytë s'bën asgjë |
| "green = **maximize fullscreen overlay**" | E gjelbra = *restore*; `ts-max` = **0** shfaqje |

Kjo nuk është pedanteri. Një implementues që i beson këto tri pohime do të ndërtojë mbi premisa të rreme. **Komenti është përfaqësim; kodi është burimi** — dhe kur ato bien ndesh, korrigjohet përfaqësimi.

### Regjistri `OBSERVED / NOT CONTRACTED`

Këto u matën dhe **nuk hyjnë në kontratë**. Nuk janë defekte. Rihapja e secilës kërkon **kriter normativ → matje → autorizim**, kurrë "u vu re, pra duhet rregulluar".

| Çështja | Ku ekziston | Pasojë e matur |
|---|---|---|
| Rendi i kontakteve T1 në DOM | Dalja e kompozitorit | Vizuale: **asnjë** (`position:absolute`); VoiceOver/përzgjedhje: **po** |
| `id` +7 | Vetëm snapshot | Asnjë |
| `data-state-driven` +4 | Vetëm snapshot | Asnjë — 0 selektorë CSS |
| `cursor:pointer` mbi `.flag-button`·`.contact-icon`·`img.profile-image` | Fallback | Simptomë **vetëm-desktop**; në iPhone kursor s'ekziston. Pamja e prekshme **NUK U MAT** |
| Whitelist i dyfishuar i template-it | **Kod i gjallë V492** | Latent: një template i ri te regjistri kthehet te `default` **në heshtje** |

### Vendime të lidhura

- **ADR-031** — ky ADR është zbatim i parimit të tij: *problemi nuk është se ekzistojnë dy modele, është se modeli nuk është i deklaruar.*
- **ADR-038** — kontrata e `cvStaticFallback`, që prodhon artefaktin mbi të cilin këto aftësi maten.
- **C6 (preview-mode CSS-only) = REFUSED**, jo pending — matur: 52 rregulla, tri regresive (fsheh toolbar-in, vret `user-select`, fsheh `85%`).

---

## ADR-040 — Where is a promotion recorded? The Role 2 registry has no declared home

**Status:** 🟡 **OPEN — deliberately not decided.** Recorded so the question survives the cycle that found it.

**Date:** 2026-08-28 · **Cycle:** AMENDMENT-01 Part I (Constitution draft, sandbox only; production V492 `56b0c307` untouched throughout)

> **This ADR does not make ARCHITECTURE_DECISIONS.md the promotion ledger.** It records an open
> architectural *question* — which is this document's declared purpose. A ledger would answer *what
> happened, when, with which hashes*; that is a different object, and choosing its home is exactly
> what stays open below. Do not read this entry as the precedent that settled it.

### Context

AMENDMENT-01 Part I (draft) introduces four artifact roles and makes **Role 2 (Release Snapshot = `NNN.html`)** a status conferred **only by promotion**, never inferred from a file's name, hash, date or mtime. Two clauses follow:

- **22.5(f)** — Role 2 must be *declared* inside the promotion transaction.
- **6.9(e)** — that declaration is a formal step of the promotion.

Neither says **where** the declaration is recorded. Without a declared location, the same drift that produced this question recurs.

### What was measured, not assumed

| Finding | Measurement |
|---|---|
| Constitutional standing | **2 of 17** project `.md` files are named in the Constitution: this file and `DOMAIN_SPECIFICATION.md`. Hierarchy: Kushtetutë → ADR → Domain Specification → Kod |
| No standing | `RELEASE_PROCESS.md`, `BACKUP_INDEX.md`, `METHOD.md`, `ARCHITECTURE.md` — zero mentions in the Constitution |
| `METHOD.md`'s model | Three levels — State (`BACKUP_INDEX`, `BUGS`) · Decisions (this file) · Method (itself). **`RELEASE_PROCESS.md` is not in it.** **No level is "what happened, when, with which hashes."** |
| Where records actually live | `ARCHITECTURE_DECISIONS.md`: V488, V489, V490, V491 · `V492_POST_PROMOTION_AUDIT.md`: V492 — **split across two kinds of place**, which is what happens when a record has no declared home |

A promotion is an **event**. It is not current state, not decision rationale, not method. The existing three-level model has no slot for it.

### The three candidates and their measured obstacles

| Candidate | In its favour | Obstacle (measured) |
|---|---|---|
| **This file (ADR)** | constitutional standing; append-only, supersede never delete — a real ledger property | Its declared purpose is *why a decision was made*, not *what happened when*. Housing the ledger here repeats the conflation `METHOD.md` §0 was written to end: *"the method was being written down inside state documents… The method would have left with them."* |
| **`RELEASE_PROCESS.md`** | already holds the baseline table; is the promotion procedure | No constitutional standing · absent from `METHOD.md`'s model · **demonstrated drift**: its table names V487 as production while production is V492, and its restore command points at `index.html.bak-v486-baseline`, which no longer exists |
| **A new dedicated registry** | cleanest separation of event / decision / procedure | Adds a document, and the file that would have to name it — `METHOD.md` — is **FROZEN** until BUG-017 closes, ADR-031 lands, and the first ADR-034 cycle completes |

### Decision

**None taken.** The third candidate is the most coherent and is blocked by a freeze imposed for unrelated reasons; deciding now would either break that freeze or pick a weaker option because it happens to be available. Neither is a reason.

**The Constitution may require that an event be recorded without yet naming the artifact that is its registry.** `22.5(f)` and `6.9(e)` stand as obligations; the canonical location stays open.

### Consequences

- `22.5(f)` and `6.9(e)` remain in force in the draft, obligation intact.
- Until the location is decided, a promotion satisfies `6.9(e)` by recording the declaration in the transaction's own documentation. This is **practice, not a designation** — it confers no authority on any document and creates no precedent.
- Revisit when the documentation architecture may legitimately be touched, i.e. when `METHOD.md`'s freeze lifts.

### Explicitly NOT used as argument here

Two defects were found while measuring this question. Neither is evidence for any candidate, and both are tracked separately — using a defect found in one document to justify a decision about another is exactly the reasoning this cycle has been removing:

1. **`METHOD.md` cites "ADR-030 Inv-1 (one authoritative source per fact)"** to justify its three-level split. Inv-1 was written about **snapshot data** — *"forbids storing what can be derived"*. Extending it to documents is an analogy. This file marks such extensions when it makes them (*"here applied to a UI rule rather than to evidence"*, line ~1680); `METHOD.md` does not mark its own. **Open: was the extension authorised, or is it an unjustified analogy?**
2. **Line ~1679 of this file mis-cites "Neni 5 (single source of truth)".** Neni 5 is *Arkitektura Single-File*; Single Source of Truth is **Neni 7**. A concrete referential defect, to be corrected in place, separately.

### Related

- **AMENDMENT-01 Part I** — draft in `index-test.html` only, `DRAFT — NUK ËSHTË NË FUQI`. Production `index.html` V492 `56b0c30757f79a36a8e1afe4169a1ea9` untouched.
- **`AMENDMENT_01_CONFLICT_AUDIT.md`** — the frozen audit that produced the roles. Note its §3.1: two protected pre-promotion backups no longer exist, and their content survived **only** in `NNN.html` — the class the Constitution does not protect. That is what made Role 2 worth defining.
- **22.5(h) — WITHDRAWN.** It assumed the declaration was never made for V488–V492. Measurement falsified that: all five have transactional records. The real defect is documentary drift in `RELEASE_PROCESS.md`, not a missing historical declaration.

---

## ADR-041 — The exported artefact is decided by scope, never by the visible view

**Status:** ACCEPTED · promoted in V501 (2026-09-02) · production `5267701c9c45cdeee3c432172f254862`

### Context

`ExportPreparer.prepare()` builds the export by serialising the **live** document
(`'<!DOCTYPE html>' + document.documentElement.outerHTML`). Everything on `<body>` travels with it,
including state classes. `a4-mode` is such a class, and it carries real layout authority:

```css
body.a4-mode .main-container>.terminal{display:none!important}
body.a4-mode #bodyFrameWrap{display:none!important}
body.a4-mode #a4DocView{display:flex;…}
```

So a **CV** export taken while the user was viewing the A4 document produced the **document** — and
produced it wrongly, because the clone is laid out at `config.width` (1200px) rather than the live
width. The text re-flows; the pagination pushes are frozen `margin-top` numbers computed for the old
width; content lands in the inter-sheet gaps.

Four hypotheses missed this over several sessions (the html-to-image branch, render scale, preview
destroying pagination, three parallel pagination engines). Two of those produced real, correct fixes
for other defects. None of them was this one — because **the CV export never produced a CV to look
at**, so the symptom was always read as a document-pagination bug.

### Decision

**An export's content is a function of `config.scope` alone.** No view state may change what a given
scope produces. `prepare()` therefore removes `a4-mode` for the duration of the capture when
`config.scope !== 'document'`, and restores it immediately.

The removal is **synchronous end-to-end** — there is no `await` between it and `unpctize()` — so the
browser cannot repaint between the two. This is not an optimisation: it is what makes the change
invisible to the user *and* what lets `pctize()` measure the terminals while they are laid out
instead of `display:none`. It reuses the *mutate → serialise → restore* contract the same function
already applies via `pctize`/`unpctize`.

`scope: 'document'` keeps its dedicated, genuinely paginated path (`renderDocToA4Pdf` /
`renderDocToCanvas`) and is never routed through `prepare()`.

### Consequences

- A CV or motivation export is now identical whether or not the user is looking at the document.
- The guard is explicit rather than implied by the call graph (Neni 82). `prepare()` is currently
  unreachable for `scope === 'document'`; the condition documents the invariant and survives a
  future change to that routing.
- **This ADR does not claim the export path is now correct in general.** It fixes which *subject* is
  exported. A separate, pre-existing defect remains in *how* the CV is exported — see below.

### What this ADR deliberately does NOT cover

The terminal title renders left-aligned in the CV export (measured: text spans `x 88–678`, centroid
`393`, image centre `1800`). This was **proven pre-existing, not introduced here**:

- the control export with `a4-mode` off — where this ADR's code executes nothing, its guard being a
  boolean AND with a false operand — reproduces the identical offset;
- the diff of the change adds 16 lines and removes none.

Cause: `.terminal-title` centres through `position:absolute; inset:0; margin:auto; width:fit-content`,
which relies on the used width being **definite**. `html2canvas` does not resolve `fit-content`, so
the width falls back to `auto`, the auto margins resolve to 0, and the box sticks to `left:0`.
`#section-skills .terminal-title` escapes it only because a separate rule makes it `position:static`.

Held back under Neni 20.2. Recording it here rather than fixing it inline is the point: bundling it
would have made this ADR's own claim unverifiable.

---

## ADR-042 — A rasterised artefact must not depend on CSS the rasteriser may not implement

**Status:** ACCEPTED · promoted in V501 (2026-09-02)

### Context

The A4 editor draws its sheets with a single declaration in `paint()`:

```js
p.style.background='repeating-linear-gradient(to bottom,#fff 0,#fff '+SHEET_H+'px,'
                 + 'transparent '+SHEET_H+'px,transparent '+(SHEET_H+GAP)+'px)';
```

The gap is `transparent`, **not dark**. On screen it reads as a separator only because `#a4DocView`
sits behind it with `background:#0a0c12`. The appearance is therefore produced by **two** elements,
one of which the export replaces with a flat white host.

The user reported the downloaded image had no separator — the sheets merged into one strip — while
the PDF was correct.

### The two falsified hypotheses, kept on the record

1. **"The gap lost its colour."** Making the export backdrop dark turned the **sheets** dark too
   (97% of the sheet interior). That is impossible if the gradient had rendered, and it falsified
   the hypothesis in one measurement. **Truth: `html2canvas` does not render the gradient at all.**
   The sheets were white solely because the backdrop was white — the stripes had *never* been drawn,
   so the separator could not have existed in any image export ever produced.

2. **"The bands are now drawn."** The instrument reported `breza: 1` and every input was correct:
   `y=3369 h=120 w=2382 s=3 fill=rgb(10,12,18) SH=1123`. The image was still white. Measuring the
   **context state** gave `a=3 d=3 e=300000 f=0`: `html2canvas` leaves its own transform applied —
   scale 3, plus the offscreen host's `left:-100000px` multiplied by that scale. `fillRect(0,3369,…)`
   was painting at `x=300000, y=10107`, off-canvas, **throwing nothing**.

> **The lesson, and it is not the same as "mechanism ≠ behaviour" — it is one level below it.**
> Every *input* to the operation was measured and every one was correct. The instrument faithfully
> reported what it was **told**, not what **happened**. When inputs are verified and the output is
> still wrong, the remaining variable is the *state of the thing being written to*.

### Decision

**Separators are drawn onto the canvas after rasterisation**, not expressed as CSS the rasteriser
must interpret, and the drawing context is explicitly reset first:

```js
_cx.setTransform(1,0,0,1,0,0);
_cx.globalAlpha=1; _cx.globalCompositeOperation='source-over';
```

**Geometry is published by the pagination engine** — `window.__a4PaginateRoot.geom = {SHEET_H, GAP}` —
because `renderDocToCanvas` lives in a different closure and would otherwise have to re-declare the
constants, creating a second source of truth (Neni 7).

**The backdrop stays white.** That is the pre-existing behaviour, so a failure of this code degrades
to exactly what shipped before rather than to an all-dark document. Failure modes are chosen, not
inherited.

### Consequences

- The PDF path is untouched and remains the only `background:#ffffff` host: it slices its own pages
  and requires a white backdrop. The change is bounded inside `renderDocToCanvas`.
- The outcome is recorded (`config._gapBands`, `config._gapErr`) rather than silently discarded.
  **The diagnostic display was removed before promotion; these recorders were deliberately kept** —
  deleting them would restore precisely the blindness that made this defect cost hours.
- Verified on the promoted artifact: exactly one dark band at `y 3372–3488`, matching `1123×3` and
  `+40×3` computed from the engine's own constants; 93.2% white overall; no errors.
- **Device gate (Neni 72) NOT passed at promotion.** The user authorised promotion on Mac/Chrome and
  deferred the phone test. Recorded as pending — an epistemic limit, not a negative result.

---

## V507 PROMOTED — 2026-09-11 · the mobile export chain V502–V507

**Status:** promoted on the author's instruction · **device gate (Neni 72) NOT passed** · release
record and verification in `RELEASE_PROCESS.md`.

Six sandbox versions shipped together; until this entry none of them was recorded here. The decisions
they embody, stated once so they are not re-derived:

1. **An A4 sheet is a fixed-geometry artefact (V502).** Its text may not be subject to the browser's
   automatic inflation, or screen and export diverge. `text-size-adjust:100%` at the sheet root.
2. **Opening a sheet is not a request for work (V503).** Pre-generation starts on a *change* of
   selection, never on opening — opening had blocked the main thread 16.3 s on mobile.
3. **Preview is a boundary, not a convention (V504).** It had been enforced by 16 scattered
   `if(preview-mode) return` checks, so every new interactive module (the photo engine) fell outside
   it unnoticed. One capture-phase guard per document, reading the mode at event time. First step
   only: the scattered checks are not yet removed.
4. **Progress may not depend on an event that can fail to arrive (V505–V507).** A stuck label is
   cosmetic; a disabled button is not (V506). rAF is suspended for hidden pages, so it is raced
   against a timer (V507). The same principle is applied to script loading in V509 (sandbox).

**Open after promotion:** Neni 72 device test for V501 **and** V507 · `ensure()` had no upper bound
on a stalled request — fixed as V509 (A/B verified: V507 unsettled at 116.7 s, V509 rejects) —
**promoted 2026-09-11**, see below · V504's scattered preview checks are
still in place alongside the new guard.

## V509 PROMOTED — 2026-09-11 · principle 4 applied to script loading

The rule from V505–V507 — *progress may not depend on an event that can fail to arrive* — now also
governs `ensure()`: a library load settles within 20 s, re-testing before it rejects. The fix sits at the
source, so every caller (all exports, mobile share preparation) inherits the bound; the withdrawn V508
had placed a ceiling in one caller only. `CV.build` is `V509`, and the label is live again — it is read
by the BUG-017 frame instrument, which is why its change was audited as a persistence touchpoint.
Device gate (Neni 72) still pending for V501, V507 and V509.
