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
| **PRODUCTION** | `index.html` | `ec2498848cd7fb12e2fbfd244decaf62` | 1,390,856 | 2026-10-08 |
| **Release snapshot** | `609.html` | `ec2498848cd7fb12e2fbfd244decaf62` | 1,390,856 | 2026-10-08 |
| **Rollback point** | `index.html.bak-pre-v609-20261008-172128` | `2762b4277d044fd27e82b598f22195a1` (V607) | 1,389,840 | 2026-10-08 |

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

**V609 is the reference point for every future audit.** A future delta-audit compares against
`ec249884`. (V607 = `2762b427` is the rollback target; V597 = `bc04157e` is two back, see the caveat in *Release record — V607*.)

`window.CV.build` reports **`V609`** in production — measured from the artifact. Since V509 the label
is bumped with every version, which is why it can be trusted again; **identity is still the hash.**

```bash
cp "index.html.bak-pre-v609-20261008-172128" "index.html"
```

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
  - closed sandbox sections V510–V564 (closed by V520 … V565) and V566–V606 (closed by V567 … V607);
  - release records V588 back to V482u, with the note *Sandbox after promotion — V509*.
- **Stays here:**
  - the current baseline, the gates, the public mirror and the device matrix;
  - the open sandbox section, if any, and the last closed one (V608);
  - the last four release records (V595–V609);
  - the production mirror invariant and the checklist.
- **From now on:** at each promotion, the sandbox section it closes and any release record older than the last four move to the archive.

## Sandbox sections and release records (newest first)

#### Sandbox ahead of production — V608 (2026-10-08) — the profile photo can be undone — CLOSED by the V609 promotion

**Closed on 2026-10-08:** `index-test.html` = `index.html` = `609.html`.

Production is V607 (`2762b427…`).

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V608 | `608.html` | `ebfd8f2e2f3046686a2ee16e6a06e77a` | 1,390,650 | `index-test.html.bak-pre-v608-20261008-165749` (= V607, `2762b427…`) |

**V608 = uploading a profile photo can be undone (owner's decision "shtoje", 2026-10-08).** The R-12 inventory had left one open decision. The profile photo was the only photo action outside the history: ⌘Z after a wrong upload did nothing, and since V604 it honestly said "nothing to undo".
- **Change.** When a new profile photo is accepted, the previous picture is kept: its `src` and, in a Mac document, its stored bytes. A `project` step *Foto e profilit* is recorded.
  - ⌘Z returns the previous picture. In a Mac document the previous bytes go back too; if the previous picture was the default one, no bytes remain.
  - ⌘⇧Z brings the new picture back.
  - In a browser only the view changes, because there the profile photo is never stored (V563, unchanged).
- **Measured:**
  - **`undo_test.mjs`:** profile photo upload recorded, ⌘Z undoes it, ⌘⇧Z redoes it. Kept after a reload: no, by design in a browser. V607: not recorded, a gap.
  - **The real Mac app** (`--selftest-typing`, extended), through a real `.uicv` path:
    - upload A, then B;
    - ⌘Z gives A; ⌘Z again gives the default picture with no bytes in the document;
    - ⌘⇧Z twice gives A, then B;
    - B is still there after saving and reopening.

    Core V608: 13/13. Core V607: the two undo checks FAIL.
- **Gates:**
  - `storage_trace.mjs 607.html index-test.html`: IDENTICAL after every step; `--fail` and `--ai`: clean.
  - golden 6/6 at 0.000 %.
  - `pdf_check` desktop and `--mobile`: ALL PASS.
  - `photo_test`, `cvhost_test`, `cvdoc_test`, `photohost_test`, `phototips_test`, `state_test`: ALL PASS.
  - `persist_test --fail`: 88/88. `undo_test`: 13/14 undo, 14/14 as designed. `listener_test --fail`: no growth. `important_test`: 0 proven dead.
  - Mac app with core V608: `--selftest`, `--selftest-doc`, `--selftest-ui`, `--selftest-photos` 21/21, `--selftest-typing` 13/13.
  - observatory: `PROBLEMS: none`.
  - `verify.py`: YES.

### Release record — V609 (2026-10-08) — the profile photo can be undone (V608)

**Promoted on the owner's instruction** ("promovo"), after the owner's decision "shtoje" and my own test run. V609 is V608 plus the build label and its history line; a diff confirmed that nothing else differs.

| Version | Change | Class | Persistence |
|---|---|---|---|
| V608 | Uploading a profile photo records a `project` step *Foto e profilit*. ⌘Z returns the previous picture (in a Mac document also its bytes, or none for the default picture), and ⌘⇧Z returns the new one | Undo | none on the web (`storage_trace` identical); in a Mac document, undo and redo write the profile bytes as an upload does |

**Device gate (Neni 72): passed in the real Mac app.** `--selftest-typing` (extended) ran on core V608, through a real `.uicv`:
- upload A, then B;
- ⌘Z gives A; ⌘Z again gives the default picture with no bytes left;
- ⌘⇧Z twice gives A, then B;
- B is still there after saving and reopening.

Core V608: 13/13. Core V607: the two undo checks FAIL. On the web, `undo_test.mjs`: recorded, undone and redone.

**Backups:**
- **Production:** `index.html.bak-pre-v609-20261008-172128` (= V607, `2762b427…`), hash-verified before the copy and again after it.
- **Sandbox:** `index-test.html.bak-pre-v609-20261008-172128` (= V608, `ebfd8f2e…`).
- **Identity:** `md5 -q index.html index-test.html 609.html | sort -u` printed one hash (`ec249884…`).

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `python3 tools/verify.py --file index.html` | PASS 25, WARN 1 (`ui.langChanged`), FAIL 0 → YES |
| Golden image export | 0.000 % in all six cases |
| `pdf_check` on `index.html`, desktop and `--mobile` | **ALL PASS: TEXT, ORDER, UNICODE and VISUAL 9/9 each** |
| `photo_test` / `cvhost_test` / `cvdoc_test` / `photohost_test` / `phototips_test` / `state_test` | ALL PASS each |
| `storage_trace.mjs 608.html index.html` | IDENTICAL after every step; `--fail` and `--ai` clean |
| `persist_test --fail` / `undo_test` / `listener_test --fail` | 88/88 / 13/14 undo, 14/14 as designed / no growth |
| `important_test` / `persist_webkit.js` | 0 proven dead / 7/7 |
| Observatory on production | `V609`; 7 terminals; 0 duplicate ids; msg 70/70 in de/en/sq; **`PROBLEMS: none`** |

**Rollback:** production returns to V607 by copying `index.html.bak-pre-v609-20261008-172128` over `index.html` (the command is in *Current baseline*). Nothing is lost: V607 only loses the profile-photo undo. For a rollback below V607, read the caveat in *Release record — V607*.

### Release record — V607 (2026-10-08) — Mac Phase 5: core architecture, typed text kept, listeners, dead CSS (V598–V606)

**Promoted on the owner's instruction** ("promovoje"). Before that, the owner had asked me to run every test myself and draw conclusions ("beji ti te gjitha testet dhe dile ne konkluzione").
- **The real Mac app, document path.** A new self-test `--selftest-typing` checks the core in the real Mac app, through the real `.uicv` path (type, save to disk, reopen in a new core).
  - Core V606: 10/10.
  - Core V597, production until now: 8 failures. All six text fields were lost, and the English title edit landed in the German title.
- **The real Mac app, existing self-tests** on core V606: `--selftest`, `--selftest-doc` 11/11, `--selftest-ui` 8/8, `--selftest-photos` 21/21.
- V607 is V606 plus the build label and its history line. A diff confirmed that nothing else differs.

| Version | Change | Class | Persistence |
|---|---|---|---|
| V598 | Photo toolbar titles and tips follow the flag (de/en/sq), with stable `data-tip` keys; the blur tip key fixed (F-6) | UI text | none |
| V599 | One draw per frame while dragging a photo; the pending move is applied on release (F-7) | Performance | none |
| V600 | `CVDefaultState` / `CVStateMigration` split out of `StorageManager` (R-2) | Structure | none (identical states) |
| V601 | Unreadable stored data kept as `<key>.unreadable` and announced once (R-11) | Data safety | new `.unreadable` copy only on damaged data |
| V602 | The photo tip shows above the 📌 pin (owner's decision) | UI | none |
| V603 | BUG-017 instrument CVFrame removed (owner's decision); the old key is deleted at start | Removal | `cv_bug017_frames` deleted |
| V604 | Typed text kept on reopen: letter, signature, titles, professional description, the Skills/Hobby label. Two "stale text" rules removed. LocalizedText complete de/en/sq. ⌘Z returns the flag, and the old AppState undo is no longer reached (R-12) | **Data-loss fix** | the author's text now stored where it is read; overrides carry `"en":"","sq":""` |
| V605 | `_makeEditable` wires once: no listener growth, and titles edited after a language switch stay in that language. Swatches delegated (R-6) | **Data-corruption fix**, performance | none (`storage_trace` identical) |
| V606 | Dead `.tpl-minimal` CSS removed (R-5): `!important` 973 → 911 | Removal | none (`storage_trace` identical) |

Also in this cycle, outside the artifact:
- F-10: `RELEASE_PROCESS.md` went from 315 KB to 70 KB, with the old records moved to `RELEASE_ARCHIVE.md`.
- R-3: the owner map in `ARCHITECTURE.md` §8.
- New tools: `persist_test`, `persist_webkit`, `undo_test`, `listener_test`, `listener_map`, `important_test`, `eval_page`, `module_map`; the Mac `--selftest-typing`.

**Device gate (Neni 72): passed in the real Mac app (WebKit, `.uicv`), in WebKit (`webkit_run`) and in Chrome.** The owner tested V598 and V599 by hand on the Mac.

**Backups:**
- **Production:** `index.html.bak-pre-v607-20261008-161042` (= V597, `bc04157e…`), hash-verified before the copy and again after it.
- **Sandbox:** `index-test.html.bak-pre-v607-20261008-161042` (= V606, `7d073be5…`).
- **Identity:** `md5 -q index.html index-test.html 607.html | sort -u` printed one hash (`2762b427…`).

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `python3 tools/verify.py --file index.html` | PASS 25, WARN 1 (`ui.langChanged`), FAIL 0 → YES |
| Golden image export | 0.000 % in all six cases |
| `pdf_check` on `index.html`, desktop and `--mobile` | **ALL PASS: TEXT, ORDER, UNICODE and VISUAL 9/9 each** |
| `photo_test` / `cvhost_test` / `cvdoc_test` / `photohost_test` / `phototips_test` / `state_test` | ALL PASS each |
| `storage_trace.mjs 606.html index.html` | IDENTICAL after every step; `--fail` and `--ai` clean |
| `persist_test --fail` / `undo_test` / `listener_test --fail` | 88/88 kept, languages separated / 14/14 as designed / no growth |
| `important_test` | 911 in the file, 0 proven dead |
| `persist_webkit.js` (WebKit) | 7/7 |
| Observatory on production | `V607`; 7 terminals; 0 duplicate ids; msg 70/70 in de/en/sq; **`PROBLEMS: none`** |

**Rollback:** production returns to V597 by copying `index.html.bak-pre-v607-20261008-161042` over `index.html` (the command is in *Current baseline*).

**Rollback caveat.** This was read from V597's normalizer, not measured, and is stated before it is needed.
- **The letter would be lost.** V597 still has the "stale letter" rule. A letter written under V607 would be replaced by the default as soon as V597 loads and saves the CV.
- **Two titles would be dropped.** V597 removes `terminal2.skills.title` and `terminal6.title` (the Skills card and letter titles) on its next save.
- **What survives:**
  - the professional description, because V597 reads the same `content.terminal1.professional_desc`;
  - the Skills/Hobby override, kept in the data, although V597 shows the dictionary text.
- **Before any rollback:** export the letter as a PDF, or keep a copy of the `.uicv` document.

### Release record — V597 (2026-10-07) — Mac Phase 4: photos through the Mac's own tools (V596)

**Promoted on the owner's instruction** ("funksionon") after their hands-on check of the Mac test build with core V596. They tried a drag from the Photos app, HEIC/RAW from Finder and a photo link from Safari. At their request the V562 balloon was also verified on every new photo path: `photohost_test.mjs` 18/18, and `--selftest-photos` on HEIC, TIFF and link photos in real WebKit. V597 is V596 plus the build label and its history line; a comparison confirmed that nothing else differs.

| Version | Change | Class | Persistence |
|---|---|---|---|
| V596 | Every new photo goes to `CVHost.preparePhoto` first (ImageIO: HEIC, RAW, 16-bit TIFF, a guaranteed budget, F-11); RAW is accepted with the host; the Mac profile photo goes through the host; links go via `CVHost.fetchPhoto`, with no Weserv (F-12) | Native-host hook (Mac); the web is unchanged | none (`storage_trace` identical) |

**Device gate (Neni 72): passed, by the owner on the Mac.** On the web nothing changes, as proven by `storage_trace.mjs` and the no-host rows of `photohost_test.mjs`.

**Backups:**
- **Production:** `index.html.bak-pre-v597-20261007-132408` (= V595, `f249aa63…`), hash-verified before the copy and again after it.
- **Sandbox:** `index-test.html.bak-pre-v597-20261007-132408` (= V596, `16a876a3…`).
- **Identity:** `md5 -q index.html index-test.html 597.html | sort -u` printed one hash (`bc04157e…`).

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `python3 tools/verify.py --file index.html` | WARN 1 (`ui.langChanged`), FAIL 0 → YES |
| Golden image export | 0.000 % in all six cases |
| `pdf_check` on `index.html`, desktop and `--mobile` | **ALL PASS: TEXT, ORDER, UNICODE and VISUAL 9/9 each** |
| `photo_test` / `cvhost_test` / `cvdoc_test` / `photohost_test` | ALL PASS each |
| `storage_trace.mjs --fail` / `--ai` | 1 / 1 / 2 messages / no key copied, old `ai` removed |
| `webkit_photo.swift --ua safari --reload` | ALL PASS |
| Observatory on production | `V597`; 7 terminals; 0 duplicate ids; msg 69/69 in de/en/sq; **`PROBLEMS: none`** |

**Rollback:** production returns to V595 by copying `index.html.bak-pre-v597-20261007-132408` over `index.html` (the command is in *Current baseline*). With V595 the Mac app falls back to the browser photo path, so nothing breaks.

### Release record — V595 (2026-10-05) — Mac Phase 2: the CV as a `.uicv` document (V589–V594)

**Promoted on the owner's instruction** after their hands-on check of the Mac test build with core V594. The real first-launch import produced `Documents/Ultra Instinct CV/CV-ja ime.uicv`, and a double-click opened it. The owner's edits (a design change at 02:29, a text edit at 10:13) were autosaved into the file. The owner: "çdo gjë funksionon nga ato që rregullove". V595 is V594 plus the build label and its history line; a byte comparison confirmed that nothing else differs.

**What it carries, V588 → V595.** The full evidence is in *Sandbox ahead of production — V589–V594*.

| Version | Change | Class | Persistence |
|---|---|---|---|
| V589 | `window.CVStore`: the one door to the document's storage (on the web it is `localStorage`, byte-identical) | Refactor; no behaviour change | identical (`storage_trace`) |
| V590 | The CV state is written only when it changes (R-1/F-2): 35 s idle 1 → 0 writes, a test session 15 → 7 | Behaviour (fewer writes) | identical content; `timestamp` = time of the last real change |
| V591 | A failed state save is announced once per run of failures (F-1, `msg.stateNotSaved`) | Visible (a message on failure only) | none |
| V592 | A red ⚠ on error messages; success and info keep the green ✓ (D-006 D) | Visible (icon) | none |
| V593 | The AI leftover leaves the CV data; old API keys are no longer copied into the state (D-006 C) | Privacy | `ai` dropped from stored state |
| V594 | Host source for a Mac `.uicv` (data, photo bytes, the profile photo; D-006 A/B); restored photos no longer re-saved on load | Native-host hook; one redundant web write removed | photo records keep `rw`/`rh` from their last real change |

**Device gate (Neni 72): passed, by the owner on the Mac** (the test build with core V594): import, open by double-click, autosave into the file. The web-visible changes are the error message and icon (V591–V592, checked on screen). The rest is invisible on the web and proven by `storage_trace.mjs` and `cvdoc_test.mjs`.

**Backups:**
- **Production:** `index.html.bak-pre-v595-20261005-102116` (= V588, `3bd91f3a…`), hash-verified before the copy and again after it.
- **Sandbox:** `index-test.html.bak-pre-v595-20261005-102116` (= V594, `7332dbba…`).
- **Identity:** `md5 -q index.html index-test.html 595.html | sort -u` printed one hash (`f249aa63…`).

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `python3 tools/verify.py --file index.html` | WARN 1 (`ui.langChanged`), FAIL 0 → YES |
| Golden image export | 0.000 % in all six cases |
| `pdf_check` on `index.html`, desktop and `--mobile` | **ALL PASS: TEXT, ORDER, UNICODE and VISUAL 9/9 each** |
| `photo_test.mjs` / `cvhost_test.mjs` / `cvdoc_test.mjs` | ALL PASS / ALL PASS / ALL PASS |
| `storage_trace.mjs --fail` / `--ai` | 1 / 1 / 2 messages / no key copied, old `ai` removed |
| `webkit_photo.swift --ua safari --reload` | ALL PASS |
| Observatory on production (`tools/observatory_run.mjs`) | `V595`; 7 terminals; 0 duplicate ids; msg 69/69 in de/en/sq; **`PROBLEMS: none`** |

**Rollback:** production returns to V588 by copying `index.html.bak-pre-v595-20261005-102116` over `index.html` (the command is in *Current baseline*). A rollback below V594 is safe for the web; a Mac `.uicv` needs a V594+ core.

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
