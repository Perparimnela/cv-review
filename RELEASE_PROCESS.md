# Release Process — the permanent promotion standard

> Distilled from the V479 → V482u release (2026-07-24). The point is that the next promotion does
> **not** have to reinvent this. Each step exists because skipping it produced a real error at some
> point in this project's history — the "why" column is not decoration.
>
> **The release identity is the artifact hash + the date** — which is why every step below is
> hash-based. Until 2026-09-22 the project was not a git repository at all.
>
> **Since 2026-09-22 the project is also mirrored in git** (private GitHub repo
> `<owner>/<private-repo>`; git dir `~/Git/ProjectS.git`, kept outside iCloud). Every
> completed change is committed and pushed. Git is an off-site copy and a history, **not** a
> replacement for this process: the named backups, the snapshots and the hash checks below stay
> mandatory (Constitution Neni 6, 21, 22), and a commit hash is never a release identity.

---

## Current baseline

> **This table was two releases stale until 2026-08-04** — it still named V484 as production and
> pointed the restore command at `bak-v483-baseline`. A stale baseline is worse than a missing one:
> the command runs cleanly and silently returns production to the wrong release. **Updating this
> table belongs to the same transaction as the promotion**, exactly as it does in `BACKUP_INDEX.md`,
> where the identical defect was found a day earlier. Two documents drifted the same way
> independently; that is a process gap, not two mistakes.

| | Artifact | Hash (md5) | Bytes | Date |
|---|---|---|---|---|
| **PRODUCTION** | `index.html` | `6cc59588f5a8853cc45f125f84955202` | 1,536,062 | 2026-10-24 |
| **Release snapshot** | `621.html` | `6cc59588f5a8853cc45f125f84955202` | 1,536,062 | 2026-10-24 |
| **Rollback point** | `index.html.bak-pre-v621-20261024-023949` | `32075571989869adfc05dd620e69beda` (V619) | 1,533,736 | 2026-10-24 |

> ### ⚠️ The rollback point is a Release Snapshot, not a backup — corrected 2026-08-29
>
> **`index.html.bak-pre-v492-20260827-231513` no longer exists**, nor does
> `index.html.bak-pre-v491-20260823-221958`. The restore command below therefore names `491.html`,
> which holds byte-identical content (`a71de5fa…`, verified, not transcribed).
>
> **This is stated rather than hidden, because content and artifact are not the same thing.**
> Restoring works. What was lost is the *named pre-promotion backup* — the artifact whose name
> asserts it was created before the overwrite. `491.html` asserts something different: that it is the
> promoted V491. Recoverability is not preservation.
>
> **A replacement backup was deliberately NOT fabricated** by copying `491.html` to a
> `bak-pre-v492-…` name. The bytes would be right and the provenance would be a lie: the name would
> claim a creation moment that never happened.
>
> The surviving named backups reach only V479–V485 — **seven releases behind production**. None of
> them is a rollback target for V492.

`window.CV.build` reports **`V487+adr035`** in production — measured from the artifact, not assumed.
**The label is five releases stale**; it was not bumped through V488–V492. This is a defect in the
artifact, tracked separately, and it changes nothing here: **identity is the hash, never the label.**
CVQualify apparatus `VERSION` = **V482s** (unchanged — ADR-031 is a product change and must not bump
the apparatus; see "Two versions" below).

**V621 is the reference point for every future audit.** A future delta-audit compares against
`6cc59588`. (V619 = `32075571` is the rollback target. Since the cleanup of 2026-10-18 the folder keeps only the last seven versions (now V615–V621); older artifacts are in git history, e.g. `git checkout afc5006 -- 607.html`. Below V607, read the caveat in *Release record — V607*.)

`window.CV.build` reports **`V621`** in production — measured from the artifact. Since V509 the label
is bumped with every version, which is why it can be trusted again; **identity is still the hash.**

```bash
cp "index.html.bak-pre-v621-20261024-023949" "index.html"
```

## The test suite — one command (`tools/suite.py`, Phase 6)

**Since 2026-10-09 (Mac Phase 6, F-9), one command runs every test and writes a dated report:**

```
python3 tools/suite.py [file] --mac        # the full gate for a candidate; --quick skips the long steps
```

**What it runs, in order:**
- `verify.py`;
- golden images;
- the PDF check, desktop and phone path;
- the photo tests: `photo_test`, `photoedit_test`, `photomsg_test`, `photoexport_test`, `photohost_test`, `phototips_test`;
- the Mac bridges: `cvhost_test`, `cvdoc_test`;
- data: `state_test`, `persist_test`, `undo_test`, and `storage_trace` (plain, `--fail` and `--ai`) against production;
- quality: `listener_test`, `important_test`, the observatory;
- WebKit: `persist_webkit.js`, `photo_drag.js` and `webkit_photo --reload`;
- with `--mac`, a development build of the Mac app with this core (not installed), on which it runs `--selftest`, `-doc`, `-ui`, `-photos` and `-typing`, each as its own invocation.

**Results:**
- **PASS / FAIL / WARN.** A step that cannot even start is a FAIL, never silence. WARN is for something to read that does not block the release: for example, stored data that differs from production because of a deliberate change.
- **The report** goes to `reports/suite-<date>-<label>-<md5>.md`: a table of steps, time and key line, plus the tail of every FAIL and WARN. Reports are committed, so the history of the gate stays in the repository.
- **A FAIL blocks promotion**, like a FAIL in `verify.py`. The individual tools below still run on their own when a single question is being measured.

## Quality gate (`tools/verify.py`) and observatory (`tools/observatory.js`)

Added 2026-09-30 on the owner's instruction, following the external review. **Every critical invariant is checked by a tool, not by memory.** Both tools live outside the application: nothing diagnostic ships in the product (Neni 46).

**`python3 tools/verify.py [--file X] [--release]`** checks the artefact statically and prints PASS / WARN / FAIL, ending in `RELEASE CANDIDATE: YES|NO`. It exits with code 1 on any FAIL, and **a FAIL blocks promotion.**
- **Identity:** a single `CV.build` label; md5 and size; the snapshot named by the label is byte-identical.
- **Hygiene:** no NUL bytes; `node --check` passes on every script.
- **Static DOM:** unique ids, checked separately for the main document and the iframe template.
- **i18n:**
  - de, en and sq have identical `msg` and `ui` key sets;
  - every key is referenced in the code (WARN otherwise);
  - no notification is called with hard-coded text.
- **Architectural contracts:** one authority per concept, checked on the code with comments removed:
  - `window.Utils=Utils` once (V532);
  - one viewport authority, with `isPhoneDevice` delegating to it (V534);
  - the static 1200 viewport kept for Quick Look;
  - boot-curtain CSS without `!important` (V538);
  - the boot-ready gate defined and signalled once (V540);
  - curtain safety at 20 s after `DOMContentLoaded`, 60 s absolute (V541);
  - `withLanguage` at its three sites (V535);
  - an empty `#autosaveMessage` (V539);
  - no ghost modal (V525);
  - SRI on the 3 libraries (V524).
- **`--release`:**
  - the `RELEASE_PROCESS.md` baseline equals the production md5;
  - every md5 in the `BACKUP_INDEX.md` manifest matches its file (this catches the stale-baseline defect class);
  - production is compared with the sandbox.

**Observatory:** on the isolated origin, run `(0,eval)(await (await fetch('/tools/observatory.js')).text())`. It waits for boot and reads, without changing anything:
- DOM counts and live duplicate ids, in the page and in the frame;
- the three language sources (state, `currentLang`, `cv_language`) and whether they agree;
- the viewport decision and layout mode;
- the boot curtain, the ready gate and navigation timings;
- `window.Utils`, the notification placeholder and Web Share availability;
- i18n completeness per language.

It returns `{text, data, problems}`, and `problems` must be empty.

**Golden evidence (`tools/golden.mjs` + `tools/golden_compare.py`)** covers the visual side. It captures the *export* rather than the screen, because the screen has moving glow effects and the export is what an employer receives.
- **Capture:** headless Chrome on a temporary profile, a fresh browser context per case, and a local static server on `127.0.0.1` only.
- **Cases:** six, Classic / Modern / B&W / Neumorphic in de, plus Classic in en and in sq. Each is captured with "Save as Image" and stored at 600 px width.
- **Comparison:** against `tools/golden/baseline/`. A pixel counts as different beyond a tolerance of 24 per channel, and a case fails above **0.02 %** of its pixels or on any size change. Each failure writes a diff map.
- **Determinism:** two independent captures of the same version differ by **0.000 %**.
- **Threshold, set by a negative test:**
  - The first threshold, 0.5 %, let the notification-in-export regression (0.19–0.38 %) pass unnoticed. It was tightened to 0.02 %.
  - At 0.02 % the same regression fails in exactly the 4 affected cases.
- **Baseline:** accepted from V543. After a deliberate, approved visual change, run `--accept`.
- The baseline images show the real CV and stay in this private repository. The public mirror copies only the listed documents.

**Proven to catch real defects (negative tests, 2026-09-30):**
- A copy with four planted defects gave `RELEASE CANDIDATE: NO`, with **4 FAIL**:
  - an `!important` in the curtain;
  - a duplicate id;
  - a missing sq key;
  - a hard-coded notification.
- The observatory reported a planted language-source disagreement.

**Baseline on V542:** `verify.py --release` → PASS 28, WARN 1 (`ui.langChanged` is no longer referenced, a dead key left from the removed language-change notification), FAIL 0 → **YES**. Observatory → `PROBLEMS: none`.

**On V546 (production, 2026-09-30):** the same → **YES**; observatory `PROBLEMS: none`; golden 0.000 % in all six cases.

**On V548 (production, 2026-09-30):** `verify.py` YES; observatory `PROBLEMS: none`; golden 0.000 %; `pdf_check` on desktop and phone: CV and letter PASS, VISUAL 9/9.

**On V550 (production, 2026-09-30):** `verify.py` YES; observatory `PROBLEMS: none`; golden 0.000 %; `pdf_check` on desktop and phone: **ALL PASS**, 9/9 on every check.

### PDF evidence (`tools/pdf_export.mjs` + `tools/pdf_check.py`) — P0 of the third external review

Added 2026-09-30. The third review (ChatGPT on V546) named "a PDF that looks right but cannot be read by an applicant-tracking system (ATS)" as the main functional gap. It could not read `index.html`, so the claim was measured here: **all three PDFs of production V546 contain 0 extractable characters.** They are images only; the code has just two `addImage` calls and no text call. The CV is also a single page of 1800 × 4364 pt and the letter 1800 × 1167 pt, a deliberate format since about V329; only the certificate is A4. The owner chose to fix this as P0, **test first, with no change to `index.html` until the test exists and has been run against V546.**

**`node tools/pdf_export.mjs [file]`** creates the nine real PDFs (CV, letter, certificate × de/en/sq) in headless Chrome, through the user's own path: export sheet → one document → download.
- The PDF is captured at `URL.createObjectURL`. The real download is denied, so nothing reaches `~/Downloads`.
- It also writes the **expected texts** per language, from a defined source that is independent of the export window:
  - CV sections 2–5 and the letter: the application state, `content.terminalN[lang]`;
  - Terminal 1 (title, name, profession, contacts, professional description): the text elements of Terminal 1 on the live page, because Terminal 1 is translated while it is drawn (the state keeps it in German);
  - the certificate: the `.a4-doc-*` blocks of the live A4 page.

**`python3 tools/pdf_check.py`** reports four checks per case and exits with code 1 on any FAIL:
- **TEXT:** text is extracted (PyMuPDF). Every critical field (CV: name, e-mail, phone; letter: name, salutation; certificate: title, employee) and every expected text is present. The critical fields also get a bounding box, which must lie on the page.
- **ORDER:** the headings (for the letter, its lines) appear in the expected sequence, both in content-stream order and in layout order (top → bottom), because ATS systems read one or the other.
- **UNICODE:** every expected text with non-ASCII characters (ë, ü, ß, –, …) is found exactly, with no U+FFFD and no mojibake.
- **VISUAL:** every page, rendered by PyMuPDF, is **pixel-identical** to the reference `tools/pdfcheck/baseline/` (the V546 PDFs, immutable; `BASELINE.json` records build and md5).
- **Normalisation, stated:** decorative symbols (emoji, ⚡, ─) are removed from both sides, and whitespace is collapsed. A line that ends in a hyphen joins the next line without a space ("3-Phasen-" + "Systeme"), because the browser breaks lines after hyphens. Invisible format characters are dropped, so a real hyphen extracted as a soft hyphen stays a FAIL.

**Result on V546 (production, `e3a635da`):**

| Case | TEXT | ORDER | UNICODE | VISUAL |
|---|---|---|---|---|
| cv · motivation · document × de · en · sq (9) | FAIL 0/9 (0 characters) | FAIL 0/9 | FAIL 0/9 | **PASS 9/9**, pixel-identical |

VISUAL passing on a second, independent capture proves that the capture is deterministic, so a pixel-identical threshold is usable.

**The phone path (`--mobile`), added the same day.** An iPhone export takes a different render path. The app recognises the phone by its User-Agent (`Utils.isMobileDevice`), caps the render at 16 MP and adjusts `pdfRatio`. The owner exports mostly from the phone, so a text layer proven only on the desktop path would prove too little.
- `node tools/pdf_export.mjs [file] --mobile` emulates an iPhone: User-Agent, 402 × 874, DPR 3, touch. It writes `tools/pdfcheck/current-mobile/`. `python3 tools/pdf_check.py --mobile` compares with `tools/pdfcheck/baseline-mobile/`, the V546 phone-path PDFs.
- The emulation was confirmed: `isMobileDevice` true, viewport `width=1200` as on the iPhone, and CV image 2569 × 6227 px (16 MP cap) instead of 3600 × 8727 px on the desktop.
- **V546 phone path:** TEXT 0/9, ORDER 0/9, UNICODE 0/9, **VISUAL 9/9 pixel-identical** on a second capture.

**The tool was checked in both directions, on copies outside the project:**

| Control | Expected | Result |
|---|---|---|
| A · one visible 1-px dot in `cv-de` | VISUAL FAIL | FAIL, "9 pixels differ"; the other 8 PASS |
| B · invisible text (render mode 3) in logical order, all 9 PDFs | TEXT, UNICODE and VISUAL PASS | TEXT 9/9, UNICODE 9/9, **VISUAL 9/9: an invisible text layer is pixel-identical** |
| C · the same text in reverse order, `cv-de` | ORDER FAIL with text present | ORDER "stream 1/6 · layout 1/6" |

Findings of the controls that matter for the fix:
- **Base-14 Helvetica cannot carry "–".** The en dash was reported missing by UNICODE, and it occurs in the language labels and all date ranges.
- **Font embedding can break the hyphen.** An embedded Arial produced a hyphen that extracts as U+00AD (soft hyphen), so "3-Phasen" read as "3­Phasen". UNICODE and TEXT caught it.
- **Stream order is a separate property.** Text appended out of sequence gave "stream 1/14 · layout 14/14" on the letter.

**The V547 acceptance contract** was agreed with the external reviewer. It is met by V547, promoted as V548. See the V547 section and *Release record — V548*.
- **Scope:** V547 changes only the export pipeline, for the CV and the letter. DOM, CSS, layout, content, i18n, `StorageManager`, `HistoryEngine` and the editor UI are untouched. The CV keeps its format.
- **Acceptance, on the desktop and the phone path:**
  - VISUAL 9/9 pixel-identical to V546, on both paths;
  - TEXT, ORDER and UNICODE PASS for the 6 CV and letter cases;
  - the 3 certificate cases unchanged (still no text, pixel-identical);
  - golden image export 0.000 %;
  - `verify.py` YES.
- **The source text is never altered to make the test pass.** Characters such as "–", "-" and U+00AD must extract as they are.
- **Reading order is a property of how the PDF is written.** Text runs are emitted in logical document order, each carrying its page coordinates, not sorted after the fact.
- **After V547 (promoted as V548):** V549, the text layer of the certificate, which is already A4 but has two pages and page breaks. It was built as sandbox V549 and promoted as V550; see its section and *Release record — V550*. An A4 print version of the CV is a separate product decision and is not part of V547 or V548.

## Public mirror (`cv-review`) — anonymised, regenerated after every promotion

**Owner's decision (2026-09-30).** The public repository `cv-review` stays as a live, anonymised mirror of this private project. It serves two purposes:
- external critical review, for example by ChatGPT;
- a permanent HTTPS test target through GitHub Pages.

The owner chose that it is **updated after every production release** and carries the **application and the documents**.

**Private side:**
- `tools/public_copy.py` builds the copy.
- `tools/private-tokens.json` holds the real values and their fictitious replacements. It is never published. **When a new personal datum enters the project, add it there.**

**Procedure, after each promotion:**
1. Run `python3 tools/public_copy.py`. It anonymises `index.html` (production) and the documents, including `\uXXXX` forms, into `~/Desktop/CV-review-public`, and runs three checks:
   - a known-token scan on the decoded text;
   - a generic scan for e-mails other than `example.com`, phone numbers, ID formats and IBAN;
   - `node --check` on every script.

   On any finding it stops, moves the folder to the Trash and exits with code 1.
2. A render check of the anonymised application on the isolated origin, with a temporary copy that is moved to the Trash afterwards.
3. **The owner uploads the folder's files** through GitHub (Add file → Upload files; files with the same name are replaced). Publishing from this session is blocked by the auto-mode safety classifier ("Data Exfiltration"), and that is not worked around.
4. From outside, the raw public files are checked to be byte-identical to the package, the leak scan is repeated on them, and GitHub Pages is checked to be live.

**Identity.** The public `index.html` differs from the release by design. `PUBLIC_COPY.md` records the private → public md5 so that a reviewer does not mistake the difference for drift (compare the 36-byte question of the review's second pass). The release identity remains the private hash.

**Hard rules:**
- Never upload anything from the project folder.
- If a leak ever reaches the public repository, delete the repository and recreate it, because its history keeps everything.

| Mirror sync | Release | Public `index.html` md5 | Verified |
|---|---|---|---|
| 2026-09-30 | V542 (`929e8b2c…`) | `d952a89f…` | all 7 public files byte-identical to the package; leak scan clean; Pages serving V542 |
| 2026-09-30 | V546 (`e3a635da…`) | `8830d1a6…` | public commit `97321a2`: all 7 files byte-identical to the package (raw files fetched by commit hash); known-token and generic leak scans clean; Pages serving V546, byte-identical |
| 2026-09-30 | V548 (`ba88f1ef…`) | `fd20814b…` | public commit `ee68690`: all 7 files byte-identical to the package; leak scans clean. **New for V548:** the PDFs made from the public copy were checked too, because they now carry text. All 9 PDFs contain "Max Mustermann", 0 real tokens and 0 leak patterns. Pages serving V548, byte-identical |
| 2026-09-30 (verified 2026-10-01) | V550 (`792082b8…`) | `311494aa…` | public commit `e6d5400`: all 7 files byte-identical to the package; leak scans clean; PDFs from the public copy, **certificate included** (3805 characters), contain only fictitious values ("MAX MUSTERMANN", X00000000X) and 0 of the 30 real tokens; Pages serving V550, byte-identical |
| 2026-10-02 | V565 (`b461676d…`) | `e83b49b3…` | public commit `bdbbda8`: all 7 files byte-identical to the package; leak scan clean; the public copy renders (observatory PROBLEMS: none); its 9 PDFs contain only fictitious values ("Max Mustermann") and 0 real tokens; Pages serving V565, byte-identical. `lab/` left at V550 on purpose: `bug017.html` is the reproduction page of Chromium issue 567972098. The old package went to the Trash with `mv`, because the Finder AppleEvent of `public_copy.py` timed out (-1712) |
| 2026-10-02 | V567 (`34498155…`) | `fb8e024d…` | public commit `4b1984a`: all 7 files byte-identical to the package; leak scan clean; the public copy renders (observatory PROBLEMS: none); its 9 PDFs contain only fictitious values and 0 real tokens; Pages serving V567, byte-identical. `lab/` (11 files) untouched, still the Chromium-issue repro |
| 2026-10-04 | V581 (`2e19374c…`) | `57d271b9…` | public commit `a62dd75`: all 7 files byte-identical to the package; leak scan clean; the public copy renders (observatory PROBLEMS: none); its 9 PDFs contain 0 private tokens (27 pairs + 3 words checked); Pages serving V581, byte-identical. `lab/` untouched (`bug017.html` serving), still the Chromium-issue repro |
| 2026-10-04 | V588 (`3bd91f3a…`) | `e24a4826…` | public commit `0dd8aeb`: all 7 files byte-identical to the package; leak scan clean; the public copy renders (observatory: V588, PROBLEMS: none); its 9 PDFs contain 0 private tokens; Pages serving V588. `lab/` untouched (`bug017.html` serving), still the Chromium-issue repro |
| 2026-10-05 | V595 (`f249aa63…`) | `d8170a75…` | public commit `0d7cd55`: all 7 files byte-identical to the package; leak scan clean; the public copy renders (observatory: V595, PROBLEMS: none); its 9 PDFs contain 0 private tokens; Pages serving V595, byte-identical. `lab/` untouched (`bug017.html` serving), still the Chromium-issue repro |
| 2026-10-07 | V597 (`bc04157e…`) | `193f3caa…` | public commit `3bdac59`: all 7 files byte-identical to the package; leak scan clean; the public copy renders (observatory: V597, PROBLEMS: none); its 9 PDFs contain 0 private tokens; Pages serving V597, byte-identical. `lab/` untouched (`bug017.html` serving), still the Chromium-issue repro |
| 2026-10-08 | V607 (`2762b427…`) | `f7b7cd89…` | public commit `c4bd49f`: **all 8 files** byte-identical to the package (new: `RELEASE_ARCHIVE.md`); known-token and generic leak scans clean; the public copy renders (observatory: V607, msg 70/70, PROBLEMS: none); its 9 PDFs contain 0 private tokens (32 pairs/words + 22 patterns); Pages serving V607, byte-identical (`f7b7cd89`); `lab/bug017.html` still online. **Before the upload, the tool stopped a leak:** the bare street name, which I had written in a V604 comment and doc. A new token pair covers it. A mangled e-mail fragment, public in `ARCHITECTURE_DECISIONS.md` since earlier syncs, is now replaced too, and a pattern detects it. The old public history still holds it (owner's decision). |
| 2026-10-08 | V609 (`ec249884…`) | `692780c2…` | public commit `3b69c26`: all 8 files byte-identical to the package; known-token and generic leak scans clean; the public copy renders (observatory: V609, msg 70/70, PROBLEMS: none); its 9 PDFs contain 0 private tokens (checked before the upload); Pages serving V609, byte-identical (`692780c2`); `lab/bug017.html` still online |
| 2026-10-09 | V613 (`f7a0c614…`) | `d38e4d31…` | public commit `3e59ab0`: all 8 files byte-identical to the package; known-token and generic leak scans clean; the public copy renders (observatory: PROBLEMS: none); its 9 PDFs **and its 3 Word files (text and all XML, including the author field)** contain 0 private tokens, checked before the upload. A positive control on a private Word file found 11, so the scan is not blind. Pages serving V613, byte-identical (`d38e4d31`); `lab/bug017.html` still online |
| 2026-10-18 | V615 (`0bc12c45…`) | `df67498d…` | public commit `4f44111`: all 8 files byte-identical to the package; known-token and generic leak scans clean; the public copy renders (observatory: PROBLEMS: none); its 9 PDFs and 3 Word files (text and all XML) contain 0 private tokens, checked before the upload; Pages serving V615, byte-identical (`df67498d`); `lab/bug017.html` still online |
| 2026-10-19 | V617 (`46e75b7d…`) | `b43a76fa…` | public commit `4fdbdd5`: all 8 files byte-identical to the package (GitHub lists 6 as changed; the two architecture docs did not change); known-token and generic leak scans clean; the public copy renders (observatory: PROBLEMS: none); its 9 PDFs and 3 Word files (text, metadata and all XML) contain 0 private tokens, checked before the upload. The same scan on the private files found 278, so it is not blind. Pages serving V617, byte-identical (`b43a76fa`), about 20 s after the deployment run; `lab/bug017.html` still online |
| 2026-10-23 | V619 (`32075571…`) | `6aed9b91…` | public commit `136ccd9`: all 8 files byte-identical to the package (GitHub lists 6 as changed; the two architecture docs did not change); known-token and generic leak scans clean; the public copy renders (observatory: PROBLEMS: none); its 9 PDFs and 3 Word files (text, metadata and all XML) contain 0 private tokens, checked before the upload; the same scan on the private files found 278. Pages serving V619, byte-identical (`6aed9b91`); `lab/bug017.html` still online |

## Device coverage matrix (as of production V542 = sandbox, 2026-09-29; HTTPS and rotation rows updated 2026-09-30; production V550 since 2026-09-30; photo-series rows added at V565, 2026-10-02)

> Added after the external review (point 9). The phrase "device gate passed" had read broader than the evidence behind it. This table is what each capability has actually been exercised on.
>
> **Key:**
> - ✅ exercised and observed;
> - 🟡 exercised indirectly (the owner loaded that version and reported "everything works", without an item-by-item check);
> - ⬜ not exercised;
> - — not applicable.
>
> **Environments:**
> - **Mac:** the Claude Browser pane (Chromium), on the isolated test origin.
> - **Sim:** the iOS Simulator, iPhone 17 unless stated.
> - **iPhone:** the owner's phone, over `http://<LAN-IP>`.
> - **HTTPS:** any real device over HTTPS.

| Capability | Mac | Sim | iPhone | HTTPS |
|---|---|---|---|---|
| Desktop layout on a phone from the first paint (V534) | — | ✅ throttled A/B | ✅ owner's screenshot after V534 | ⬜ |
| Loading curtain, complete page at once (V536/V540/V541) | ✅ instrumented (normal / no signal / start-up error) | ✅ throttled at 130 and 40 KB/s, dark and light designs | 🟡 V536 only; V540/V541 not yet on the phone | ⬜ |
| Notifications follow the flag (V530) | ✅ | ✅ | ✅ owner, sq and de | ⬜ |
| Export sheet follows the flag (V533) | ✅ sq/en/de | ✅ de and sq at phone width | 🟡 inside the V536 package | ⬜ |
| Reset keeps the language (V535) | ✅ 8-row matrix, all pass | ⬜ | ⬜ | ⬜ |
| Silent notifications now shown (V532) | ✅ photo toolbar; failing export | ⬜ | ⬜ | ⬜ |
| PDF generation | ✅ | ✅ 1.1 MB | ✅ throughout the series | ⬜ |
| Download fallback without Web Share | ✅ | — | ✅ (V510) | — |
| Web Share API with files (`navigator.share`) | — | ✅ over `localhost`, which is a secure context | ⬜ LAN HTTP is not a secure context, so the download fallback is used | ✅ **owner's iPhone, 2026-09-30**, over GitHub Pages |
| Native share sheet and its targets (Save to Files …) | — | ✅ sheet opens (target not completed) | ⬜ | ✅ **owner's iPhone, 2026-09-30:** the sheet opened and the PDF was saved to Files |
| Rotation portrait ↔ landscape | — | ⬜ cannot be automated here (macOS Accessibility permission is not granted and was not changed) | ✅ **owner's iPhone, 2026-09-30**: "perfekt" | ✅ same test, on the HTTPS copy |
| Screen sizes | ✅ desktop | ✅ iPhone 17e, 17, 17 Pro Max, iPad mini (phone rule, 1200 px), iPad Pro 13" (device-width); all complete | ✅ owner's iPhone | ⬜ |
| No notification inside an export (V543) | ✅ golden: 0 green-toast pixels in six cases | ✅ Share Package PDF | ✅ owner, V544: flag switched, PDF saved to Files, no notification inside | ⬜ |
| Hidden notification fully off-screen (V545) | ✅ observatory geometry | ✅ top-right crop clean (V544 showed the sliver) | ✅ owner, V545: "po eshte ne rregull tani" | ⬜ |
| PDF text layer: search, select and copy (V547/V548) | ✅ pdf_check TEXT/ORDER/UNICODE, VISUAL pixel-identical | ✅ WebKit PDF via Save to Files: 75/75; Apple PDFKit search, word selection and copy exact | ✅ owner, 2026-09-30: e-mail copied to Notes exactly, "Elektro" found, ü/– correct, appearance unchanged | ⬜ |
| Certificate text layer, 2 A4 pages, Φ via Symbol (V549/V550) | ✅ pdf_check ALL PASS, VISUAL pixel-identical | ✅ WebKit PDF 41/41, UNICODE 32/32; PDFKit finds text on both pages, copies "MAX" and "Φ240" exactly | ✅ owner, 2026-09-30: name copied, "DEKLARATË" on page 2, "Φ240" found and copied, both pages unchanged | ⬜ |
| Photo series V551–V564: save/format/link messages, crop presets, touch handles, Adjust and proportions in the PDF, balloon photos, profile photo not stored (V565) | ✅ headless Chrome harnesses (storage, formats, links, crop, handles, balloon, filters, proportions), golden 0.000 %, pdf_check ALL PASS | ✅ WebKit (`WKWebView`): formats, profile photo, decode-or-message | ✅ owner, 2026-10-02: V560 list (9/11, the other 2 now intended), V561 handles, V564 handles + balloon + profile | ⬜ |

**HTTPS share, verified on the real iPhone (2026-09-30).**
- The owner enabled GitHub Pages on the public, anonymised review copy: `https://<owner>.github.io/cv-review/`, served with HSTS.
- Before the test we checked:
  - Pages serves the repository file byte-identical;
  - the served page contains no personal data, only "Max Mustermann".
- On the iPhone, in Safari, the owner went through preview → download → "Paket teilen", which showed "Wird vorbereitet…", and then "Paket teilen" again. Apple's share sheet opened and the PDF was saved to Files. The owner reported that it works.
- The copy is V537. The share path is byte-identical in V542: `ssCanShareFiles`, `ssHandleAction`, `ssPrepareShareFiles`, the four `navigator.share` calls and `ModeHandler.deliver` were compared. So the result holds for production.
- The public repository is to be deleted by the owner now that the test is done.
- **Rotation, same day:** the owner rotated the iPhone on the same HTTPS copy and reported the layout "perfekt".
  The rotation-relevant code is byte-identical in V537 and V542: the head's `__cvIsPhoneViewport` decision, `isPhoneDevice`/`updateViewportForMode` and the `onOrientationChange` handler were compared.
- **With this, every row of the matrix that concerns the real phone's share and layout behaviour is closed.**

**The external review's second pass (2026-09-30).** The reviewer read the *public anonymised* copy `cv-review`, not the private repository, and flagged its `index.html` as 36 bytes larger than V537's recorded 1,307,116. That difference is fully explained:
- The public file is exactly `537.html` plus the anonymisation.
- Reproducing it from `537.html` with the same replacement rules gives a byte-identical file (md5 `193a6a5b…`, 1,307,152 bytes).
- The per-replacement size changes add up to exactly +36: for example "Musterstadt" → "Musterstadt" 13 × +3, the phone number 6 × −2, `~` → `~` −12, and so on.

V537's identity (`d2b8a938…`) is untouched: `537.html` and its rollback backup are still in the private repository, since the cleanup removed only sandbox iterations. Production is V550 (since 2026-09-30).

**Language persistence matrix (review point 5), sandbox V541, isolated origin: 8 of 8 pass.** State, `currentLang` and `cv_language` agreed in every row:

| Start | Action | Expected | Result |
|---|---|---|---|
| sq | Reset | sq | ✅ sq |
| en | Reset | en | ✅ en |
| de | Reset | de | ✅ de |
| sq | Reset → reload | sq | ✅ sq |
| sq | Reset → close the tab → open a new tab | sq | ✅ sq |
| sq | Reset → four real saves (design cycled round) → reload | sq | ✅ sq |
| no stored state, `cv_language=sq` | start | sq | ✅ sq |
| no stored state, no preference | start | de | ✅ de |

> **Cleanup, 2026-09-29.** The sandbox snapshots (`510`–`536`, except the promoted `520`, `529` and `531`) and the sandbox backups named in the records below were moved to the Trash on the owner's instruction (Neni 6.5). At the owner's request they were also purged from the git history (a force-pushed rewrite), so they exist only in the Trash. The details are in `BACKUP_INDEX.md` → *Cleanup (2026-09-29)*.

## Archive — older sections live in `RELEASE_ARCHIVE.md` (audit F-10)

Moved on 2026-10-08 (Mac Phase 5, audit F-10). This file had grown to 315 KB and was hard to read. The text was moved **byte for byte, in its original order**; nothing was edited, summarised or dropped.
- **Moved:**
  - closed sandbox sections V510–V564 (closed by V520 … V565) and V566–V618 (closed by V567 … V619);
  - release records V613 back to V482u, with the note *Sandbox after promotion — V509*.
- **Stays here:**
  - the current baseline, the gates, the public mirror and the device matrix;
  - the open sandbox section, if any, and the last closed one (V620);
  - the last four release records (V615–V621);
  - the production mirror invariant and the checklist.
- **From now on:** at each promotion, the sandbox section it closes and any release record older than the last four move to the archive.

## Sandbox sections and release records (newest first)

#### Sandbox ahead of production — V620 (2026-10-24) — the photo bars keep clear of the corner squares — CLOSED by the V621 promotion

**Closed on 2026-10-24:** `index-test.html` = `index.html` = `621.html`.

Production is V619 (`32075571…`).

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V620 | `620.html` | `926b42919b6905486cf7ea489424c7fe` | 1,536,019 | `index-test.html.bak-pre-v620-20261023-171031` (= V619, `32075571…`) |

**The owner's request:** the photo tool bars, first the adjust slider that starts at "100%" (opacity and the other colour settings), and every other bar, must not be as wide as the terminal; they should be a little narrower so they do not get in the way of the corner squares used to resize the photo ("…te mos jete me permasa totale sa vet Terminali por te jete pak me i ngushte qe mos te pengoj ne Cepat…").

**Measured in V619** (Chrome, a test photo in the first terminal, the gap from each bar to the corner squares' grab zone):
- **The adjust slider was as wide as the photo, 18 px below it.** At 100% its thumb and the "100%" label sat right under the bottom-right corner square (gap 0; 3 px to the visible square).
- **A photo larger than the terminal:** the corner squares are kept inside the terminal outline (V561), and the slider ran across the whole terminal at the same height, over the bottom-left square, with the "100%" label hiding the bottom-right one (1154 px wide, gap 0).
- **The toolbar** sat 4 px above the top corner squares (inside their grab zone) for a normal or narrow photo.

**V620 (one place: the photo engine's `apply()`, where the bars are positioned):**
- **The slider** is inset from the corner columns by their grab zone (12 px square, plus 9 px on desktop or 16 px on touch screens, plus a margin), and is at most 360 px wide, centred.
- **A very narrow photo:** the slider keeps 120 px and moves down below the corner squares.
- **A rotated photo:** if the lowest corner would touch the slider, the slider moves below it.
- **The toolbar** moves up above the top corner squares when it would touch them. When there is no room above (the photo at the top of the terminal), it moves just below them.
- The corner squares are computed exactly as they are placed (clamped inside the terminal outline). Nothing else changes: no stored data, no export path.

**Measured in V620** (gap to the grab zone, desktop / phone emulation):
- normal photo: slider 12 / 12 px, toolbar 6 / 6 px;
- larger than the terminal: slider 370 px away and 360 px wide;
- narrow: 6 / 6 px; rotated 20°: 4 / 4 px; photo in the top-left corner: slider 12 px, toolbar 6 px.
- **Not changed:** the round rotate handle (shown only in Transform) sits between the top corners; on a 70 px wide photo on a phone it touches their touch zone, exactly as before. It is a handle, not a bar.
- **Screenshots** before and after (normal photo and larger than the terminal) were checked by eye.

**New permanent check:** `tools/photoedit_test.mjs` now has 26 checks. The new one, "bars · the adjust slider and the toolbar keep clear of the corner squares", passes on V620 and FAILS on V619 (slider 0 px, 1154 px wide).

**Gates:** `python3 tools/suite.py index-test.html --mac` → **SUITE: ALL PASS, 37 steps** (23.9 min; report `reports/suite-20261024-0203-V620-926b4291.md`). `photoedit_test` 26/26 (with the new bars check); golden: no visual regression; `photoexport_test` 8/8; `storage_trace` against production: IDENTICAL after every step; `pdf_check` desktop and phone: ALL PASS; all seven Mac self-tests PASS on the development build with this core.

### Release record — V621 (2026-10-24) — the photo bars keep clear of the corner squares (V620)

**Promoted on the owner's instruction** ("ateher me mir promovoje", after seeing the before/after screenshots). V621 is V620 plus the build label and its history line; a diff confirmed that nothing else differs.

| Version | Change | Class | Persistence |
|---|---|---|---|
| V620 | The photo's adjust slider is inset from the corner squares (their grab zone, desktop and touch) and at most 360 px wide; a narrow photo keeps a 120 px slider below the corners; the toolbar moves above (or below) the top corners when it would touch them | UI (layout of the photo tools) | Nothing stored changes, no migration |

**Delta-audit (execution surface).**
- One place changed: the photo engine's `apply()`, where the bars are positioned. It reads the corner squares' positions the same way they are placed. No new listener, no stored data, no export path.
- `storage_trace` against V619 is IDENTICAL after every step; golden images: no visual regression; the PDFs (desktop and phone) unchanged.

**Device gate:** the real Mac app with this core (the bars are the same in the app's WebKit).

**Backups:**
- **Production:** `index.html.bak-pre-v621-20261024-023949` (= V619, `32075571…`), hash-verified before the copy and again after it.
- **Sandbox:** `index-test.html.bak-pre-v621-20261024-023949` (= V620). It went to the Trash folder afterwards under the keep-seven rule; it has the same bytes as `620.html`.
- **Identity:** `md5 -q index.html index-test.html 621.html | sort -u` printed one hash (`6cc59588…`).
- **Keep-seven rule, applied after the copy:** `614.html`, the previous rollback `index.html.bak-pre-v619-20261023-012104` (= V617, same bytes as `617.html`) and the sandbox backups went to the Trash folder `ProjectS-pastrim-2026-10-18`. The tracked ones are still in git history.

**Gates on the candidate (bit-identical to the promoted file):** `python3 tools/suite.py index-test.html --mac` → **36 of 37 steps PASS** (29.7 min; report `reports/suite-20261024-0239-V621-6cc59588.md`). The one failure was `state_test` hitting its 396 s step timeout with no failed check (on V620 it passed in 61 s). Run alone it passed in 61 s, and `python3 tools/suite.py index-test.html --only state_test` → **ALL PASS** (report `reports/suite-20261024-0312-V621-6cc59588.md`): a hung browser, not a regression; V620 does not touch stored state. `photoedit_test` 26/26; golden: no visual regression; `storage_trace` against production: IDENTICAL after every step; `pdf_check` desktop and phone: ALL PASS; all seven Mac self-tests PASS on the development build with this core. After the copy: `verify` RELEASE CANDIDATE YES; observatory on `index.html`: PROBLEMS none.

**Rollback:** production returns to V619 by copying `index.html.bak-pre-v621-20261024-023949` over `index.html` (the command is in *Current baseline*). Nothing is lost: V619 only lacks the narrower bars.

### Release record — V619 (2026-10-23) — fixes from the full recheck (the AI co-author; V618)

**Promoted on the owner's instruction** ("promovo"; resumed the next morning with "vazhdojm perseri.."), after the full recheck the owner asked for. V619 is V618 plus the build label and its history line; a diff confirmed that nothing else differs.

| Version | Change | Class | Persistence |
|---|---|---|---|
| V618 | Five fixes in `window.CVAI`: translating into an empty target-language field writes it; a late answer after the panel was closed is ignored (it threw, and could replace a newer request); closing the panel while accepting no longer throws; a proposal whose field is missing says "not applied" instead of "accepted" (new `ui` key `aiMissing`) | Corrective (Mac only) | Nothing new is stored, no migration |

**Delta-audit (execution surface).**
- Only `window.CVAI` changed (field lookup when writing, a request token, the accept path, one card state), plus one `ui` key in three languages.
- `CVAI` still runs only when the Mac app opens it. `storage_trace` against V617 is IDENTICAL after every step.

**Device gate:** the real Mac app with this core.
- The Mac app also gets the request-timeout fix (Mac `3c4fc89`): 10 minutes instead of 150 s, no retry after a timeout.
- **Still not done:** a real call to Claude. The owner's own key is needed (menu Bashkautori AI → Çelësi i Claude…).

**Backups:**
- **Production:** `index.html.bak-pre-v619-20261023-012104` (= V617, `46e75b7d…`), hash-verified before the copy and again after it.
- **Sandbox:** `index-test.html.bak-pre-v619-20261023-012104` (= V618). It went to the Trash folder afterwards under the keep-seven rule; it has the same bytes as `618.html`.
- **Identity:** `md5 -q index.html index-test.html 619.html | sort -u` printed one hash (`32075571…`).
- **Keep-seven rule, applied after the copy:** `612.html`, the previous rollback `index.html.bak-pre-v617-20261019-122124` (= V615, same bytes as `615.html`) and the sandbox backups went to the Trash folder `ProjectS-pastrim-2026-10-18`. The tracked ones are still in git history.

**Gates on the candidate (bit-identical to the promoted file):** `python3 tools/suite.py index-test.html --mac` → **SUITE: ALL PASS, 37 steps** (26.5 min; report `reports/suite-20261023-1041-V619-32075571.md`; the first run the night before was interrupted when the session ended and left no report). `ai_test` 18/18; `undo_test` 191 s; `storage_trace` against production: IDENTICAL after every step; golden: no visual regression; `pdf_check` desktop and phone: ALL PASS; `docx_test` 23/23; all seven Mac self-tests PASS on the development build with this core. After the copy: `verify` RELEASE CANDIDATE YES; observatory on `index.html`: PROBLEMS none.

**Rollback:** production returns to V617 by copying `index.html.bak-pre-v619-20261023-012104` over `index.html` (the command is in *Current baseline*). Nothing is lost: V617 only lacks the five co-author fixes.

### Release record — V617 (2026-10-19) — the AI co-author in "draft mode" (DeepSeek review B3; V616)

**Promoted on the owner's instruction** ("ateher Promovoje"), after the owner's decisions recorded as Mac D-010 (Claude, the Mac app only, consent on every request, four tasks). V617 is V616 plus the build label and its history line. A line diff confirmed that nothing else differs.

| Version | Change | Class | Persistence |
|---|---|---|---|
| V616 | `window.CVAI`, the AI co-author: a panel opened from the Mac menu "Bashkautori AI" sends the chosen texts to the app (`CVHost.aiPropose`); Claude's proposals come back as cards that the owner accepts or rejects one by one; a group of acceptances is one undo step; translating writes into the target language | Functional (Mac only) | An accepted proposal is saved like typed text; nothing new is stored, no migration |

**Delta-audit (execution surface).**
- `CVAI` only runs when the Mac app opens it and only acts on a click.
- In a browser `CVAI.open` returns `false`, and nothing else calls it.
- The only change to existing code is `window.__cvApplySnapshot`, exposed from the AppState history bridge (the same path undo and redo use). Normal typing and saving are unchanged: `storage_trace` against V615 is IDENTICAL after every step.

**Device gate:** the real Mac app with this core.
- `--selftest-ai` covers the full path: menu task → panel → bridge → consent text → the stubbed Claude response → card → accept → the text changes (line break kept) → one history step.
- **Not yet done:** a real call to Claude. The owner's own key is needed for it (menu Bashkautori AI → Çelësi i Claude…).

**Backups:**
- **Production:** `index.html.bak-pre-v617-20261019-122124` (= V615, `0bc12c45…`), hash-verified before the copy and again after it.
- **Sandbox:** `index-test.html.bak-pre-v617-20261019-122124` (= V616). It went to the Trash folder afterwards under the keep-seven rule; it has the same bytes as `616.html`.
- **Identity:** `md5 -q index.html index-test.html 617.html | sort -u` printed one hash (`46e75b7d…`).
- **Keep-seven rule, applied after the copy:** `610.html`, the previous rollback `index.html.bak-pre-v615-20261018-142631` (= V613, same bytes as `613.html`) and the sandbox backups went to the Trash folder `ProjectS-pastrim-2026-10-18`. They are still in git history.

**Gates on the candidate (bit-identical to the promoted file):** `python3 tools/suite.py index-test.html --mac` → **SUITE: ALL PASS, 37 steps** (24.1 min; report `reports/suite-20261019-1221-V617-46e75b7d.md`).
- **Covered:**
  - `ai_test` 12/12 and Mac `--selftest-ai` 13/13;
  - `storage_trace` against V615: IDENTICAL after every step;
  - golden: no visual regression; `pdf_check` desktop and phone: ALL PASS;
  - `docx_test` 23/23; all seven Mac self-tests PASS.
- **On the promoted `index.html`:**
  - `verify.py --file index.html`: YES;
  - observatory: 7 terminals, msg 77/77 in de/en/sq, `PROBLEMS: none`.

**Rollback:** production returns to V615 by copying `index.html.bak-pre-v617-20261019-122124` over `index.html` (the command is in *Current baseline*). Nothing is lost: V615 only lacks the co-author panel. The Mac app's menu then reports that the co-author needs core V616 or newer.

### Release record — V615 (2026-10-18) — the Word certificate exactly like the A4 page (V614)

**Promoted on the owner's instruction** ("promovo"), after the owner's request that the Word certificate be identical to the A4 certificate on the same 2 pages. V615 is V614 plus the build label and its history line. A line diff confirmed that nothing else differs.

| Version | Change | Class | Persistence |
|---|---|---|---|
| V614 | The Word certificate is built from the same clone and pagination engine as the A4 PDF: one Word section per page, styles and positions from the page, Fira Mono embedded, Word 2010 layout so that justified lines break as in the browser; photos anchored at their place | Functional (export only) | none |

**Delta-audit (execution surface).**
- `certBody` runs only when the Word export is chosen for the certificate. It works on an off-screen clone and removes it afterwards.
- The new `window.CVDocxFonts` block is data, read only by that export. It is checked against the page's own WOFF2 by `tools/docx_fonts.py` (a suite step).
- The CV and the letter documents are unchanged (Arial, mode 15).
- No storage key, no migration. `storage_trace` against V613: IDENTICAL after every step.

**Device gate.** Real Microsoft Word 16.113.3 (`tools/word_check.sh`) against the app's own A4 PDF: **the same pages and every line identical** (35+31 lines). Word's PDF uses the embedded Fira Mono. A stamp photo appears at its place on page 2.

**Backups:**
- **Production:** `index.html.bak-pre-v615-20261018-142631` (= V613, `f7a0c614…`), hash-verified before the copy and again after it.
- **Sandbox:** `index-test.html.bak-pre-v615-20261018-142631` (= V614, `84532dd2…`). It went to the Trash folder `ProjectS-pastrim-2026-10-18` afterwards under the owner's keep-seven rule; it has the same bytes as `614.html`.
- **Identity:** `md5 -q index.html index-test.html 615.html | sort -u` printed one hash (`0bc12c45…`).
- **The owner's keep-seven rule** (2026-10-18), applied after the copy: `608.html`, the previous rollback `index.html.bak-pre-v613-20261009-132431` (= V609, same bytes as `609.html`) and the sandbox backups went to the same Trash folder. They are still in git history.

**Gates on the candidate (bit-identical to the promoted file):** `python3 tools/suite.py index-test.html --mac` → **SUITE: ALL PASS, 35 steps** (32.1 min; report `reports/suite-20261018-1426-V615-0bc12c45.md`).
- **Highlights:**
  - `storage_trace` against V613: IDENTICAL after every step;
  - golden: no visual regression;
  - `pdf_check` desktop and phone: ALL PASS;
  - `docx_test` 23/23; `docx_fonts` UP TO DATE;
  - all six Mac self-tests PASS.
- **On the promoted `index.html`:**
  - `verify.py --file index.html`: YES;
  - observatory: 7 terminals, msg 77/77 in de/en/sq, `PROBLEMS: none`;
  - `tools/word_check.sh index.html` (real Microsoft Word): ALL PASS, the certificate identical to the app's A4 PDF line for line.

**Rollback:** production returns to V613 by copying `index.html.bak-pre-v615-20261018-142631` over `index.html` (the command is in *Current baseline*). Nothing is lost: V613 gives the certificate the CV's Word style instead of the A4 layout.

## Production mirror invariant

Since V486 the three artifacts are byte-identical. That is not a coincidence to note — it is a
**property to enforce**, because drift between sandbox and production is invisible until it causes a
promotion to ship something nobody reviewed.

```
index.html  ==  index-test.html  ==  <current release snapshot>

Deviation   permitted ONLY inside an active, named transaction
            (V485 held one deliberately for six days: CVSecurity + BUG-018,
             recorded in BACKUP_INDEX.md with the reason and the byte delta)

Before any promotion   the three must hash identical, or the deviation must be
                       written down with its reason before the promotion proceeds
```

```bash
md5 -q index.html index-test.html <NNN>.html | sort -u | wc -l    # must print 1
```

A deliberate divergence is legitimate and has happened; an *unnoticed* one is what this guards
against. The rule is not "never differ" — it is **"never differ silently."**

## The Release Checklist

> **Terms.** An *atomic change* is one sandbox version with one cause (Neni 20). A *release transaction* is one promotion. It may carry
> several atomic changes, and its record lists them. A record never calls a transaction "a change".

```
□ 00. Test suite: python3 tools/suite.py <candidate> --mac → SUITE: ALL PASS (or PASS with WARN, each WARN explained in the record); report committed under reports/
□ 0. Quality gate: tools/verify.py → RELEASE CANDIDATE: YES (a FAIL blocks); observatory → PROBLEMS: none
□ 0b. Golden evidence: node tools/golden.mjs → python3 tools/golden_compare.py → VISUAL REGRESSION: NONE (or an approved --accept)
□ 0c. PDF evidence, desktop and phone path: node tools/pdf_export.mjs [--mobile] → python3 tools/pdf_check.py [--mobile] → VISUAL 9/9 pixel-identical to the reference; once V547/V548 ship, also TEXT/ORDER/UNICODE PASS
□ 1. Artifacts identified BY HASH
□ 2. Backup created AND verified
□ 3. Delta-audit completed
□ 4. Migrations tested (if the release touches persistence)
□ 5. Smoke test passed
□ 6. Rollback point confirmed
□ 7. Documentation updated
□ 8. Baseline recorded (hash + date — this file)
□ 9. Public mirror regenerated and verified (tools/public_copy.py → owner uploads → external check)
```

### 1 · Artifacts identified by hash
Record `md5` + bytes for **prod** and **candidate**, and confirm they are the intended pair.
**Why:** a version *label* can disagree with the loaded *artifact*. This bit us twice — a browser
served a cached build while the report read a newer label, and the candidate's `VERSION` constant said
`V482s` while everyone called it "V482u". **Compare artifacts, never labels.**

### 2 · Backup created and verified
Copy prod aside, then **hash the backup** and assert it equals the outgoing prod hash.
**Why:** an unverified backup is not a rollback point, it is a hope.

### 3 · Delta-audit completed
Classify every change into exactly one of: **Functional · UI · Architecture · Verification-only ·
Dead/Experimental**. Then measure risk per group: user-visible? · serialization impact? ·
compatibility impact? · promotion blocker? · rollback complexity?
**Why:** "N versions ahead" is not a risk metric. **Execution surface is.** The V482u audit found
that of +188 KB, exactly *one* change touched the user's live path.

Useful measurement, not a text diff — *does it auto-run for the user?* Enumerate every entry point's
call sites and classify product vs harness. State the limit honestly: static enumeration cannot see
dynamic dispatch, so the finding is **"no product caller found"**, never "never executes".

### 4 · Migrations tested (if persistence changes)
On a **real** state produced by the outgoing production build — not a synthetic one. Five invariants
plus one negative test:

1. **No data loss** — collection counts identical.
2. **Stable IDs** — each entity gets exactly one; no duplicates, none missing.
3. **Deterministic + idempotent** — `normalize(normalize(s)) == normalize(s)`.
4. **Semantics unchanged** — compare the *full multiset of leaf text*, not a spot-check.
5. **Re-save stable** — save → reload → normalize returns the same state.
6. **Negative:** `normalize(new) == new` — else the migration keeps rewriting state on every load.

**Why:** real states contain anomalies synthetic ones never produce (the V479 state turned out to be a
hybrid: flat top-level plus a nested `content`).

### 5 · Smoke test passed
On the **promoted** production artifact: it loads · renders · save/load round-trips · the release's
headline change is present · zero console errors.

### 6 · Rollback point confirmed
State the exact one-line restore command in the release record.

### 7 · Documentation updated
Retire stale *current-state* claims ("prod is V…"). Leave historical narrative alone — only
present-tense claims go stale.

### 8 · Baseline recorded
Update the table at the top of this file: hash, bytes, date.

---

## Two versions, deliberately separate

| Constant | Meaning | Bump when |
|---|---|---|
| `window.CV.build` | the **artifact** / HTML build | **any** shipped change (product, UI, docs) |
| `VERSION` inside CVQualify | the **qualification apparatus** | only when the harness itself changes |

**Why:** the CVQualify `VERSION` is embedded in the stored golden fixtures. Bumping it for a product
change would drift every golden for no reason. Conflating the two is what produced the "V482s vs
V482u" confusion this file exists to prevent.

---

## Two habits that carried the whole process

**Measurement ≠ interpretation ≠ decision.** Keep them visibly separate in any release report. An
approver who did not re-run the measurements is trusting exactly that separation.

**Doubt the instrument before the artifact — as an investigation ORDER, never a conclusion.** During
the V482u release, *four* apparent defects turned out to be measurement errors (a wrong probe path, a
test that bypassed `save()`, a stale browser cache, an over-eager classifier). Each would have blocked
a sound release or hidden a real one. The verdict still has to come from evidence in every case.
