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
| **PRODUCTION** | `index.html` | `344981559f698fad6ae07ba749973803` | 1,335,625 | 2026-10-02 |
| **Release snapshot** | `567.html` | `344981559f698fad6ae07ba749973803` | 1,335,625 | 2026-10-02 |
| **Rollback point** | `index.html.bak-pre-v567-20261002-151841` | `b461676d82a2826ec66d7f2f54fd289b` (V565) | 1,346,255 | 2026-10-02 |

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

**V567 is the reference point for every future audit.** A future delta-audit compares against
`34498155`. (V565 = `b461676d` is the rollback target; V550 = `792082b8` is two back.)

`window.CV.build` reports **`V567`** in production — measured from the artifact. Since V509 the label
is bumped with every version, which is why it can be trusted again; **identity is still the hash.**

```bash
cp "index.html.bak-pre-v567-20261002-151841" "index.html"
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

#### Sandbox ahead of production — V510–V519 (2026-09-22 / 09-27) — CLOSED by the V520 promotion

Production stays V509 (`660bc50b…`). The sandbox moves ahead in single-cause versions, per Neni 20.4. **Closed on 2026-09-27:** `index-test.html` = `index.html` = `520.html`. The records below are kept as the working history of each change.

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V510 | `510.html` | `3b52e5619e221560a874460ab5dd1fd2` | 1,268,531 | `index-test.html.bak-pre-v510-20260922-013831` (= V509, `660bc50b…`) |
| V511 | `511.html` | `eeaea757266e0124908cc5dfcb7d4a98` | 1,270,238 | `index-test.html.bak-pre-v511-20260922-014352` (= V510, `3b52e561…`) |
| V512 | `512.html` | `00adbe5ee3aab416b28de5be6b616ec8` | 1,271,486 | `index-test.html.bak-pre-v512-20260927-000658` (= V511, `eeaea757…`) |
| V513 | `513.html` | `3e3497ae27a209c7d0110f24bc307b52` | 1,272,960 | `index-test.html.bak-pre-v513-20260927-001506` (= V512, `00adbe5e…`) |
| V514 | `514.html` | `10feb1357fc73a5595356edd055cf7e3` | 1,274,471 | `index-test.html.bak-pre-v514-20260927-002552` (= V513, `3e3497ae…`) |
| V515 | `515.html` | `400539483da3fdb383bfc876cc3b9ac6` | 1,275,493 | `index-test.html.bak-pre-v515-20260927-005905` (= V514, `10feb135…`) |
| V516 | `516.html` | `3a0aa4a50996a23de85ab4d42bc0e047` | 1,276,459 | `index-test.html.bak-pre-v516-20260927-010040` (= V515, `40053948…`) |
| V517 | `517.html` | `1c254fef7c9ed5cd73cc0fa86d940448` | 1,277,195 | `index-test.html.bak-pre-v517-20260927-011716` (= V516, `3a0aa4a5…`) |
| V518 | `518.html` | `8c55cd791b922e9ad5433efd7aacccd2` | 1,278,640 | `index-test.html.bak-pre-v518-20260927-162722` (= V517, `1c254fef…`) |
| V519 | `519.html` = `index-test.html` | `aaea767ddfd8efaa43daa131a2353099` | 1,280,200 | `index-test.html.bak-pre-v519-20260927-164542` (= V518, `8c55cd79…`) |

**V519 — the "Modern" design's contact pills are rebuilt for the export.**
- **Defect:** in `tpl-modern` every contact pill came out filled with solid violet and its text nearly invisible — email, phone, city, birth date, licence, language and the Skills/Hobby bar. The live page reads fine.
- **Cause, measured:** `.contact-item` carries no background of its own. The look is two layers *behind* the content: `::before` (gradient, `z-index:-2`) and `::after` (dark fill `rgba(10,10,20,0.96)`, `inset:3px`, `z-index:-1`). html2canvas does not honour a negative `z-index` on pseudo-elements and paints them **over** the text. "Classic" escapes it only because its `::before` is a conic-gradient, which the engine does not draw at all; "Modern" uses a linear-gradient, which it does.
- **Fix (Neni 74):** inside the export document the same look is rebuilt from primitives the engine draws — a real background and a single border on the element itself — and the two layers are hidden. The text sits above its own background again. Scoped to `.tpl-modern`; the live page and the other designs are untouched.
- **Verified:** Save as Image in `tpl-modern` on the **Mac** and on the **iOS Simulator** — pills dark, text white and readable, violet rim, phone number white, title centred. The defect had reproduced identically in both, with the default pill width and with a widened one.

**V518 — the contact links keep their colour inside the export on iOS.**
- **Measured in the Simulator, and this is what V516 had missed:** on the live page the visible phone number is a plain `span.editable` with **no anchor at all** (the probe reported `neAnkor=jo`), and it is white. The blue appears only in the **produced artefact**. `#cvStaticFallback` stays hidden while working, but the export renders it, and there the contacts are real anchors. In that document iOS applies its own link styling — directly or through data detectors — and `color` does not outrank it.
- **Why V516 could not have worked:** it targeted `#cvStaticFallback .cv-ql-link` on the live page, an element that is never visible, so the rule had nothing to do with the number the user sees.
- **Fix:** one rule in `ExportTheme.generate()`, inside the export document only (Neni 8.5), covering all three routes: our own `.cv-ql-link`, any `tel:`/`mailto:` anchor, and links iOS injects with `x-apple-data-detectors`.
- **Verified in the Simulator (iPhone 17 Pro):** Save as Image on V517 produced a blue, underlined number; the same run on V518 produces it **white**, matching the email beside it, with the title centred. The live page is unchanged in both.

**V517 — one centring authority; the V514 export rule is removed.**
- **Regression I caused.** V514 stretched `#titleEditable` across the header with `inset:0` and centred it with flex, because the live page then centred with `margin:auto`. V515 replaced the live technique with `left/top:50%` + `translate(-50%,-50%)`. Together they compounded: the box filled the header **and** was shifted half its size up and left, so the title landed outside it.
- **Measured on the iPhone, from the user's own exports (V516, server log confirms `?v516` was loaded at 01:05 and 01:09):** in the dark design the title is clipped at the top-left corner; in the light design it is **gone entirely**. Both PDFs were rendered to PNG and read. **Reproduced on the Mac** with Save as Image.
- **Fix:** the export-scoped rule is deleted, with a comment in its place (Neni 23). Centring now has a single authority — the live V515 rule — and the export inherits it. Verified: html2canvas resolves `translate(-50%,-50%)` correctly, which is what made V514 unnecessary in the first place.
- **Verified on the Mac:** exported image centred in `tpl-default` and again after switching to `tpl-neumorphic/tpl-bw`, where the title had been missing entirely. Live centre 664 = header centre 664 in both.
- **Lesson recorded:** two rules owning one position is one owner too many (Neni 7). V514 fixed a symptom of V515's future cause; had the live page been checked on the device first, V514 would never have been written.

##### Open finding — the "modern" design exports unreadable contact text (2026-09-27) — FIXED in V519

Asked to test a **resized** contact pill, the widened phone box exports correctly: at 330 px instead of the default 216 px the pill keeps its size, the number stays white and the title stays centred. **Resizing is not a factor.**

The same run in the next design (`tpl-modern`) exposed a different defect: in the produced artefact every contact pill is filled with solid violet and its text is almost invisible — email, phone, city, birth date, licence, language and the Skills/Hobby bar. The live page in that design is perfectly readable, so the loss happens during capture.

| Where | Result |
|---|---|
| iOS Simulator, `tpl-modern`, widened pill | text unreadable |
| iOS Simulator, `tpl-modern`, default width | text unreadable — so not the resize |
| Mac, `tpl-modern` | **identical** — reproducible here, so not iOS either |
| iOS + Mac, `tpl-default` | correct in both |

Reproducible on the Mac, which makes it cheap to fix. Not yet diagnosed: the pill's background is presumably a gradient or a translucent layer that the engine rasterises as opaque, or the text colour resolves against the wrong layer. **V519 candidate**, to be taken with a measurement of the merged export document (Neni 71.2), not of the live page.

##### iOS Simulator reading — 2026-09-27 (iPhone 17 Pro, iOS 26.5 runtime), sandbox V517

Xcode was installed during this session, so iOS can now be exercised here between device tests. **The simulator is evidence, not the gate** — Neni 72 still requires the real iPhone, which alone shows real timing, real GPU behaviour and Web Share.

| Reading | Result |
|---|---|
| Terminal 1's title, live page | **Centred.** V515 + V517 hold on iOS, where V514's own fix had made it worse. |
| Phone number, live page | **White.** The blue does not reproduce here. |
| `diag-tel-ios.html`, all seven variants | Every variant white except the unstyled control — same as Safari on the Mac. |

So the blue is narrower than "iOS": it needs something the simulator does not have — a different iOS version on the user's phone, or a device setting such as Accessibility → Button Shapes, which restyles links. The diagnostic page reports the iOS version along with its measurements, so one open on the real phone settles it.

**V516 was superseded by V518** (it targeted an element the user never sees).

**Earlier note, kept for the record:** The same iPhone exports still show the phone number blue and underlined, so the `-webkit-text-fill-color` rule did not settle it on iOS. Whether the live page on the phone is also still blue is the open question — that answer decides whether the cause is the live CSS or the capture.

> `515.html` was copied from `index-test.html.bak-pre-v516-20260927-010040`, which **is** the V515 state, byte for byte (`40053948…`). The name asserts nothing that did not happen: V515 was applied, verified on the Mac, and only then V516 was written on top of it.

**V515 — the live title centring no longer depends on `margin:auto`.**
- **What the device test corrected in the V514 diagnosis:** the screenshots of 2026-09-27 are of the **live page** on the iPhone, not of the exported artefact. So Terminal 1's title sits at the left on the phone *on screen*; the export merely copied that. V514 fixed the exported document only, which was necessary but not sufficient.
- **Cause:** iOS Safari does not resolve `auto` margins on a `position:absolute` element with `inset:0` and `width:fit-content`; it leaves the element at `left:0`. Chrome resolves them, which is why the Mac always looked right and the defect stayed invisible here. html2canvas behaves like Safari, which is why the export showed it too.
- **Fix:** the centre is now computed with `left/top:50%` + `translate(-50%,-50%)` — arithmetic every engine performs, with nothing left "auto" to resolve. Width stays `fit-content`, so the box does not stretch across the header and the buttons underneath stay clickable. The same technique replaces the `.tpl-neumorphic` override, so one technique serves every design.
- **Verified on the Mac:** title centre 590 = header centre 590, width 264, still editable, and `elementFromPoint` returns the window dots and the header buttons — not the title. **Awaiting the iPhone.**

**V516 — the contact links keep their colour on iOS.**
- **Defect:** the phone number renders blue and underlined on the iPhone, on the live page and therefore in the export. White on the Mac.
- **Cause:** `#cvStaticFallback .cv-ql-link` uses `display:contents` with `color:inherit !important`, but iOS Safari colours link text through `-webkit-text-fill-color`, which outranks `color` no matter how important it is.
- **Fix:** the same rule now also sets `-webkit-text-fill-color:currentColor` and extends to the descendants, where the text actually lives. On the Mac nothing changes, `currentColor` being the colour already inherited.
- **Verified on the Mac:** phone, icon and email all compute white with no underline, and the `tel:` / `mailto:` links still work. **Awaiting the iPhone**, which is the only place the defect appears.

**V514 — Terminal 1's title is centred in the export.**
- **Defect:** in the produced artefact the title sat at the left, over the window dots. Reported from the iPhone and **reproduced on the Mac**, so it is an engine limit (Neni 75), not iOS. On the live page `#titleEditable` is centred with `position:absolute; inset:0; margin:auto; width:fit-content`; html2canvas does not resolve `auto` margins and places the element at `left:0`.
- **Proof that the technique, not the export, is the cause:** the titles of the other terminals (inside the iframe) are `position:static` with `text-align:center`, and they come out correctly **in the same image**.
- **Fix (Neni 74 + 8.5):** one rule added to `ExportTheme.generate()`, so it exists only inside the export document: `#titleEditable` spans the header and centres its text with flex — no `auto` margin left for the engine to resolve. It is **not** applied to the live page, where the element is editable and a full-width box would swallow the clicks of the buttons beneath it. Scoped to the id, so the other terminals' titles are untouched. `CV.build = 'V514'`.
- **Verified in the Browser pane** through the real export path (Save as Image, no injected styles): the title renders centred, dots at the left, identical to the terminals below. On the live page the title keeps its geometry (x 481, width 264) and stays editable. The PDF path shares the same export document and the same theme CSS.

**V513 — one preparation at a time.**
- **Defect:** the V507 guard only blocked a preparation with the *same* key. A real selection change therefore started a second preparation *beside* the first. Rasterisation cannot be cancelled and blocks the main thread for ~10 s, within which the other export's iframe never receives its `load` event and hits its 10 s ceiling: `Export iframe load timeout`. The second preparation failed precisely because the first was running. On a phone, where every step is far slower, this is the most likely origin of the incomplete package of 2026-09-26.
- **Measured (V510, V511 and V512 alike):** CD preparing, Work Certificate unchecked 150 ms later → 2 preparations in flight, timeout, nothing shared.
- **Fix:** while a preparation is in flight, a second one does not start; it only records that a re-run is wanted. The in-flight one notices the change at its own `current()` checkpoint and returns, and `finally` starts a fresh preparation for the selection of that moment. A queue instead of a race. The label goes idle for about 5 ms between the two, which is deliberate: keeping it lit would strand it if the re-run returns immediately with files already prepared.
- **Verified A/B in the Browser pane** (mobile emulation, Web Share stubbed):

| Case | V512 (control) | V513 |
|---|---|---|
| CD preparing → Work Certificate unchecked | 2 preparations in parallel, nothing shared | **max 1 in flight**; re-run starts 5 ms later; CV shared, matching the selection |
| CD preparing → Motivation on/off **and** Share tapped during it | — | **max 1 in flight**, no restart, **2 files** shared afterwards |
| Desktop | — | sheet opens, no preparation, zero errors |

**V512 — an incomplete package is never published.**
- **Defect, observed on the iPhone (see the device test below):** with CV + Work Certificate selected, only the CV was delivered, and nothing said so. `generatePdfExport` swallows its own errors and returns `undefined`, so a failed document merely "went missing": `if(f) files.push(f)` followed by `files.length ? files : null` marked the package ready with one part out of two. The user believes two documents went to an employer while one did.
- **Fix:** the package is accepted only when every job produced its file (`files.length === jobs.length`, the count coming from the selection itself). Otherwise the state stays "not ready" — the next tap re-runs the preparation — and one clear notification is shown: *"Paketa nuk u përgatit e plotë (N nga M) — provo sërish"*. `CV.build = 'V512'`.
- **Verified A/B in the Browser pane** (mobile emulation, Web Share stubbed; the document job was made to fail by removing `.a4-page` from the live DOM, which is exactly the failure mode the phone hit):

| Case | V511 (control) | V512 |
|---|---|---|
| CV + Work Certificate, document job fails | `navigator.share` called with **1 file**, silently | **nothing shared**; notification "Paketa nuk u përgatit e plotë (1 nga 2)" |
| CV + Work Certificate, both succeed | 2 files | **2 files**, no notification |
| Desktop | — | sheet opens, no preparation, no errors |

- **Follow-up:** the parallel preparations that make a job fail in the first place were removed in V513, below.

**V511 — share preparation: a result is valid while its selection key is current.**
- **Defect:** the V507 guard judged "same work" by selection key. Result validity, however, was judged by generation (`myGen === ssShareGen`), which `ssSchedulePrepare` bumped on every change, including a change that returns to the same key (CD → CMD → CD). The guard suppressed the replacement preparation, and the in-flight one discarded its own result as stale. No files were produced, and Share restarted from zero.
- **Measured on V510 (control):** mobile emulation with Web Share stubbed; CD preparing; Motivation on and off 150 ms after it started. After completion Share produced nothing and restarted the preparation.
- **First attempt — REJECTED, never snapshotted:** giving the guard the generation criterion (`__ssPrepGen === ssShareGen`) started the replacement *in parallel* with the old preparation, which cannot be cancelled. The old one's ~10 s main-thread block expired the new export's iframe (`Export iframe load timeout`), so the package came out with 1 file instead of 2. The sandbox was restored from `index-test.html.bak-pre-v511-20260922-014352` (Neni 24).
- **Fix:** the files depend only on the selection, because content is locked in preview (V504). A preparation therefore keeps its result when its key is still the current selection (`current()`), and on success it writes both `ssShareFiles` and `ssShareKey`. Returning to the same key preserves the in-flight work; a real selection change still discards it. `ssShareGen` / `myGen` were removed, and a comment marks the removal (Neni 23). `CV.build = 'V511'`.
- **Verified A/B in the Browser pane** (mobile emulation, Web Share stubbed, 150 ms trigger after preparation starts):

| Case | V510 (control) | V511 |
|---|---|---|
| CD → Motivation on/off → Share after completion | nothing shared, preparation restarted | **2 files shared** immediately; 1 preparation, never 2 in parallel |
| Share tapped *during* preparation (the V507 case) | — | no restart (max 1 in flight); 2 files shared after completion |
| Real change CD → C during preparation | 2 parallel, iframe timeout, nothing shared | identical — **pre-existing**, see below |
| Desktop | — | sheet opens, no preparation, zero errors |

- **Open finding — NOT fixed, pre-existing since V430:**
  - A *real* selection change during preparation starts the new preparation in parallel with the old one. The old one's main-thread block times out the new export's iframe, and nothing is produced.
  - Separately, a preparation where one job fails still publishes the remaining files as if complete. The rejected attempt shared 1 of 2 without warning.
  - Candidate for V512: serialize preparations (never two in flight) and publish only complete packages.

##### Device test — iPhone, Safari, 2026-09-26/27, sandbox V511 (Neni 72) — PARTIAL PASS

Served over plain `http://<LAN-IP>:8743/index-test.html`, so `navigator.share` is absent by design (Web Share needs HTTPS). That is the exact state V510 was written for.

| # | Case | Result |
|---|---|---|
| 1 | Share sheet opens; select Work Certificate | **PASS.** Opens at once, selectable without waiting (V503 confirmed on device). |
| 2 | Share Package, **Work Certificate only** | **PASS.** Slow, but the PDF was produced and iOS offered the download. No "prek përsëri" loop — V510's fallback works on the device. |
| 3 | Share Package, **CV + Work Certificate** | **FAIL.** Only the CV was delivered. The package was silently incomplete — exactly the partial-publication defect named above, now observed on a real device. |
| 4 | Save as Image (document) | **NOT TESTED.** An attempt was made and did not complete; no usable observation was recorded. |
| 5 | Native iOS share sheet | **NOT TESTABLE** over `http` — needs an HTTPS origin. |

**Export rendering defects found during the test (they are in the produced artefact, not on the live page):**

- **Terminal 1's title renders left, over the window dots.** FIXED in V514. Reported from the iPhone, then **reproduced on the Mac** in the Browser pane (Save as Image, mobile emulation) — so it is an export-engine defect, not iOS-specific. The other terminals render centred. Cause: Terminal 1's title is centred with `position:absolute; inset:0; margin:auto; width:fit-content`, which html2canvas does not resolve; the terminals inside the iframe use a static, flex-centred title and come out correct. Fix per Neni 74: centre it with a primitive the engine does render.
- **The phone number renders blue in the export, on the iPhone only.** FIXED in V516. Not reproduced on the Mac, where it renders white. The contact is a real `tel:` anchor (`display:contents; color:inherit !important`); iOS most likely applies its own link colour while cloning for capture. To be forced explicitly in the export path.

**The device gate stays OPEN.** V510 is confirmed on the device for a single document; the multi-document package is not.

**V510 — the mobile share path is gated on capability, not platform.**
- **Defect:** the V430 flow (pre-generate Files, then call `navigator.share` inside the gesture) was gated only on `ssIsMobile`. On a phone without file sharing, "Share Package" looped forever on "Po përgatitet PDF… prek përsëri", even with the files ready, and no PDF was ever produced. Phones reach this state on a non-secure page (plain `http://` on the LAN, because Web Share requires HTTPS), in WebViews, and in browsers without support.
- **Measured before the fix (V509):** mobile emulation without `navigator.share`, files CD ready. Tapping Share produced the "not ready" toast again.
- **Fix:** a new `ssCanShareFiles()` asks for the capability at the moment of use (`navigator.share` + `navigator.canShare({files})`). It gates `ssPrepareShareFiles`, `ssSchedulePrepare` and the mobile branch of `ssHandleAction`. Without the capability, the sheet falls through to the existing general path (mode `share` → `ModeHandler.deliver` → `_downloadCascade` → `<a download>`), which already handled a missing share. The ~11 s pre-generation freeze is no longer started for nothing. Desktop is untouched: every new check sits behind `ssIsMobile &&` (Neni 73). `CV.build = 'V510'`.
- **Verified in the Browser pane:**

| Case | Result |
|---|---|
| Mobile emulation, no Web Share | Toggling Work Certificate starts no preparation (no long task, label unchanged). Share closes the sheet and delivers both PDFs through `<a download>` (`lebenslauf-…`, `vertetim-…`; intercepted, nothing written to disk). |
| Mobile emulation, Web Share stubbed | Unchanged V430 behaviour: "Po përgatitet…", ready after ~20 s, Share calls `navigator.share` with 2 files and makes no download. |
| Desktop | Sheet opens, Download Package visible, no preparation, zero console errors. |

- **Not verified:** the real iPhone (Neni 72). Over `http://<LAN-IP>` the phone should now download instead of looping. The native share sheet still needs an HTTPS origin to be tested.

#### Sandbox ahead of production — V521, V523–V528 (V522 withdrawn) (2026-09-27 / 09-28) — CLOSED by the V529 promotion

**Closed on 2026-09-28:** `index-test.html` = `index.html` = `529.html`. The records below are kept as the working history of each change.

Production was V520 (`d02b3b39…`). The sandbox moved ahead again, on the owner's instruction to take the three open items in the sandbox.

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V521 | `521.html` | `5b415f6a36eddbde0a422f3b7089e962` | 1,281,516 | `index-test.html.bak-pre-v521-20260927-173435` (= V520, `d02b3b39…`) |

**Housekeeping first:** the three diagnostic copies (`diag-app-probe.html`, `diag-resize.html`, `diag-tel-ios.html`) were moved to the Trash. They stay in git history.

**V521 — the mobile PDF honours the iOS canvas cap.**
- **Measured (mobile emulation, V520):** a plain CV rendered its PDF canvas at **3600 × 8964 = 32.3 MP** — twice the iOS backing-store cap (Neni 75a, ~16.78 MP). "Save as Image" had respected the cap since V495, but the PDF path used a fixed `config.scale = 3`. This is the rendering the owner kept reporting as very slow on the phone.
- **Fix:** the mobile scale computation no longer runs only for `mode === 'image'`; it applies to every mode. For PDF modes `pdfRatio` is compensated so that `scale × pdfRatio` stays 1.5, the V341 contract. So the PDF keeps **exactly the same page size in points** and only drops pixels no screen can show. Mobile only (Neni 73): the edit sits entirely inside the `_isMobile` branch (lines 6253–6294 of 6248–6443), so desktop keeps scale 3.
- **Verified A/B** (mobile emulation, same CV, single PDF):

| | V520 (control) | V521 |
|---|---|---|
| Canvas | 3600 × 8964 = **32.3 MP** | 2534 × 6311 = **16.0 MP** |
| PDF page (MediaBox) | 1800 × 4482 pt | 1799.4 × 4481.4 pt — the same |
| PDF file | 1301 KB | 897 KB |

- **Timing is deliberately not claimed from the Mac:** the V521 run happened while the Browser pane was hidden (`document.hidden = true`), which throttles the page, so its wall-clock time says nothing. The reliable measure is the pixel count, halved. In the **iOS Simulator** the PDF had already opened in Safari about 8 s after the tap, with the title centred and the number white. The real speed test is the owner's phone.

| V522 | `522.html` — **WITHDRAWN** | `931d3380035df2b51bdb96fb4591456b` | 1,283,478 | `index-test.html.bak-pre-v522-20260928-133334` (= V521, `5b415f6a…`) |

| V523 | `523.html` | `8eca0b10bc1420dd92edcc7588ca9e45` | 1,282,300 | `index-test.html.bak-pre-v523-20260928-141210` (= V521, `5b415f6a…`) |

**V523 — Terminal 1's title is centred in the Neumorphic export (designs 3 and 4).**
- **Reported by the owner on the iPhone:** in design 4 the exported title sat left and was clipped at the top. The live page was correct.
- **Measured with a probe inside the export document (iOS Simulator):** at the moment of capture Neumorphic and Modern reported **identical** values for `#titleEditable` — `left 599px`, `top 18px`, the same `translate` matrix. Modern rendered centred and Neumorphic did not.
- **Cause — a defect introduced by V515:** before measuring a transformed element, html2canvas sets `style.transform = 'none'` on it inline, measures the untransformed box, then applies the transform itself. The `.tpl-neumorphic .terminal-title` override repeated the base rule's values with `!important`, including `transform:translate(-50%,-50%)!important`, and that beat the inline `none`. The engine therefore measured the title *already shifted* and shifted it *again*: half its width left, half its height up. Classic and Modern escaped because the base rule has no `!important`.
- **Fix:** `transform` is removed from the Neumorphic override, with a comment in its place (Neni 23). The base `.terminal-title` rule is the single authority for the shift. The override keeps position, size and colour.
- **Verified:** live page centred in all four designs (centre 600/600, vertical 29/30), and Save as Image in design 4 in the iOS Simulator renders the title centred. Design 3 (Black & White) shares the same override and the same fix.

**V522 — WITHDRAWN on 2026-09-28 at the owner's request.** After seeing it, the owner asked for Terminal 1 to look exactly as it did before. The sandbox was restored from `index-test.html.bak-pre-v522-20260928-133334` and verified byte-identical to `521.html` (`5b415f6a…`). Both V522 rules are gone: the turquoise rim and the narrowed V322 selector. So Terminal 1 in the export is again pixel-identical to V509/V520, and the description block has no box, as before. `522.html` stays as the record of what was tried (Neni 22). The drawn rainbow glow remains the only route to the on-screen look, if it is ever wanted.

**V522 as it was built:**
- **Background:** on screen every Classic pill carries a rotating rainbow glow (`::before` conic-gradient + blur). The engine draws neither (Neni 75b), so no export ever showed it — the pixel comparison of V509 against V519 found the pills identical. The owner asked for the pills to look closer to the page.
- **First attempt — a prototype, never written to the sandbox — REJECTED:** a gradient rim built from two backgrounds (`padding-box` + `border-box`). The rule was verified to apply inside the export document, yet the engine does not clip backgrounds per layer, so the pills came out dark with no rim at all (iOS Simulator).
- **Chosen by the owner, from three options:** a plain 2 px rim in Classic's accent colour. Built with the V519 technique: a real background and border on the element, the pseudo layers hidden, text on top of its own background. Export only (Neni 8.5), `.tpl-default` only.
- **The description block had a rule of its own.** V322 had removed its box in every dark design ("no rotating-glow render issues in PDF"). With specificity 0,3,1 it would have beaten V522's rule, leaving "Berufliche Beschreibung" without a box while the six pills had one. V322's reason no longer holds for Classic, so its selector was narrowed at the root to `body:not(.tpl-neumorphic):not(.tpl-default)` rather than overridden by a third rule (Neni 8). Modern keeps V322's behaviour.
- **Verified in the iOS Simulator** (Save as Image, Classic): all six contact pills, the Skills/Hobby bar and the description carry the turquoise rim; text white and readable; title centred; phone number white.

**V524–V528 — the old findings from the first analysis (2026-09-19), closed by importance.**
The owner asked on 2026-09-28 to act on the seven findings that had been left untouched, removing things at the root where they should go. Five were code defects and are fixed below, one version each, in order of importance. Two are **not** code defects and were deliberately left unchanged:
- **The iOS share sheet needs HTTPS.** Web Share with files is only offered in a secure context. Over `http://<LAN-IP>` the phone correctly falls back to downloading (V510). This is an environment matter, and no code change can fix it. To test the native share sheet on the phone, the page must be served over HTTPS.
- **Mixed UI languages in notifications** (Albanian, German and English side by side). Choosing the target language is the owner's decision, so nothing was changed yet.

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V524 | `524.html` | `b11fae12441693dfd82e4f79186b6d05` | 1,284,321 | `index-test.html.bak-pre-v524-20260928-143459` (= V523, `8eca0b10…`) |
| V525 | `525.html` | `bed98df5b481adfa4f2708b5d40ab2a9` | 1,283,825 | `index-test.html.bak-pre-v525-20260928-143837` (= V524, `b11fae12…`) |
| V526 | `526.html` | `04647721007315f55a0946ef2b6c686d` | 1,284,535 | `index-test.html.bak-pre-v526-20260928-144045` (= V525, `bed98df5…`) |
| V527 | `527.html` | `9d6e612fbc70b06118d82fb506bc0ff4` | 1,284,873 | `index-test.html.bak-pre-v527-20260928-144303` (= V526, `04647721…`) |
| V528 | `528.html` | `dd3524eed3cbc8183e3787441b898780` | 1,286,060 | `index-test.html.bak-pre-v528-20260928-144500` (= V527, `9d6e612f…`) |

Each backup was hash-checked against the previous snapshot, so the chain V523 → V528 has no gaps.

**V524 — Subresource Integrity on the CDN libraries.**
- **Finding:** html2canvas, jsPDF and html-to-image were loaded from public CDNs without `integrity`. The page holds personal data (address, phone, birthdate), so a tampered CDN file would have run with full access to it.
- **Fix:** `ExportConfig.libraryIntegrity` maps each pinned URL to its `sha512` hash. `ensure()` sets `integrity` and `crossOrigin = 'anonymous'` on the tag. html-to-image now points to the unminified official npm file of the same pinned version (`1.11.13/dist/html-to-image.js`, was `.min.js`), whose hash was computed from the file that version publishes.
- **Verified:** a deliberately wrong hash is refused by the browser, and the right one loads. The export works on the Mac and in the iOS Simulator.

**V525 — the ghost "PDF Export" modal removed (Neni 46).**
- **Finding:** `#pdfExportModal` (markup plus four CSS rules) had been replaced by the Export Package sheet long ago. No code opened it any more.
- **Fix:** the markup and the four rules were removed at the root. Each was replaced by a Neni 23 comment naming what went and why.
- **Verified:** the only remaining mention of `pdfExportModal` is the Neni 23 comment itself. The export flow is unchanged.

**V526 — no raw NUL byte in the file.**
- **Finding:** CVQualify's `fingerprint()` joined its parts with a raw NUL byte written into the source. The HTML parser replaces NUL in a script with U+FFFD, so the file said one thing and ran another. It also made the file look binary to some tools.
- **Fix:** the separator is written as `'�'`, the character the browser had always used. A first attempt with `'\x00'` changed every fingerprint, because it was not what had actually run. It was corrected before the commit.
- **Verified:** the file holds 0 NUL bytes, and fingerprints are identical to V525.

**V527 — one source for mobile detection (Neni 33/34).**
- **Finding:** the same user-agent, iPad-as-Mac and coarse-pointer test existed twice, once for the share sheet (`ssIsMobile`) and once in the export (`_isMobile`). Two copies of one rule drift apart sooner or later.
- **Fix:** `Utils.isMobileDevice()` holds the rule once, and both call sites use it.
- **Verified:** desktop reports `false` and mobile reports `true`, with no console errors. The combined iOS regression below took the mobile path.

**V528 — one script tag per library, loaded in parallel.**
- **Finding:** after a load timeout (V509) the old tag stayed in the document and a retry added a second one. The three libraries were also loaded one after another, although none depends on another.
- **Fix:** each tag carries `data-cv-lib="<url>"`. Before a retry, `ensure()` removes any earlier tag for the same URL. html2canvas, jsPDF and the optional html-to-image load together via `Promise.all`. html-to-image stays optional: if it fails, the export falls back to html2canvas.
- **Verified:** on the Mac, one tag per library, also after a forced reload (`delete window.html2canvas` → retry → still one each). The **combined regression V524–V528** ran in the iOS Simulator (Modern design, Share Package): an 851 KB PDF, and the share sheet opened.
- **Not verified:** the real iPhone (Neni 72).

#### Sandbox ahead of production — V530 (2026-09-28) — CLOSED by the V531 promotion

**Closed on 2026-09-29:** `index-test.html` = `index.html` = `531.html`. The record below is kept as the working history.

Production was V529 (`924e655c…`).

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V530 | `530.html` | `afc150724dd80c2aa2401a12cb465fec` | 1,295,930 | `index-test.html.bak-pre-v530-20260928-155148` (= V529, `924e655c…`) |

**V530 — notifications follow the language flag.**
- **Finding (the sixth from the 2026-09-19 analysis):** notification texts were hard-coded in three languages, whatever the project was set to:
  - most were Albanian ("U ruajt me sukses!");
  - some were German ("Bitte mindestens eine Option auswaehlen", "Aktion fehlgeschlagen", "PDF-Link kopiert");
  - some were English ("Undo", "PDF export failed").
- **The owner's decision** (asked explicitly, because the project has two languages): the app declares itself Albanian (`<html lang="sq">`), while the flag sets the CV's language, currently German. The owner chose **the flag**, so notifications now change together with it.
- **Fix, one source:**
  - Every notification text lives in `TranslationManager.TRANSLATIONS[lang].msg`: 57 keys, complete in de, en and sq.
  - `TranslationManager.msg(key, params)` takes the language from Terminal 1's `state.language`, the source the flag itself reads. It falls back to `de` per key, as `get()` does, and fills `{name}` placeholders.
  - `Utils.msg()` is the entry point in the main document.
  - The CV Creator iframe and the A4 photo layer go through `translationManager`, which is a `window` property. `class Utils` is a lexical binding and is not visible from the iframe (see below).
  - All 47 call sites were rewritten; no hard-coded notification text remains.
  - `ModeHandler._docMsg()` names the document in the flag's language for notifications only. `_docLabel()`, the document's own title used for the share title and the image `alt`, is unchanged, and so are the file names.
- **Deliberately unchanged:** button labels in the export sheet ("Save as Image", "Share Package"), the long-press hint on the image overlay, and the photo-upload status text. These are interface labels, not notifications.
- **Verified:**
  - On the Mac, with the real flag button and a real notification (leaving preview), the notification read, in turn:
    - sq: "Modaliteti i redaktimit aktiv";
    - en: "Edit mode on";
    - de: "Bearbeitungsmodus aktiv".
  - The Terminal 1 title changed with it each time.
  - Inside the iframe, the real `undo()` with nothing to undo showed, in turn:
    - sq: "Nuk ka më veprime për të kthyer mbrapa";
    - en: "Nothing left to undo";
    - de: "Nichts mehr rückgängig zu machen".
  - Placeholders fill correctly ("Paketa nuk u përgatit e plotë (1 nga 2)").
  - An unknown key returns the key itself, never an empty notification.
  - 27 scripts pass `node --check`; the file has 0 NUL bytes.
  - iOS Simulator: with the flag switched to Albanian, a PDF export produced a 1 MB PDF and the share sheet opened. The notification itself sits under the sheet's blurred backdrop, so its text was verified on the Mac rather than read from the simulator. The language was restored to German afterwards.
- **Device gate (Neni 72) — confirmed on the owner's iPhone, 2026-09-29.** The phone loaded V530 over the LAN (server log: `GET /index-test.html?v530…` from `192.168.1.108` at 14:18:58). The owner tested:
  - the language flag;
  - the leave-preview notification in Albanian and in German;
  - a normal PDF download.

  The owner reported that everything works. The native share sheet was not part of the test, as it needs HTTPS.
- **Found on the way, NOT fixed here (single cause, Neni 20.4):** `window.Utils` is `undefined` because `class Utils` is never assigned to `window`. So every notification guarded by `window.Utils` has never been shown:
  - the A4 photo toolbar (border, corners, shadow, "fetching photo", "drop an image");
  - the "PDF export failed" message in `ExportEngine`.

  Both have been silent since they were written. Showing them is a behaviour change and belongs in its own version.

#### Sandbox ahead of production — V532–V536 (2026-09-29) — CLOSED by the V537 promotion

**Closed on 2026-09-29:** `index-test.html` = `index.html` = `537.html`. The records below are kept as the working history of each change.

Production was V531 (`c418ef74…`). The owner answered "po bej te gjitha rregullimet" to three questions:
- promote V530, done as V531;
- make the notifications that had never been shown appear;
- let the export sheet's labels follow the flag.

The last two are taken here, one cause per version.

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V532 | `532.html` | `9af1183564db32cb270f5630eb574881` | 1,296,600 | `index-test.html.bak-pre-v532-20260929-143612` (= V531, `c418ef74…`) |
| V533 | `533.html` | `46323178a995faa99c43b4495473ce9e` | 1,300,617 | `index-test.html.bak-pre-v533-20260929-144107` (= V532, `9af11835…`) |
| V534 | `534.html` | `6f1b3176345f72e6a8b3010ef43ac7a3` | 1,301,929 | `index-test.html.bak-pre-v534-20260929-144844` (= V533, `46323178…`) |
| V535 | `535.html` | `7ef8ff9af493a7ff5b9e2b7d0626da40` | 1,303,647 | `index-test.html.bak-pre-v535-20260929-145412` (= V534, `6f1b3176…`) |
| V536 | `536.html` | `4e1e3c0adb99be0bd0d570f2adf1e895` | 1,307,008 | `index-test.html.bak-pre-v536-20260929-150111` (= V535, `7ef8ff9a…`) |

**V532 — the silent notifications are shown (`window.Utils`).**
- **Finding (recorded at V530):** `class Utils` is a lexical global binding and never became `window.Utils`. Exactly two places look for it on `window`, and so did nothing since they were written:
  - the "PDF export failed" message in `generatePdfExport`'s catch;
  - `notify()` in the photo layer: border, corners, shadow, reflection, "fetching the photo", "drop an image".
- **Fix at the root:** one line after the class, `window.Utils=Utils;`, with a Neni 23 comment. Adding a separate check at each call site was rejected, because the next caller would fall into the same trap. The two guards were the only `window.Utils` or `parent.Utils` references in the file.
- **Verified in the isolated origin (port 8901), with a test photo created through `CVPhotoEngine.create` and removed afterwards:**
  - The photo toolbar now reports each change in the flag's language:
    - German: "Rahmen: 2px", "Ecken: rund", "Schatten: weich", "Spiegelung — demnächst";
    - Albanian: "Korniza: 6px", "Qoshet: 12px", "Hija: e butë".
  - A deliberately failing render engine (stubbed only in that page), with "Save as Image":
    - **V532:** the notification reads "PDF-Export fehlgeschlagen: prova V532";
    - **V531 (control):** the same failure shows nothing and only logs to the console.
  - 27 scripts pass `node --check`; 0 NUL bytes.

**V533 — the export sheet's labels follow the flag.**
- **Before:** every label in the export sheet was fixed in English, whatever the flag said:
  - "Export Package", "1 document selected";
  - "CV Resume", "Motivation Letter", "Work Certificate";
  - "Career Package", "1 Document Ready";
  - "Download Package", "Save as Image", "Share Package".

  The busy label of the share button was fixed in Albanian ("Po përgatitet…").
- **Fix, same single source as V530:**
  - The labels live in `TRANSLATIONS[lang].ui` (18 keys per language).
  - `TranslationManager._text(ns, key, params)` now serves both `msg()` and the new `ui()`, and `Utils.ui()` joins `Utils.msg()`.
  - The document names come from the same `msg.docCv / docMotivation / docCertificate` the notifications use. Their English values were aligned to the sheet's long-standing wording, so the sheet reads exactly as before in English.
  - `ssApplyLabels()` sets the static labels each time the sheet opens. The flag cannot be reached while the sheet is open, so opening is enough.
  - `ssUpdateMeta()` builds the count, the list and the "ready" line from the catalogue, with singular and plural forms. The list items are now HTML-escaped.
  - The share button's busy/idle labels come from the catalogue, instead of a `dataset.ssLabel` copy that would have kept the language of the first opening.
  - The "preparing" notification names the button by its current label (`{button}`).
- **Deliberately unchanged:**
  - the photo toolbar's tooltips;
  - the long-press hint on the image overlay;
  - the share title "Bewerbung";
  - the desktop file-picker's type label.
- **Verified:**
  - On the Mac (isolated origin), the sheet was opened through the real path (preview → download button) in sq, en and de. Title, count, the three documents with subtitles, package name, contents list, ready line and all three buttons each followed the flag, including the three-document and empty-selection cases. English reads exactly as V532 did.
  - In the iOS Simulator the sheet fits at phone width in German and in Albanian: "Exportpaket", "Paket teilen"; "Paketa e eksportit", "Ndaj paketën".
  - The share button showed "Wird vorbereitet…" while preparing and returned to "Paket teilen"; the 1.1 MB PDF opened in the share sheet.
  - The simulator's language was restored to German afterwards.
  - 27 scripts pass `node --check`; 0 NUL bytes.

**V534 — phones get the desktop viewport before the first paint.**
- **Reported by the owner on the iPhone (screenshot):** while the page loads over Wi-Fi it first appears as a narrow phone layout (a huge photo card, the title cut to "Persönliche Informa…"). Then, once loading ends, it jumps to the full desktop-on-mobile view.
- **Cause, two authorities in sequence:**
  1. V376's head script switched every device to `width=device-width` as soon as JavaScript ran.
  2. Only the Layout Architecture bootstrap, at the end of the ~1.3 MB document, switched phones back to `width=1200`.

  Everything painted in between used the phone layout. The later rule also measured the phone with `innerWidth`, which stops describing the device once the viewport is 1200.
- **Reproduced:** a throttled local test server (~130 KB/s, `127.0.0.1` only) served the page to the iOS Simulator. 4 s after opening, V533 showed exactly the owner's screenshot.
- **Fix at the root, one decision in one place:**
  - The head script now defines `window.__cvIsPhoneViewport()`: touch, and the short edge of the *screen* ≤ 900. It measures `screen` because `innerWidth` is still 1200 from the static meta at that moment.
  - Phones get `width=1200, user-scalable=yes, viewport-fit=cover` there, before anything paints. Other devices keep `device-width`, as before.
  - `isPhoneDevice()` in the Layout Architecture now calls the same function instead of its own formula.
  - Quick Look (no JavaScript) still gets the static `width=1200`.
- **Verified:**
  - With the same throttled load, 4 s after opening, V534 already shows the desktop proportions, and the page completes to the identical desktop-on-mobile view with no jump.
  - On the Mac the viewport stays `device-width`, `__cvIsPhoneViewport()` is `false` and the layout mode is `desktop`.
  - 27 scripts pass `node --check`; 0 NUL bytes.

**V535 — Reset Default and a fresh start keep the chosen language.**
- **Reported by the owner (Browser pane, V533):** after switching the flag and pressing ↻ (Reset Default, titled "Rivendos pozicionet në default"), the notification came in German, not in the chosen language.
- **Measured in the owner's tab:** the CV state was `de` while `translationManager.currentLang` and `cv_language` were still `sq`. The reset had silently changed the language and left the three sources disagreeing.
- **Cause:**
  - `getDefaultState()` hard-codes `language:'de'`.
  - Reset Default installed it as-is.
  - So did a start with no stored state, which is also where the reset's fallback path lands after its reload.
  - `ContactManager.loadState()`'s zero-seed branch did the same when positions were still at zero, as they are right after a reset. It then wrote that `de` back into `currentLang` and `cv_language`, while `appState` stayed in the other language.
- **Fix, one rule in one place:**
  - `TranslationManager.withLanguage(state, lang)` carries the chosen language onto a fresh default state. A given `lang` (the current state's language) wins; otherwise it uses `currentLang`, read from `cv_language`.
  - It is applied at the three places a default state is installed: Reset Default, the initial state when nothing is stored, and the zero-seed branch of `loadState()`.
  - `getDefaultState()` itself is unchanged, because it is also used by normalisation and by the CVQualify apparatus.
  - A clean start with no preference still gives `de`.
- **Verified in the isolated origin:**
  - Reset with the flag on sq keeps `sq` everywhere, with "Të gjitha pozicionet u rivendosën në default!". After a reload it is still `sq` in state, `currentLang` and `cv_language`.
  - A start with no stored state but `cv_language=sq` gives `sq` throughout.
  - A clean start with no preference gives `de`.
  - Reset in de gives "Alle Positionen wurden zurückgesetzt!", and reset in en gives "All positions were reset!" with `en` kept.
  - **Control, V534:** the same sq → reset gives state `de`, `currentLang` `sq` and the German notification, exactly the owner's observation.
  - 27 scripts pass `node --check`; 0 NUL bytes; no console errors.
- **Noted, unchanged:** `#autosaveMessage` carries the static placeholder "Autosave u krye me sukses" in the markup. It is never displayed, because `Utils.showNotification` is the only code that shows the element and it always sets the text first.

**V536 — the page appears complete, once, after loading.**
- **Reported by the owner on the iPhone (screenshot, after V534):** loading no longer starts in the phone layout, but for several seconds the page shows only Terminal 1's frame and the photo card, and then the full project.
- **Cause:**
  - The file is ~1.3 MB and the browser paints whatever has arrived.
  - The contacts, terminals 2–6 and the saved design are built by JavaScript only at the end.
  - The project had no "ready" signal at all.
- **Fix, a boot curtain, only when JavaScript runs:**
  - A head script adds `cv-loading` to `<html>`. Quick Look (no JS) is untouched.
  - A curtain (`html::before`, fixed, extended ±50vh) covers the page in the saved design's colour: dark `#05050e`, or light `#e0e5ec` for Neumorphic and B&W, read from the stored state. The page background matches, so Safari's bar areas agree.
  - A spinner (`html::after`) sits in the middle: 96 px CSS on phones (the 1200 px viewport), 40 px elsewhere; static under `prefers-reduced-motion`.
  - The class is removed on `load` plus two frames. A 300 ms timer stands in for animation frames in hidden tabs, and a 20 s safety limit reveals the page regardless.
  - The body stays laid out and measurable underneath, so start-up measurements are unchanged.
  - Nothing reaches the export, which serialises the document after reveal and strips scripts.
- **Two alternatives were measured in the iOS Simulator and rejected:**
  - `opacity:0` on the body: Safari treats a page it cannot see as empty and paints nothing, so the screen was white until the end.
  - `visibility:hidden`: the same white screen.

  The curtain alone let a thin strip of the page show near Safari's toolbar, where fixed elements are clipped. Body opacity **1%** under the curtain removes it: Safari still paints, and the strip is invisible (measured: the band above the toolbar stays at the background colour, brightness 24–29 of 765).
- **Verified:**
  - With a throttled local server (~130 KB/s) in the iOS Simulator, frames at 3, 5 and 7 s show only the curtain and spinner, with no leak. The complete page then appears at once, in the dark design and in Neumorphic (light curtain, light bars).
  - On the Mac the page loads in 176 ms and is revealed (`class="js"`, body opacity 1, curtain gone): 16 contacts, 7 terminals, no console errors.
  - An iOS PDF export afterwards gave 1.1 MB, as before.
  - 28 scripts pass `node --check`; 0 NUL bytes.
  - The two test variants were moved to the Trash.

#### Sandbox ahead of production — V538–V541 (2026-09-29) — the external review — CLOSED by the V542 promotion

**Closed on 2026-09-29:** `index-test.html` = `index.html` = `542.html`.

Production was V537 (`d2b8a938…`). The owner had an external review made of V537, by ChatGPT, on an anonymised public copy. The owner then asked for all of its points, and of our answer to it, to be carried out ("po beji te gjitha").

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V538 | `538.html` | `c68ab10f97f79ae20ee847d16e4c7e30` | 1,307,404 | `index-test.html.bak-pre-v538-20260929-164057` (= V537, `d2b8a938…`) |
| V539 | `539.html` | `aad7bd696bbec2d67890be7edae6be93` | 1,307,628 | `index-test.html.bak-pre-v539-20260929-164153` (= V538, `c68ab10f…`) |
| V540 | `540.html` | `c070fc34e3a23fe9d9bef4e2c9dff3f8` | 1,308,667 | `index-test.html.bak-pre-v540-20260929-164355` (= V539, `aad7bd69…`) |
| V541 | `541.html` | `ce767087360d2e5e5c45ef50e4d537ac` | 1,309,212 | `index-test.html.bak-pre-v541-20260929-164758` (= V540, `c070fc34…`) |

**V538 — the boot curtain loses its only `!important`.**
- **Found in our own answer to the review (the review itself missed it):** V536's `html.cv-loading[data-cv-boot="light"]{background:#e0e5ec!important}` is a patch under Neni 8.2c. It existed to beat `@media (max-width:820px){html,body{background:#05050e!important}}`.
- **Why it is unnecessary:** since V534 phones lay out at 1200 px, so that media query no longer matches on a phone. On the desktop the `::before` curtain covers the whole viewport anyway.
- **Fix:** the `!important` is removed, with the reason in a comment.
- **Verified:** with a throttled load in the iOS Simulator, the Neumorphic origin shows the light curtain from top to bottom (`rgb(224,229,236)` at the status bar, the middle and the toolbar band), exactly as with the `!important`.

**V539 — no static text in the notification element.**
- **Finding (review point 2b):** `#autosaveMessage` carried the static Albanian placeholder "Autosave u krye me sukses". It is never displayed, because `Utils.showNotification` sets the text from `TRANSLATIONS[lang].msg` before showing it, and the element is off-screen otherwise. Still, it sat outside the translation contract.
- **Fix:** the span is empty, with a Neni 23 comment in its place.
- **Verified:** the element starts empty; the leave-preview notification then reads "Bearbeitungsmodus aktiv" (flag de). Between notifications the box sits off-screen (left 1206 px, window width 1189 px). No console errors.

**V540 — the application itself signals "boot ready" to the curtain.**
- **Finding (review point 3B):** V536 lifted the curtain on the browser's `load` event. `load` means the document and its subresources have finished, not that the application has. A future asynchronous initialisation could have been revealed half-built.
- **Fix:**
  - The head script now also exposes `window.__cvBootReady()`. The application calls it as the last statement of its start-up block (the `DOMContentLoaded` initialiser).
  - The curtain lifts only when **both** the app has signalled and `load` has fired, plus two frames.
  - If start-up throws, its `catch` reveals at once, so that the error notification is seen instead of a curtain.
  - If the signal never comes, the page is revealed 3 s after `load`. The absolute 20 s limit stays.
- **Verified, instrumented test copies in the isolated origin (a MutationObserver timed the reveal, and the copies were then moved to the Trash):**
  - A, normal: revealed after `load`, with 16 contacts and 7 terminals.
  - B, no ready signal: revealed only by the fallback, after `load` + 3 s.
  - C, start-up throws: revealed at 77 ms, before `load`, showing "Fehler beim Starten der Anwendung. Bitte lade die Seite neu."
  - The pane was hidden during these runs, so the browser throttled its timers. Absolute times are inflated (A 0.5 s, B 3.9 s); the ordering is what is verified.
  - iOS Simulator, throttled load, Neumorphic: frames at 3 s and 6 s show only the light curtain and spinner, and the complete page follows at once.
  - 28 scripts pass `node --check`.

**V541 — the 20 s safety starts once the document is downloaded.**
- **Finding (review point 3A, measured):** a second throttled server (~40 KB/s, `127.0.0.1` only) made the page take ~35 s to arrive. With V540 in the iOS Simulator:
  - 15 s: the curtain;
  - **22 s: a half-built page** (Terminal 1's frame and photo, the next header), because the 20 s safety had fired while the HTML was still downloading;
  - 38 s: the complete page.

  That is exactly the state the curtain exists to hide.
- **Fix:** the 20 s timer now starts at `DOMContentLoaded`, when the whole document has arrived and start-up runs. A slow download therefore stays under the curtain, and the 20 s only guard against a start-up that hangs. A new absolute 60 s limit guards against a download that stalls completely.
- **Verified, same very slow load:** 15, 22 and 30 s show only the curtain and spinner; at 42 s the complete page appears at once. 28 scripts pass `node --check`.

#### Sandbox ahead of production — V543–V545 (2026-09-30) — CLOSED by the V546 promotion

**Closed on 2026-09-30:** `index-test.html` = `index.html` = `546.html`.

Production was V542 (`929e8b2c…`).

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V543 | `543.html` | `aca3eb6bd7a9dc968f0073437861c88d` | 1,310,039 | `index-test.html.bak-pre-v543-20260930-005650` (= V542, `929e8b2c…`) |
| V544 | `544.html` | `e4605753ade67bc19e9d442a8cff76e6` | 1,311,029 | `index-test.html.bak-pre-v544-20260930-010634` (= V543, `aca3eb6b…`) |
| V545 | `545.html` | `841494e635f42fa0fd119f6c414e21c8` | 1,311,291 | `index-test.html.bak-pre-v545-20260930-113321` (= V544, `e4605753…`) |

**V543 — transient UI never enters an export.**
- **Found by the new golden tests** (`tools/golden.mjs`), not by a report. The exported image contained the iframe notification "CV Creator erfolgreich gestartet!".
- **Cause:** the export clone is built from the live HTML of the page and the iframe. A notification that is visible at that moment (`#notification` in the iframe, `#autosaveNotification` in the page), or the overlay of an earlier "Save as Image" (`#cvImgSaveOverlay`), was baked into the image or PDF. A user exporting within about 2 s of any notification (undo, save, start-up) would send it to an employer inside the document.
- **Fix at the root:** `prepareForCapture(d)`, the single place for clone mutations before capture, removes those three elements from the clone. The live page is untouched.
- **Verified:**
  - Green-toast pixels in the top-right region of the six golden exports:
    - V542: 2463 / 1282 / 0 / 0 / 1283 / 1283 (timing-dependent, 4 of 6 affected);
    - **V543: 0 in all six.**
  - The golden comparison of V542 against the V543 baseline FAILs exactly those 4 cases.
  - iOS Simulator Share Package: 1.1 MB PDF, share sheet opened.
  - `verify.py`: YES.

**V544 — build and date in the PDF properties.**
- **Proposal from the external review, approved by the owner.** It records which version produced a given PDF, as a lighter alternative to a `manifest.json` in the package, which the employer would have received.
- **Fix:** `PdfPipeline.stampProperties(pdf, config)` is one helper, called by both PDF builders (`canvasToPdf` for CV and letter, `renderDocToA4Pdf` for the certificate). It writes the document's own title as Title and Subject, `Ultra Instinct CV <build>` as Creator, and `build <build>; generated <ISO time>` as Keywords. **The person's name is not added.** Nothing appears on the page.
- **Verified:**
  - Headless Chrome, with the PDF blobs captured before download:
    - CV: Title "Lebenslauf", Creator "Ultra Instinct CV V544", Keywords "build V544; generated 2026-09-29T23:07:07Z";
    - certificate: 2 pages, Title "VËRTETIM PUNE" (written as byte `0xCB`, which is "Ë" in PDFDocEncoding).
  - Golden comparison: 0.000 % in all six cases.
  - `verify.py`: YES.
  - iOS Simulator Share Package: 1.1 MB PDF.

**V545 — the hidden notification box is fully off-screen at any width (a regression from V539).**
- **Reported by the owner on the iPhone (sandbox V544):** "a mark at the top right that looks like one of the notifications".
- **Cause — introduced by V539:**
  - `.autosave-notification` hid itself with `transform:translateX(120%)`, a shift relative to its *own* width, from `right:20px`. The box is fully hidden only when 0.2 × width > 20 px, that is when it is wider than 100 px.
  - With the old placeholder text it was 259 px wide and hidden.
  - V539 emptied the text, the empty box is 66 px wide, the shift is 79 px, and **7 px stayed visible** at the right edge until the first notification.
- **Where it is:** in production since **V542**.
- **Why nothing caught it:** `verify.py` is static, and the golden tests capture the export, where the box is `display:none`.
- **Fix at the root:** the hidden state shifts by `calc(100% + 40px)`, its own width plus the 20 px offset plus the shadow, so it is hidden at any width. The shown state (`translateX(0)`) is unchanged.
- **Observatory extended:** a hidden notification must lie fully outside the viewport.
  - On V544 it reports "hidden notification shows 7 px at the right edge".
  - On V545: none.
- **Verified:**
  - Geometry with transitions disabled in the test tab. Shown, the box sits inside with its right edge at viewport − 20. Hidden, its left edge is at viewport + 20, both for a 377 px box and for the empty 66 px one.
  - iOS Simulator crop of the top-right corner: V544 shows the dark sliver with its cyan border; V545 is clean.
  - Golden comparison: none.
  - `verify.py`: YES.

#### Sandbox ahead of production — V547 (2026-09-30) — CLOSED by the V548 promotion

**Closed on 2026-09-30:** `index-test.html` = `index.html` = `548.html`.

Production was V546 (`e3a635da…`).

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V547 | `547.html` | `5b1ffa7ee95b183aaf7a6437add049b4` | 1,319,798 | `index-test.html.bak-pre-v547-20260930-134747` (= V546, `e3a635da…`) |

**V547: an invisible text layer in the CV and letter PDFs.** This is P0 of the third external review, built against the contract recorded under *PDF evidence* below.
- **Scope:** only the export pipeline. The diff is three hunks inside `PdfPipeline` plus the build label. The DOM, CSS, layout, content, i18n, storage, history and editor are untouched, and so is the certificate path (`renderDocToA4Pdf`).
- **Mechanism:**
  - `collectTextRuns` only reads the export document, the same document that is photographed, after the final layout and before capture. It walks text nodes in DOM order, which is the logical order.
  - It keeps a character only if the character is drawn:
    - no ancestor has `display:none`, `visibility:hidden` or `opacity:0`;
    - the rect is non-empty and inside the captured area;
    - its centre lies inside every ancestor clip (overflow or `clip`).
  - It starts a new run on a new visual line, a new block or a large gap, and keeps the source space at a line end.
  - `writeTextLayer` writes the runs in render mode 3 (invisible), in logical order, fitted to the visible width with `horizontalScale`.
  - The font is standard Helvetica (WinAnsi). With this exact jsPDF 2.5.1 (SRI-verified), "-", "–", ë, Ë, ü, ß, ä, ö, ’, “ ”, … and • extract correctly.
  - Characters that the font cannot carry (emoji, ⚡, ─) are not written into the layer. They stay in the image. **The CV text is never altered.**
- **Three findings during implementation, each fixed at its cause:**
  1. **The letter's order.**
     - The first run gave ORDER 5/14 on the letter. The text layer was right; the test's expectation was wrong.
     - The letter layout rule V407, documented in the app, moves the date to the bottom right, next to the signature. The expectation had followed the storage order instead.
     - `pdf_export.mjs` now derives the expected reading order from that rule. The app was not changed.
  2. **A hidden label leaked into the layer.**
     - Word boxes drawn over the page showed four words above the photo frame with nothing visible beneath: the `.sr-only` label "Statusi i ngarkimit të fotos", a 1×1 px box that is clipped.
     - This is the case the reviewer warned about: text in the DOM that is not part of the visible document.
     - The fix is the ancestor-clip test above. To make such leaks visible from now on, `pdf_check.py` reports "extra" words, meaning words in the PDF that no expected text contains. After the fix: CV 0; letter only the visible labels "Firma" and the section title.
  3. **WebKit returns two rects for the first character of a wrapped line.** A zero-width rect at the end of the previous line comes first, before the real glyph.
     - Taking the first rect made "Industrie" extract as "I" + "ndustrie". It was measured on the PDF that the iOS Simulator saved to Files: content 71/75.
     - Chrome returns one rect, so the emulated phone path could not show this.
     - The fix is to take the rect that has a width. The iOS PDF then gave 75/75.
- **The test tools were tightened in the same work:**
  - Expected CV content now includes every multilingual text of each job and education entry: 75 texts instead of 48.
  - A hyphen joins the next line only when it ends the line directly: "3-Phasen-" + "Systeme", but "Wohn- " + "und" stays two words.
  - Invisible format characters are dropped.

**Verification (final code `5b1ffa7e`):**

| Check | Result |
|---|---|
| `pdf_check` desktop | CV and letter × de/en/sq: **TEXT, ORDER, UNICODE PASS (6/6)**; certificate unchanged (0 text, as contracted); **VISUAL 9/9 pixel-identical to V546** |
| `pdf_check --mobile` (phone render path) | the same: 6/6 PASS; certificate unchanged; **VISUAL 9/9 pixel-identical** |
| CV details | de 2800 characters, critical 3/3, content 75/75, extra 0; order stream 6/6 and layout 6/6; UNICODE 20/20 (de), 9/9 (en), 31/31 (sq) |
| Other designs (Modern, B&W, Neumorphic; de) | critical 3/3, content 48/48 (the earlier expectation), order 6/6 in each |
| Golden image export ("Save as Image") | 0.000 % in all six cases |
| `verify.py` | YES (the only WARN is the known dead key `ui.langChanged`) |
| Word boxes over the rendered page | every box sits on its visible word, en dashes included |
| **iOS Simulator (real WebKit):** Share Package → Save to Files, PDF read from the simulator's disk | 2800 characters, critical 3/3, content **75/75**, order 6/6 and 6/6, UNICODE 26/26, extra 0; Creator "Ultra Instinct CV V547"; 837 KB (V546: 822 KB) |
| **Apple PDFKit** (the engine of Files and Preview), on that iOS PDF | search: "Elektro" 7 hits; the e-mail, "Führerschein", "Deutsch – B1", "3-Phasen-Systeme" and "Geschäftsgebäuden" found. **Word selection at the centre of the e-mail (long-press) = `max.mustermann@example.com`**; a drag from its first to its last letter copies exactly the same, with no stray spaces, doubled characters or reordering. Phone, city and date drag-copy exactly. A *whole-line* selection also takes the phone number, because the two sit on one visual line in two columns. The same PDF from V546: 0 characters, 0 hits. |
| iOS image, V546 against V547 | 9 of 8,206,200 pixels differ, in a 19 × 1 px strip. Two V547 captures differ from each other by 20 pixels. **Real Safari is not bit-deterministic**, so on iOS the image is the same within the platform's own noise. Pixel identity is proven on the deterministic Chrome paths. |

**Device gate (Neni 72): passed on the owner's iPhone.** See *Release record — V548*.

#### Sandbox ahead of production — V549 (2026-09-30) — CLOSED by the V550 promotion

**Closed on 2026-09-30:** `index-test.html` = `index.html` = `550.html`.

Production was V548 (`ba88f1ef…`).

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V549 | `549.html` | `6e4221c7fab370868d3824cc1893ea57` | 1,324,306 | `index-test.html.bak-pre-v549-20260930-150739` (= V548, `ba88f1ef…`) |

**V549: the same invisible text layer in the two-page A4 certificate.** It follows the same procedure as P0.
- **Test first, on V548:** the certificate cases gave TEXT, ORDER and UNICODE FAIL (0 characters) and VISUAL PASS, on the desktop and the phone path.
- **Scope:** only `PdfPipeline`. The diff hunks all lie inside it, plus the build label. The CV, the letter, Save as Image, CSS, the editor, storage, history, the A4 format and the content are untouched.
- **Mechanism:**
  1. **`collectTextRuns` gains an optional `root`.**
     - The certificate's clone is photographed inside the main document, in an off-screen capture container with `opacity:0`.
     - With `root` set, coordinates are measured from the clone. The visibility, block and clip walks also stop at the clone, because the capture container is not part of the document.
     - Without `root` (CV and letter), the behaviour is as in V548.
  2. **`writeTextLayer` understands pages.**
     - With `pageH`/`pageGap` (1123 / 40 px, the certificate's own layout), each run goes to its page via `setPage`.
     - A run in the gap between pages would not be printed, so it is not written.
  3. **`renderDocToA4Pdf`** collects the runs from the paginated clone before capture and writes them after the pages are added.
- **Found by the test: the Greek letter Φ.** The certificate says "Φ25mm" and "Φ240 mm" (Φ as the diameter sign).
  - WinAnsi Helvetica cannot carry Φ. The first build dropped it, which gave content 40/41 and UNICODE FAIL.
  - Under the absolute rule (change the encoding mechanism, never the text), Greek letters are now written as separate segments in the other standard PDF font, **Symbol**, where Φ is code "F".
  - Segment widths come from the official Symbol AFM metrics. jsPDF has none for Symbol (it measured Φ as 6.96 pt instead of 9.16 pt), and without them PDFKit read "Φ 25mm" with a gap.
  - Proven first with this jsPDF: PyMuPDF and PDFKit both read "nga Φ25mm, e deri në Φ240 mm.", and PDFKit's find locates "Φ240".
  - Runs without Greek letters keep a single segment and are written exactly as before.
- **Code hygiene:** the `ZERO` regex written in V547 held the invisible characters literally, because the editing tool had turned `\u00AD`… into raw characters. They are now written as escapes, with identical behaviour. (A pre-existing literal zero-width space in the empty-list-item check of `renderDocToA4Pdf` is left as it was: it is outside this change.)
- **Test tools:**
  - The certificate expectation now includes the list items (`.a4-doc-ul li`), 41 texts instead of 20.
  - Before this, the extra-words report had shown 125 visible bullet words that nothing expected. They were visible content, not a leak.

**Verification (final code `6e4221c7`):**

| Check | Result |
|---|---|
| `pdf_check` desktop | **ALL PASS: 9/9 on TEXT, ORDER, UNICODE and VISUAL.** Certificate: 3796 characters, critical 2/2, content 41/41, extra 0, order 6/6 and 6/6; VISUAL 2 pages pixel-identical |
| `pdf_check --mobile` | **ALL PASS: 9/9 on each check** |
| CV and letter unchanged | the text layer is **identical to V548**, words and positions, in all 6 cases on the desktop and all 6 on the phone path |
| Golden image export | 0.000 % |
| `verify.py` | YES |
| Word boxes over both certificate pages | every box on its word, including justified paragraphs, "Φ25mm" and "Φ240 mm" on page 2, and the signature lines |
| **iOS Simulator (WebKit):** certificate via Share Package → Save to Files | 2 A4 pages; 3796 characters; critical 2/2; content 41/41; order 6/6 and 6/6; UNICODE 32/32, Φ present; extra 0 |
| **Apple PDFKit** on that PDF | "VËRTETIM PUNE", "MAX MUSTERMANN" and "Elektroteknik" found on page 1; "Φ25mm", "Φ240 mm", "DEKLARATË" and "Firma dhe Vula" on page 2. Word selection and drag-copy give exactly "MAX" and "Φ240" |

**Device gate (Neni 72): passed on the owner's iPhone.** See *Release record — V550*.

#### Sandbox ahead of production — V551–V564 (2026-10-02) — CLOSED by the V565 promotion

**Closed on 2026-10-02:** `index-test.html` = `index.html` = `565.html`.

Production is V550 (`792082b8…`).

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V551 | `551.html` | `713365e099926fe4b735c3e5a2f27080` | 1,326,713 | `index-test.html.bak-pre-v551-20261002-002307` (= V550, `792082b8…`) |
| V552 | `552.html` | `b5540524bbfb5f608ec76bea8c567e5b` | 1,327,170 | `index-test.html.bak-pre-v552-20261002-004054` (= V551, `713365e0…`) |
| V553 | `553.html` | `8ef04d04f40e08bb0f81b12a41559306` | 1,328,963 | `index-test.html.bak-pre-v553-20261002-004916` (= V552, `b5540524…`) |
| V554 | `554.html` | `638375501a6a293b697f9088d2de7455` | 1,330,174 | `index-test.html.bak-pre-v554-20261002-010113` (= V553, `8ef04d04…`) |
| V555 | `555.html` | `75cf6f94e8f18dc1c42298cedbad17eb` | 1,333,048 | `index-test.html.bak-pre-v555-20261002-011409` (= V554, `63837550…`) |
| V556 | `556.html` | `337d3cdcdce2146735b18069302d14b4` | 1,333,520 | `index-test.html.bak-pre-v556-20261002-012337` (= V555, `75cf6f94…`) |
| V557 | `557.html` | `a31a135273e05cfd9e0581fbfa054cde` | 1,333,162 | `index-test.html.bak-pre-v557-20261002-013154` (= V556, `337d3cdc…`) |
| V558 | `558.html` | `69e9368426e89878f8c33ff502b39b6d` | 1,338,963 | `index-test.html.bak-pre-v558-20261002-020233` (= V557, `a31a1352…`) |
| V559 | `559.html` | `bb32affdc40318fbca690fcdac2102b2` | 1,339,462 | `index-test.html.bak-pre-v559-20261002-021617` (= V558, `69e93684…`) |
| V560 | `560.html` | `073afe16d56e4472e95d2adf4f1b639c` | 1,340,466 | `index-test.html.bak-pre-v560-20261002-022931` (= V559, `bb32affd…`) |
| V561 | `561.html` | `1d64ba881fff010a2c14d9e0650e502d` | 1,341,624 | `index-test.html.bak-pre-v561-20261002-115759` (= V560, `073afe16…`) |
| V562 | `562.html` | `341ae1373899fc3be1ea13b6f59ef976` | 1,345,766 | `index-test.html.bak-pre-v562-20261002-122544` (= V561, `1d64ba88…`) |
| V563 | `563.html` | `d4507bb465c39aa55562d3fe32064939` | 1,345,548 | `index-test.html.bak-pre-v563-20261002-124300` (= V562, `341ae137…`) |
| V564 | `564.html` | `85acedf32aa001399e27a31864893312` | 1,346,147 | `index-test.html.bak-pre-v564-20261002-131744` (= V563, `d4507bb4…`) |

**The photo series (external review #4, 2026-10-02).** ChatGPT audited the public mirror, and the audit was then checked against the code. The agreed order is:
- A (storage-failure message), B (message for unsupported files), C (photos from a link: downscale, no remote-URL fallback);
- then D (crop presets) and E (larger touch handles);
- then F (remove the "Reflection — coming soon" button);
- G (photos in IndexedDB) as a release of its own.

The owner set the rules for this phase:
- no visual change apart from the new messages;
- no change in behaviour outside A–F;
- no IndexedDB yet, and no migration or reformatting of stored data;
- every step tested before the next.

**V551 = step A: a failed local save of a photo is announced, no longer swallowed.**

**Defect, proven first on V550** (headless Chrome, fresh browser context per scenario; file in `scratchpad/v551/storagetest.mjs`, not in the repo):
- Four call sites wrote photos to `localStorage` and caught the error with an empty `catch{}`:
  - the personal terminal T1;
  - the other terminals inside the iframe;
  - the A4 certificate;
  - the profile photo.
- The photo stayed on screen and was gone after a reload, with no message.
- For the profile photo it was worse: the app said "Foto erfolgreich hochgeladen!" although nothing had been stored.

| Scenario | V550 | V551 |
|---|---|---|
| Profile photo 3.7 MB after one floating photo (does not fit) | "uploaded successfully"; gone after reload | **error message, no success message**; gone after reload (expected) |
| Floating photo, T1, storage almost full | no message; gone after reload | **error message** |
| Floating photo, iframe terminal (`skills`), storage almost full | no message; not stored | **error message** |
| Photo on the A4 certificate, storage almost full | no message; not stored | **error message** |
| Controls: profile 3.7 MB and 170 KB into empty storage; T1, `skills` and A4 photo into empty storage | stored, restored, success / no message | **identical** |

**Mechanism:**
- One authority, `CVPhotoEngine.saveFailed(err)`, in the engine. All four call sites now call it from their `catch`.
- It tells the quota case (`QuotaExceededError`, codes 22/1014, Firefox's `NS_ERROR_DOM_QUOTA_REACHED`) apart from any other failure:
  - `photoStorageFull`: "Photo NOT saved — the browser storage is full. It will be gone after a reload. Remove photos or use smaller ones.";
  - `photoNotSaved`: "Photo NOT saved — it will be gone after a reload."
- Both keys exist in de/en/sq, and the text follows the language flag (V530).
- It shows at most one message every 4 s, so repeated moves do not stack messages.
- The profile handler keeps the error in `_cvPhotoBytesWrite.lastError`. When the write fails it shows the error and skips the success message.

**Unchanged:** the photo stays on screen, nothing is deleted, the storage format and the keys are the same, and no other path is touched. Measured 2026-10-02 in Chrome: a 3.7 MB profile photo still fits into empty storage, so the limit is reached by the sum of photos, not by one typical photo.

**Verification (code `713365e0`):**

| Check | Result |
|---|---|
| `verify.py` | RELEASE CANDIDATE: YES. 59/59 msg keys in all three languages, every key referenced, no hard-coded notification. The only WARNs are the missing 551 snapshot (created afterwards) and the old `langChanged` |
| Golden image export | 6/6 at 0.000 % |
| `pdf_check` desktop and `--mobile` | ALL PASS 9/9 on TEXT, ORDER, UNICODE and VISUAL (pixel-identical) |
| Storage scenarios | see the table above: 4/4 failure paths now announced, 6/6 controls identical |

**V553 = step B: an image the browser cannot open is announced, and is never shown broken or stored.**

**Defect, proven first on V552.** In Chrome (headless):
- **Floating photo:**
  - a HEIC file or a non-image was ignored without a word;
  - a TIFF or a damaged ".jpg" appeared as a **broken** photo.
- **Profile photo:** a TIFF, HEIC or damaged file gave "Foto erfolgreich hochgeladen!", a broken picture, **and was stored** (a TIFF took 1 MB).
- **"Replace photo":** swapped a good photo for a broken one, with no message.

**Mechanism:**
- **One authority**, `CVPhotoEngine.unsupported()`. It shows at most one message every 2 s, so a batch of files gives one message. The new key `photoUnsupported` exists in de/en/sq: "This image cannot be opened here — the format is not supported (e.g. HEIC) or the file is damaged. Please use JPG, PNG or WebP."
- **`downscale(dataUrl, cb, onFail)`:** when the browser cannot decode the image, it calls `onFail` instead of continuing with the undecodable data. Its two callers both pass `unsupported`:
  - `addFiles`, which also reports a file that `isImg` rejects;
  - "Replace", which keeps the old photo.
- **Profile photo:** an `Image` probe decodes the file before it is shown or stored. If the probe fails, the photo and the storage stay as they were, and the status text and the message say why. The "not an image" (`pickImage`) and "over 5 MB" checks are unchanged.
- **Acceptance rules are unchanged:**
  - `isImg` still accepts JPEG/PNG/TIFF/WebP for floating photos;
  - the profile still accepts any `image/*`.
  - Only what the browser cannot open is now refused, so where a browser decodes a format (Safari: HEIC, TIFF), the path is the same as before.

| Case | Chrome V552 | Chrome V553 | WebKit V552 | WebKit V553 |
|---|---|---|---|---|
| Profile JPG / PNG / WebP | success, stored | **same** | success, stored (JPG) | **same** |
| Profile HEIC | success, broken, stored | **message, not stored** | success, shown, stored | **same (unchanged)** |
| Profile TIFF | success, broken, stored 1 MB | **message, not stored** | success, shown, stored | **same (unchanged)** |
| Profile damaged ".jpg" | success, broken, stored | **message** | success, broken, stored | **message** |
| Floating JPG / PNG / WebP | added, stored | **same** | added (JPG) | **same** |
| Floating HEIC | silent | **message** | silent | **message** |
| Floating TIFF | broken photo | **message, nothing added** | added, shown | **same (unchanged)** |
| Floating damaged ".jpg" | broken photo | **message, nothing added** | broken photo | **message, nothing added** |
| Floating non-image (`.txt`) | silent | **message** | — | — |
| Replace with JPG | replaced | **same** | — | — |
| Replace with TIFF / HEIC / damaged | replaced by a broken photo | **message, old photo kept** | — | — |

The WebKit runs used the macOS `WKWebView`, a non-persistent store per case, with the file handed over through `DataTransfer` (harness `wk.swift`). The Chrome runs used `formattest.mjs`.

**Regression checks on V553:**
- All step A scenarios (`storagetest.mjs`) and step A.1 scenarios (`storagetest4.mjs`) give the same results as on V551/V552.
- `verify.py`: YES (msg keys 60/60).
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS 9/9.

**Not in B, recorded as B.1 for later (owner and external review, 2026-10-02):**
- Allow browser-decodable HEIC/HEIF in *floating* photos. Today `isImg` refuses it, as it did before V553, while the profile photo accepts HEIC in Safari.
- It is safe now, because the decode check stops Chrome from adding a broken photo, but it is a feature of its own and is not mixed into C.
- `photoUnsupported` means "this input cannot be used here", not "this format is unsupported everywhere": TIFF, for example, opens in WebKit.

**V554 = step C: a photo from a link becomes a downscaled local asset. When the fetch fails, nothing is added and no remote URL is stored.**

The external review asked for C1 (normalise) and C2 (no remote fallback) as one patch. Otherwise a failed fetch could still leave the remote dependency that C removes.

**Defect, proven first on V553.**
- **Test setup:** headless Chrome, with a synthetic drop of a link onto Terminal 1 (harness `urltest.mjs`).
- **The proxy was simulated:** CDP `Fetch` intercepted every request to images.weserv.nl and answered it locally, so no request left the machine.

| Case | V553 | V554 |
|---|---|---|
| Link to a 2400×1800 photo, proxy delivers it | stored at **2400×1800, 4,964,131 chars** (almost the whole storage) | **1100×825, 541,171 chars**; identical after reload |
| Link, proxy fails (network) | the **remote URL** is stored as the photo; after reload it still depends on that server | **"The photo from the link could not be loaded…"**; nothing added; nothing after reload |
| Link, proxy answers with a non-image | remote URL stored | same message; nothing added |
| `data:` URL of a 600×450 photo | added, 226,519 chars | **identical** (below the cap) |
| `data:` URL of a 1400×1050 photo | added at full size, 1,358,391 chars | **1100×825, 695,643 chars** |

**Mechanism:**
- `addUrlPhoto` now sends every result, `data:` URLs and fetched blobs alike, through the same `downscale(…, add, unsupported)` as files.
- The old `.catch(create(…, u))` is gone. A failed fetch, a non-image answer or a read error calls `linkFailed()`.
- `linkFailed()` shows `photoLinkFailed` in de/en/sq, at most once every 2 s.
- A fetched image that the browser cannot decode gets `photoUnsupported`.

**Unchanged:**
- the proxy and its URL format;
- `serialize()`, the storage keys and the format;
- photos already stored, including any remote URL saved before V554: no migration.

**Privacy (external review P1), still open:** a link is still sent to images.weserv.nl. C removes only the remote fallback; the choice of proxy is a separate decision.

**Regression on V554:**
- The step A scenarios give 9/9 results identical to V551, and the step B format scenarios 18/18 identical to V553. Step A.1 (`storagetest4.mjs`) is unchanged.
- `verify.py`: YES (msg keys 61/61).
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS 9/9.

**The owner's decision, 2026-10-02:** carry on with D, E and F now and run the iPhone test once, at the end, for all steps. The device gate (Neni 72) stays open until then.

**V555 = step D: crop presets.**
- **New buttons** in the Crop group: *Lirë* (free, as before), *1:1*, *3:4* (classic CV portrait), *4:5* and *Rreth* (round). They sit between Cancel and Reset/Apply, behind a separator, in the toolbar's own button style; the ratio buttons show the ratio as text. They have tooltips in the toolbar's existing tip language, and the active preset is highlighted with the existing `.obj-tb.active` style.
- **Choosing a ratio** sets the largest crop window of that ratio inside the photo, centred on the current window, and locks the aspect.
- **Corner drags** keep the ratio: the opposite corner is fixed, and the window is limited by the photo and by the 24 px minimum.
- **Rreth** is 1:1 with a round preview (`border-radius:50%` on the crop window). On Apply it also sets the existing round-corner style (`radius:'half'`) in the same undo step.
- **Entering Crop** starts at *Lirë*, and **Reset** returns to *Lirë*.
- **Untouched:** the non-destructive crop model (`st.crop`), `serialize()` and the storage format. `rd:'half'` already existed (Style → round corners).

| Test (headless Chrome, `dtest.mjs`) | Result |
|---|---|
| Enter Crop | window = full photo 240×180, *Lirë* active |
| 3:4 | window 135×180 (0.75), centred |
| Drag the bottom-right corner, then the top-left corner | ratio stays 0.75 (131.25×175, then 101.25×135) |
| Apply | photo 101.25×135 with `crop {x .344, y .222, w .422, h .75}`, stored |
| Rreth, then Apply | 101.25×101.25, `radius:'half'`, shown with a computed `border-radius` of 50 %, stored `rd:'half'` |
| One undo | back to 101.25×135, radius 0, stored the same |
| 1:1, then Lirë, then drag | aspect free again (0.56) |
| Reset crop | the full photo again, *Lirë* |

**Regression on V555:**
- The step A, B and C scenarios are identical to V551, V553 and V554 (9/9, 18/18, 5/5).
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS.
- `verify.py`: YES.

**V556 = step E: larger touch areas for the handles, on touch screens only.**
- **Mechanism:** one CSS rule in the engine's injected stylesheet (`ensureCss`), so it reaches both the main document and the iframe:
  ```css
  @media (pointer:coarse) {
    .mph-crop-grip::before { content: ""; position: absolute; inset: -15px }
    .mot-photo .mph-grip::before { inset: -16px }
  }
  ```
- **Effect on touch screens:**
  - The crop handles had **no** extended area (14 px). They now have 44 px; the part outside the photo is clipped by the crop overlay's `overflow:hidden`, so about 29 px remain inside the photo.
  - The photo's resize handles go from 30 px to 44 px.
  - The visible handles are unchanged, because the `::before` boxes carry no paint.
- **On desktop (`pointer:fine`) nothing changes.** The toolbar buttons (30 px, side by side) are not changed, because enlarging their touch areas would make them overlap.

| Test (`etest.mjs`, touch through CDP touch emulation) | V555 | V556 |
|---|---|---|
| Desktop: crop handle, point 22 px inside the corner | the crop window (not the handle) | **same** |
| Desktop: photo handle, point 19 px from its centre | not the handle | **same** |
| Touch: crop handle, point 22 px inside the corner | the crop window; a drag from there does not resize | **the handle**; a drag from there resizes (240×180 → 210×160) |
| Touch: photo handle, point 19 px from its centre | not the handle | **the handle** |

**Regression on V556:**
- The step A, B and C scenarios are identical (9/9, 18/18, 5/5), and the step D scenario is identical to V555 (17/17).
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS.
- `verify.py`: YES.

**V557 = step F: the "Reflection — coming soon" button is removed.**
- **What it was:** a control that looked like a feature but only announced "coming soon". The external review and the owner agreed to remove it.
- **Removed:** the `sReflect` button and its click handler, the `SVG_REFLECT` icon, its tooltip entry, and the `reflectionSoon` message key in de/en/sq. Nothing else referenced them.
- **Result:** the Style group is now *Kthehu, Border, Qoshe të rrumbullakta, Hije*. Border, corners and shadow cycle exactly as on V556 (2 px, 12 px, soft): same messages, same stored `bd/rd/sh`.

**Final regression on V557, the whole series:**
- **Step A:** 9/9 identical to V551, plus 5/5 for the follow-up tests.
- **Step A.1:** same-file recovery stores and survives a reload; the "> 5 MB" message shows both times; floating photos give 2 photos.
- **Step B:** 18/18 identical to V553, and the WebKit runs are identical to V553.
- **Step C:** 5/5 identical to V554.
- **Step D:** 17/17 identical to V555.
- **Step E:** desktop unchanged, touch handles hit.
- **Gates:** golden image export 6/6 at 0.000 %; `pdf_check` desktop and `--mobile` ALL PASS; `verify.py` YES (60/60 msg keys).

**Pre-test checks asked for by the external review, and the owner's PDF report (2026-10-02).** None of these is caused by A–F; each was measured on V550 (production) as well.

| Check | Result |
|---|---|
| Round photo (Rreth) in the CV PDF, desktop and phone path | **round**: the photo region fills 0.785 of its box (a circle is 0.785, a square 1.0) |
| Floating photo proportions in the PDF | **pre-existing defect:** a 240×180 photo (1.333) comes out 1.425 in the PDF, about 7 % wider, on V550 and V557 alike. A round photo therefore becomes a slightly wide oval (1.069) |
| Reset Default after profile, T1 and A4 photos | the T1 and A4 photos and their keys are cleared. **Pre-existing gap:** the profile photo's bytes (`cv_profile_photo`, 226,519 chars) stay in storage on V550 and V557 alike. The photo is gone from the CV after a reload, but its bytes still use space |
| **Owner's report: the PDF colours differ from the screen** | **pre-existing defect, proven on V550:** the photo *Adjust* settings (brightness, contrast, saturation, blur) are CSS `filter`s, which the export renderer ignores. A teal test photo with saturation 200 and brightness 60 shows as (0, 96, 108) on screen but (32, 136, 144) in the PDF, which is the unadjusted original |
| Other differences in the owner's screenshot | Terminal 1 text is Fira Mono on screen but sans-serif in the export (export stylesheet `font-family:"Segoe UI",system-ui,sans-serif`). The pills' neon rims are not drawn by html2canvas (see V522, withdrawn). Both are long-standing, and both are already in the V546 golden and PDF baselines |

**The owner's decision (with the external review), 2026-10-02:**
- H1, H2 and H3 are fixed in this series, in that order, before the single iPhone test.
- H4 (Fira Mono in the PDF) stays out of this cycle, and so do the neon rims.
- Order: H1 → H2 → H3 → regression A–F → iPhone → promotion.

**V558 = H1: photo *Adjust* settings are baked into the photo pixels for every export.**
- **Single pipeline**, `CVPhotoEngine.bakeExportFilters(root)`. It runs on the export clone just before capture, so the live page is never touched.
- **Every export path calls it:**
  - `renderToCanvas`, for the CV, the letter and "Save as Image" (desktop, phone and neumorphic engines alike);
  - `renderDocToCanvas` and `renderDocToA4Pdf`, for the certificate.
- **Per photo whose filter is not neutral:**
  - It decodes the photo's own source, at most 2000 px.
  - It applies the CSS Filter Effects formulas in the order of `applyFilter()`: brightness, then contrast, then saturate (the standard luminance matrix), clamping to [0,1] after each step; then a Gaussian blur (three box passes, premultiplied alpha, transparent outside), with σ equal to the CSS radius in the photo's own pixels. The on-screen width comes from a temporary `data-cv-sw` attribute that `pctize` sets and `unpctize` removes.
  - It swaps the clone's `src` for the baked bitmap and sets `filter:none`.
- **Photos with neutral filters and photos that cannot be read are left as they are.** `bakeExportFilters` never throws.

| Adjust (teal photo 40,140,150; headless Chrome, CV PDF) | Screen | PDF V557 | PDF V558 |
|---|---|---|---|
| none | (39,140,150) | identical | identical |
| saturation 200 + brightness 60 | (0,96,108) | ≥ 26 off (the unadjusted photo) | **(0,96,108)** |
| contrast 150 | (0,146,161) | ≥ 38 off | **(0,146,161)** |
| saturation 0 | (119,119,119) | — | **(119,119,119)** |
| brightness 140 + contrast 80 | (69,182,193) | ≥ 24 off | **(70,182,194)** |
| blur 6 px (edge fade, share of the width) | 3.75 % | 0.13 % (no blur) | **4.03 %** |
| A4 certificate photo, saturation 200 + brightness 60 | (0,96,108) | 34 off | **(0,96,108)** |

**Regression on V558:**
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS (states without photos are untouched).
- The round-photo PDF test is unchanged.
- `verify.py`: YES.

**V559 = H2: exported photos keep their on-screen proportions.**
- **Cause, at the source:** `pctize` (the CV, letter and image export) expressed the photo's width as a % of the layer *width* and its height as a % of the layer *height*. The export renders the terminals at 1200 px with reflowed text, so the layer's aspect changes and every photo came out about 7 % wider; a round photo became an oval.
- **Fix:** the width stays a % of the layer width, and the height is `auto` with `aspect-ratio: w / h` from the on-screen box, so it follows the width. No compensating scale anywhere. The position (left/top %) and the inner crop geometry (% of the photo box) are unchanged, and so is the A4 path, which clones at its own width and was already exact.

| Photo (magenta; CV PDF; aspect = width/height of the photo box, or of its bounding box when rotated) | Screen | PDF V558 | PDF V559 |
|---|---|---|---|
| normal 240×180 | 1.333 | 1.421 (+6.6 %) | **1.335 (+0.1 %)** |
| resized 300×120 | 2.500 | 2.682 (+7.3 %) | **2.508 (+0.3 %)** |
| rotated 30° (bounding box) | 1.080 | 1.100 (+1.9 %) | **1.080 (0.0 %)** |
| crop 3:4 | 0.750 | 0.801 (+6.8 %) | **0.749 (−0.1 %)** |
| round (Rreth) | 1.000 | 1.069 (+6.9 %) | **1.004 (+0.4 %)**, fill 0.786 (a circle) |
| tall photo 450×600 | 0.750 | 0.800 (+6.6 %) | **0.748 (−0.3 %)** |
| phone path: normal / round | — | 1.425 / 1.069 | **1.338 / 1.004**, round fill 0.787 |
| A4 certificate photo | 1.333 | — | **1.333** |

**Regression on V559:**
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS.
- `verify.py`: YES.

**V560 = H3: Reset Default also removes the profile photo's stored bytes, and shows the default picture at once.**
- `_CV_PROFILE_DEFAULT_SRC` keeps the profile image's `src` as it comes in the HTML. It is read when the script runs, before any restore from storage.
- The Reset handler, right after clearing the terminal and A4 photos, calls `_cvPhotoBytesWrite(null)` (removes `cv_profile_photo`) and sets the image back to that default.
- Until V559 the bytes stayed in storage, and the uploaded picture stayed on screen until a reload.

| Reset test (`h3test.mjs`) | V559 | V560 |
|---|---|---|
| Before Reset (profile, T1 and A4 photos) | key present (226,519 chars), 2 floating photos | same |
| Right after Reset | **key still there**; the uploaded picture still shown; floating photos gone | **key removed; default picture shown at once**; floating photos gone |
| After a reload | key still there (orphaned bytes); default picture | key absent; default picture |
| Choose a photo again | success; stored | **success; stored (226,519); still there after a reload** |

**Final regression on V560, the whole series:**

| Area | Result |
|---|---|
| A: storage failure messages (9 scenarios), plus recovery, non-quota error and message-limit tests (5) | identical to V551, 9/9 and 5/5 |
| A.1: same file again | recovery stores 4,964,131 chars; A → A → B processed; the "> 5 MB" message shows both times; floating photos give 2 photos |
| B: formats, Chrome (18) and WebKit (8) | identical to V553 |
| C: link photos (5) | identical to V554 |
| D: crop presets (17 checks) | identical to V555 |
| E: touch areas | desktop unchanged; touch handles hit and resize |
| F: Style group | Kthehu, Border, Qoshe të rrumbullakta, Hije; cycles unchanged |
| H1: Adjust colours, CV PDF and A4 | screen and PDF identical (largest difference 1/255) |
| H2: proportions, 6 cases | within ±0.4 % |
| H3: Reset | as in the table above |
| Golden image export | 6/6 at 0.000 % |
| `pdf_check` desktop and `--mobile` | ALL PASS 9/9 on TEXT, ORDER, UNICODE and VISUAL |
| `verify.py` | RELEASE CANDIDATE: YES (60/60 msg keys) |

**Device gate (Neni 72): the owner's iPhone, V560 over the LAN, 2026-10-02:**

| # | Check | Owner's result |
|---|---|---|
| 1 | Profile photo, then a reload | the photo does **not** stay after the reload. The owner wants it that way |
| 2 | The same photo again | ✅ |
| 3 | The new Crop buttons | ✅ |
| 4 | 3:4, corner drag with a finger | ✅ |
| 5 | Round, and Undo | ✅ |
| 6 | Style without Reflection | ✅ |
| 7 | PDF colours and round shape after Adjust | ✅ |
| 8 | Storage full, Albanian flag, 10–15 photos | ✅ the red message appears |
| 9 | Reset Default | ✅ the photos are cleared and the profile photo is gone |
| 10 | Profile photo after Reset, then a reload | does **not** stay. The owner wants it that way |
| 11 | HEIC from Files | ✅ |

**On items 1 and 10:**
- In Chrome and in macOS WebKit (`WKWebView`; profile photos of 165 KB, 1 MB, 3.7 MB and a 3,000×2,250 photo of 3.8 MB), the photo is stored and restored after a reload, on V550 and V560 alike.
- Why the iPhone differs is not established. It may be the iPhone's smaller storage for full-size camera photos (the profile photo, unlike floating photos, is not downscaled), in which case the V551 message should appear.
- Whether the red message appeared on the iPhone is the open question.
- The owner's stated preference is that the profile photo should not persist. That is a decision still to be made explicitly, for all devices.

**Owner's request after the test:** when a photo is enlarged beyond the terminal, the four small corner squares disappear under the terminal's contour. They should stay visible and usable inside it, like the toolbar.

**V561 = the corner handles stay visible and usable inside the terminal.**
- **Placement:** `apply()` places the four `.mph-grip` handles at the photo's corners, each clamped to the terminal's layer with a 14 px margin, which is clear of the 16 px rounded corners. This is the same layer-space rule as the toolbar (V439). The handles still rotate with the photo; there is no counter-rotation, so the look is unchanged.
- **Dragging:** a corner drag now follows the pointer's *movement*. The offset between the pointer and the real corner is recorded at the start of the drag, so a clamped handle does not make the photo jump to the pointer. As a side effect, the up-to-1 px snap of normal handles is gone (+60/+40 now gives exactly +60/+40; V560 gave +61/+41).
- **Touch areas:** the 44 px areas (V556) still apply.

| Test (`griptest.mjs`, `griptouch.mjs`) | V560 | V561 |
|---|---|---|
| Normal photo: handle centres | 1 px outside the corners | **exactly on the corners** |
| Normal photo: drag the bottom-right handle +60/+40 | 240×180 → 301×221 | **→ 300×220** |
| Photo 1,278×786 on a 1,158×706 layer | all four handles **outside the layer, not hittable** | all four **inside (14 px from the edges), hittable** |
| Same photo: drag the bottom-right handle −100/−80 | — (not reachable) | **1,278×786 → 1,178×706**, the opposite corner fixed, no jump |
| Rotated 20°, partly outside | 2 of 4 handles outside | **4 of 4 inside and hittable** |
| Touch (`pointer:coarse`): a point 15 px diagonally inside each handle, normal and enlarged photo | — | **4/4 hit** in both cases |

**Regression on V561:**
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS 9/9.
- `verify.py`: YES.
- The handles are `no-print`, so no export changes.

**The owner's decisions after the V561 handle check (2026-10-02):**
- The handles were tested on the iPhone and approved.
- On iPhone test item 1, the profile photo showed "uploaded successfully" and was gone after a reload; there was no red message. The owner wants the profile photo **never** stored, on every device.
- Before promoting, the owner asked for "balloon" photos, choosing a toggle per photo with a 📌 to edit it again.
- Everything is promoted together after a short iPhone check.

**V562 = balloon photos: a photo can let every tap through to the terminal underneath.**
- **Problem:** the photo layer sits above the terminal content (`z-index:4`), so a photo enlarged over the terminal blocked its buttons, its text editing and its drag and drop.
- **Toggle:** *Tullumbace*, in the photo toolbar's main group. It is one undo step and is stored as `pt:1` in the photo's record. The new field is optional: older versions ignore it, and older records read as off. With it on, `.mot-photo.pt:not(.selected){pointer-events:none}`, so every tap, click, text edit and drag reaches what is underneath, and the photo itself never changes.
- **📌 pin:** a small badge (`.mph-pin`, no-print) near the photo's top-left corner, clamped inside the terminal and kept upright. It is the only part that catches a tap. A first tap selects the photo for editing (move, resize, toolbar); a second tap returns it to balloon mode.
- **Hidden in preview and never exported:** the pin is removed with the other no-print chrome.
- **After a reload:** a restored balloon photo starts unselected, so it lets taps through at once.
- **Messages:** `photoBalloonOn` and `photoBalloonOff`, in de/en/sq.

| Test (`balloontest.mjs`, a photo covering the whole Terminal 1) | Result |
|---|---|
| Before: a text field and the 📷 button under the photo | the photo catches the tap |
| Balloon on | message; photo deselected; 📌 visible inside the terminal |
| After: the text field / the 📷 button / "Berufliche Beschreibung" under the photo | each element itself is hit |
| Real click on the text field, then typing | it gets focus; "Ω" is typed into it |
| Drag "Berufliche Beschreibung" under the photo | it moves, top 452 → 392 px |
| Tap 📌 | the photo is selected and catches taps; dragging it moves it (+30 px) |
| Tap 📌 again | balloon again; the text field is reachable |
| Stored, then a reload | `pt:1` stored; after the reload the photo is unselected and the text is reachable |
| Balloon off, then one undo | off: the photo catches taps; undo: back on |
| Preview mode | 📌 hidden |
| CV PDF with a balloon photo vs the same photo without | **pixel-identical** |

**Regression on V562:**
- The V561 handle tests are unchanged.
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS.
- `verify.py`: YES (62/62 msg keys).

**V563 = the profile photo is never stored (the owner's decision, 2026-10-02).**
- **What it does now:** the uploaded profile photo lives only in the open page. It is shown, and it is in the PDF and image exports of that session. Nothing is written: neither the bytes (`cv_profile_photo`) nor the reference in the state. After a reload the default picture shows, on every device.
- **Leftover bytes:** anything left by earlier versions is removed when the script loads, before any restore, so an old photo neither reappears nor uses space.
- **What it replaces:** the ADR-038 C7-B persistence of the profile photo, and the V551-A failure branch on that path, which no longer has anything to write. Floating photos are unchanged: they are still stored, still announced on failure, and still cleared by Reset.
- **Background:** the iPhone already behaved like this (test item 1: "uploaded successfully", then gone after a reload, with no red message; cause not established). V563 makes it deliberate and the same everywhere.

| Test | V562 | V563 |
|---|---|---|
| Chrome: upload a profile photo | success; stored; state reference set | success; **nothing stored**; no reference |
| Chrome: same, after a reload | photo restored | **default picture** |
| Chrome: CV PDF during the session | — | **the photo is in the PDF** (30,676 magenta pixels of the test photo) |
| Chrome: bytes left by an earlier version, then a reload | the old photo reappears | **bytes removed; default picture** |
| WebKit (`WKWebView`): 165 KB and 3.8 MB photos, then a reload | stored, restored | **stored 0; default picture after the reload** |

**Regression on V563:**
- The balloon tests are unchanged.
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS.
- `verify.py`: YES.

**V564 = the handle being dragged stays under the pointer (owner's report on V563).**
- **Owner's report:** "when I try to enlarge the photo it lets go of the mouse, and it does things I don't understand".
- **Reproduced, step by step:**
  - In V561–V563, as soon as the dragged corner crossed the terminal's edge, its handle stopped at the edge (1144, 692). The pointer went on to (1438, 881).
  - The photo's geometry followed the pointer correctly, but the handle visibly let go of the cursor.
  - In V560 the handle followed the pointer, but it was hidden outside the terminal.
- **Fix:** while a corner handle is being dragged, it is drawn at the pointer, without the clamp. When it is released, it returns inside the terminal (V561's clamp), where it can be grabbed again. The resize maths is unchanged.

| Step-by-step drag (`dragfar.mjs`; bottom-right handle pulled 400/280 px past the terminal) | V563 | V564 |
|---|---|---|
| Handle position during the drag, past the edge | stuck at (1144, 692) | **= the pointer at every step** (up to 1438, 881) |
| Photo corner during the drag | = the pointer | = the pointer (unchanged) |
| After release | — | the handle is back inside at (1144, 692), and hittable |

**Regression on V564:**
- The handle tests (in/outside, rotated, touch areas) and the balloon tests are unchanged.
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS.
- `verify.py`: YES.

**Promotion:** on the owner's instruction ("Promovoje"), as **V565**. See *Release record — V565*.
- **The owner's iPhone test of A–F (Neni 72)**, run once for the series as the owner decided, and an explicit OK.
- **Then G (IndexedDB)**, as a release of its own. B.1 (HEIC for floating photos) and the weserv privacy question remain separate decisions.


**Follow-up tests asked for by the external review (2026-10-02, same code `713365e0`):**

| Test | Result |
|---|---|
| Every caller passes the caught error object | yes, by code: `catch(_s)` → `saveFailed(_s)`, `catch(_sp)` → `saveFailed(_sp)`, profile → `_cvPhotoBytesWrite.lastError` |
| The 4 s limit affects only the message, never the save | yes, by code (`saveFailed` runs after the failed write). Q1: two failures 1.5 s apart give one message; a third failure 4.5 s later gives a new one |
| **Recovery, T1:** fail, free the storage, move the photo, reload | after the move the photo is stored at the new position (520, 115) and is restored there after the reload, so no error state is latched |
| **Recovery, profile:** fail, free the storage, choose a smaller photo, reload | success message, stored (226,519 chars), still there after the reload |
| **Non-quota error** (the harness makes `setItem` throw `new Error('test write failure')`; the app is not modified), T1 and profile, language sq | "Fotoja NUK u ruajt — pas rifreskimit do të mungojë." in both. Not "storage full", and no success message. The profile status text says the same |

**Found by the recovery test, pre-existing (V550 behaves the same):** choosing the **same** file again in the profile-photo picker does nothing, because the input's value is never cleared and no `change` event fires. Floating photos are not affected, because the engine clears its input. So after a failure, re-choosing the same profile photo once space is free would do nothing. The fix is one line (clear the input after reading). It changes behaviour outside the agreed step A, so it waited for the owner's decision. The owner chose to fix it as A.1, and it is V552 below.

**V552 = step A.1: the profile-photo picker accepts the same file again.**
- **What changed:** in the profile handler, `e.target.value=''` runs as soon as the `File` has been taken from the input. The `File` reference stays valid, and every path after it, including the early "not an image" and "over 5 MB" messages, now sees a fresh input next time.
- **Untouched:** floating photos, which already cleared their input. Nothing else changes; the diff is this line, its comment and the label.

| Test (headless Chrome, harness `storagetest4.mjs`) | V551 | V552 |
|---|---|---|
| Recovery with the **same** file: fail, free the storage, choose the same 3.7 MB photo, reload | nothing happens; gone after reload | **success; stored (4,964,131 chars); still there after reload** |
| Regression: photo A, A again, then B, no failure | the second A is ignored | **A is processed again**; B works; B restored after reload |
| A file over 5 MB chosen twice | message only the first time | **"Maximal 5 MB!" both times** |
| Floating photo T1: the same file twice | 2 photos | 2 photos (unchanged) |

**Verification (code `b5540524`):**
- `verify.py`: YES.
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS 9/9.

#### Sandbox ahead of production — V566 (2026-10-02) — CLOSED by the V567 promotion

**Closed on 2026-10-02:** `index-test.html` = `index.html` = `567.html`.

Production is V565 (`b461676d…`).

| Version | Artifact | Hash (md5) | Bytes | Pre-edit backup |
|---|---|---|---|---|
| V566 | `566.html` | `23fe731715bbc29118d458723f656c11` | 1,335,517 | `index-test.html.bak-pre-v566-20261002-144704` (= V565, `b461676d…`) |

**V566 = C.1: unreachable legacy photo code is removed, with no change in behaviour.** The owner asked for it ("C1"), after the external review of V565 recorded it.

**What was there:** the iframe app's `CVCreator` still held the pre-V459 photo implementation.
- **The tail of `_initMotivationPhotos`:**
  - its own `addFiles`;
  - `addUrlPhoto`, with the remote-URL fallback `self._createPhoto(layer,sec,u)`;
  - drag-and-drop and deselect handlers.
- **`_createPhoto`:** about 5 KB, a second photo object with its own toolbar.
- **`_makePhotoInteractive`:** about 3 KB.

**Why it was dead:**
- Both branches of `_initMotivationPhotos` `return;` before the old code: either delegation to `CVPhotoEngine.attachUpload`, or a poll for it.
- `_createPhoto` was called only from that dead tail.
- `_makePhotoInteractive` was called only from `_createPhoto`.

Two implementations of one function go against Neni 9.1. The live path was always `CVPhotoEngine`.

**Removed:**
- the dead tail;
- both methods;
- the two message keys that only the dead code used, `dropImageNotLink` and `fetchingLogo`, in de/en/sq. `verify.py` flagged them as unreferenced once the code was gone.

`CVPhotoEngine` is now the only photo implementation. The V459 comment now records the removal.

**No behaviour change: V565 against V566** (`c1test.mjs`, headless Chrome).

| Scenario | V565 | V566 |
|---|---|---|
| Motivation letter: add a photo through its button | 1 photo, decoded | **identical** |
| Motivation letter: drop a `data:` image | 1 photo, decoded | **identical** |
| Iframe terminal (skills): add a photo | 1 photo; stored 1 | **identical** |
| Iframe terminal (skills): a damaged file | 0 photos; "cannot be opened" message | **identical** |
| Motivation letter: drop a page link | 0 photos; "drop an IMAGE" message (engine's `dropImage`) | **identical** |

**Regression on V566:**
- The handle and balloon tests pass.
- Golden image export: 6/6 at 0.000 %.
- `pdf_check` desktop and `--mobile`: ALL PASS.
- `verify.py`: YES (msg keys 60/60, all referenced).
- The file is 10,342 bytes smaller (1,346,255 → 1,335,517).

### Release record — V567 (2026-10-02) — C.1, legacy photo code removed (V566)

**Promoted on the owner's explicit instruction** ("po bëje"). V567 is V566 plus the build label only; a byte comparison confirmed that nothing else differs.

| Version | Change | Class | Persistence |
|---|---|---|---|
| V566 | C.1: the unreachable legacy photo implementation in the iframe app (`_initMotivationPhotos` tail, `_createPhoto`, `_makePhotoInteractive`) and two message keys only it used are removed; `CVPhotoEngine` is the only photo implementation (Neni 9.1) | Cleanup, no behaviour change | none |

**Device gate (Neni 72): not exercised on a device, by the owner's choice.** The change removes unreachable code only. Behaviour was proven identical against V565 in five iframe and motivation-letter scenarios (`c1test.mjs`), and the handle and balloon tests pass. The owner was offered a device check and chose to promote.

**Backups:**
- **Production:** `index.html.bak-pre-v567-20261002-151841` (= V565, `b461676d…`), hash-verified before the copy and again after it.
- **Sandbox:** `index-test.html.bak-pre-v567-20261002-151841` (= V566, `23fe7317…`).
- **Identity:** after the copy, `md5 -q index.html index-test.html 567.html | sort -u` printed one hash.

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `python3 tools/verify.py --file index.html` | WARN 1 (`ui.langChanged`), FAIL 0 → YES |
| `pdf_check` on `index.html`, desktop and `--mobile` | **ALL PASS: TEXT, ORDER, UNICODE and VISUAL 9/9 each** |
| Golden image export | 0.000 % in all six cases |
| Observatory on production, isolated origin | `V567`; 7 terminals; 0 duplicate ids; msg 60/60 in each language; **`PROBLEMS: none`** |

**Rollback:** production returns to V565 by copying `index.html.bak-pre-v567-20261002-151841` over `index.html` (the command is in *Current baseline*).

### Release record — V565 (2026-10-02) — the photo series (V551–V564)

**Promoted on the owner's explicit instruction** ("Promovoje"), after the owner's iPhone tests of V560, V561 and V564, and their checks on the Mac. V565 is V564 plus the build label only; a byte comparison confirmed that nothing else differs.

**What it carries, V550 → V565.** The full evidence is in *Sandbox ahead of production — V551–V564*.

| Version | Change | Class | Persistence |
|---|---|---|---|
| V551 (A) | A failed photo save is announced (`photoStorageFull` / `photoNotSaved`); one authority, `CVPhotoEngine.saveFailed` | Functional, messages | none (format unchanged) |
| V552 (A.1) | The profile picker accepts the same file again | Functional | none |
| V553 (B) | An image the browser cannot open is announced, never shown broken or stored | Functional, messages | none |
| V554 (C) | Link photos become downscaled local assets; a failed fetch stores no remote URL | Functional | none (format unchanged) |
| V555 (D) | Crop presets: free, 1:1, 3:4, 4:5, round | Feature | none (existing `crop`, `rd`) |
| V556 (E) | 44 px touch areas for the crop and photo handles (touch screens only) | UX | none |
| V557 (F) | "Reflection — coming soon" button removed | UI | none |
| V558 (H1) | Photo Adjust settings baked into the pixels for every export: PDF colours = screen | Export fidelity | none |
| V559 (H2) | Exported photos keep their proportions (`aspect-ratio`) | Export fidelity | none |
| V560 (H3) | Reset Default also removes the profile photo's bytes | Functional | **removes a key on Reset** |
| V561 | The corner handles stay inside the terminal; a drag follows the pointer's movement | UX | none |
| V562 | Balloon photos: taps go through to the terminal; a 📌 to edit | Feature | **new optional field `pt`** in photo records (older versions ignore it) |
| V563 | The profile photo is never stored; leftover bytes are removed at load | Functional (owner's decision) | **`cv_profile_photo` removed at load; never written** |
| V564 | The handle being dragged stays under the pointer | UX | none |

**Device gate (Neni 72): exercised on the owner's iPhone, over the LAN (HTTP).**
- **Phones seen in the server log:** `192.168.1.84` loaded `?v560` at 10:52; `192.168.1.107` loaded `?v561` at 12:06. The Mac (`192.168.1.138`) loaded V560, V561 and V564.
- **V560, the 11-item list:** items 2–9 and 11 ✅. Items 1 and 10 (the profile photo was not kept after a reload) became the owner's deliberate choice, made universal in V563.
- **V561:** "katrorët janë super, shkëlqyer".
- **V564:** "funksionon perfekt", apart from a slight lag in fast circular moves. The owner rated it "significantly improved" against V550 and chose to promote. Smoothness (moving through `transform` during a drag) is a possible separate item.

**Backups:**
- **Production:** `index.html.bak-pre-v565-20261002-141510` (= V550, `792082b8…`), hash-verified before the copy and again after it.
- **Sandbox:** `index-test.html.bak-pre-v565-20261002-141510` (= V564, `85acedf3…`).
- **Identity:** after the copy, `md5 -q index.html index-test.html 565.html | sort -u | wc -l` printed 1.

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `python3 tools/verify.py --file index.html` | PASS, WARN 1 (`ui.langChanged`), FAIL 0 → YES |
| `python3 tools/verify.py --release` (after this record) | PASS 28, WARN 1, FAIL 0 → YES (baseline = production md5; 105 manifest rows match the files; production = sandbox) |
| `pdf_check` on `index.html`, desktop | **ALL PASS: TEXT, ORDER, UNICODE and VISUAL 9/9 each** |
| `pdf_check --mobile` on `index.html` | **ALL PASS: 9/9 each** |
| Golden image export | 0.000 % in all six cases |
| Observatory on production, isolated origin 127.0.0.1:8901 | 7 terminals, 0 duplicate ids, sources agree, msg 62/62 in each language, **`PROBLEMS: none`** |

**Reference images stay V546.** States without photos render pixel-identically, so no `--accept` was run.

**Still open, as separate decisions:**
- G: photos in IndexedDB;
- B.1: HEIC for floating photos;
- the weserv proxy's privacy;
- H4: Fira Mono in the PDF;
- the drag smoothness.

**External review of V565 (ChatGPT, 2026-10-02): no blocker found.**
- **Confirmed:** H1 (filters baked on the export clone) and H2 (`aspect-ratio`) are in the right place. H3 is consistent with the new profile-photo contract.
- **V563 was first flagged as a regression.** The reviewer withdrew this once told it was the owner's decision. The contract is: shown for the session, in the exports, never stored; Reset and reload give the default.
- **Also recorded for later, without blocking:**
  - **C.1, a cleanup with no behaviour change.** `_initMotivationPhotos` still holds the old link-photo code with the remote-URL fallback (`self._createPhoto(layer,sec,u)`, 2×). It is unreachable: both branches `return;` before it, and `_createPhoto` delegates to `CVPhotoEngine` on its first line. Still, two implementations of one function go against Neni 9.1, so the dead code should be removed.
  - **`downscale()` is a compression heuristic, not a hard pixel cap.** Images up to 1100 px are kept as they are. A re-encode that comes out larger keeps the original. This was already noted in the first audit; it is not changed in V565, because it affects storage, quality and the PDF.

**Rollback:** production returns to V550 by copying `index.html.bak-pre-v565-20261002-141510` over `index.html` (the command is in *Current baseline*).

### Release record — V550 (2026-09-30) — the certificate's text layer (V549)

**Promoted on the owner's explicit instruction** ("po, cdo gje funksionon"), after the owner's own iPhone test. V550 is V549 plus the build label only; a byte comparison confirmed that nothing else differs.

**What it carries, V548 → V550**

| Version | Change | Class | Persistence |
|---|---|---|---|
| V549 | An invisible text layer in the two-page A4 certificate. Greek letters (Φ) are carried by the standard Symbol font, so the text is never altered. The image stays pixel-identical, and the CV and letter layers are unchanged. | Functional, export | none |

**Device gate (Neni 72): exercised on the owner's iPhone, over the LAN (HTTP).**
- The server log shows the phone (`192.168.1.107`) loading `index-test.html?v549` at 15:24:51.
- The owner ran the four checks agreed with the external reviewer on the certificate PDF, saved to Files:
  1. select "MAX MUSTERMANN", copy it and paste it into Notes;
  2. search "DEKLARATË"; it is on page 2;
  3. search and copy "Φ240";
  4. compare both pages with V548.
- The owner reported: **"po, cdo gje funksionon".**

The external reviewer's caveat is recorded: PyMuPDF, PDFKit and WebKit are strong evidence but not proof against every real ATS. An interoperability test with other PDF readers is a possible later item. It does not block this release.

**Backups.** Production: `index.html.bak-pre-v550-20260930-152856` (= V548, `ba88f1ef…`), hash-verified before the copy and again after it. Sandbox: `index-test.html.bak-pre-v550-20260930-152856` (= V549, `6e4221c7…`). After the copy, `md5 -q index.html index-test.html 550.html | sort -u | wc -l` printed 1.

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `python3 tools/verify.py --file index.html` | PASS 25, WARN 1 (`ui.langChanged`), FAIL 0 → YES |
| `python3 tools/verify.py --release` (after this record) | YES |
| `pdf_check` on `index.html`, desktop | **ALL PASS: TEXT, ORDER, UNICODE and VISUAL 9/9 each** |
| `pdf_check --mobile` on `index.html` | **ALL PASS: 9/9 each** |
| Golden image export | 0.000 % in all six cases |
| Observatory on production, isolated origin | `V550`, `PROBLEMS: none` |

**Reference images stay V546.** The text layer is invisible, so the V546 PDFs remain the VISUAL reference. No `--accept` was run.

**Rollback:** production returns to V548 by copying `index.html.bak-pre-v550-20260930-152856` over `index.html` (the command is in *Current baseline*).

### Release record — V548 (2026-09-30) — the PDF text layer (V547)

**Promoted on the owner's explicit instruction**, after the owner's own iPhone test ("po i testova dhe çdo provë kaloi me sukses", given in answer to "if all four pass, say 'po'"). V548 is V547 plus the build label only; a byte comparison confirmed that nothing else differs. Following the release convention, the promotion takes the next number. **The certificate's text layer is therefore V549, not V548** as it was called during planning.

**What it carries, V546 → V548**

| Version | Change | Class | Persistence |
|---|---|---|---|
| V547 | An invisible text layer in the CV and letter PDFs, so ATS systems can read the text and users can copy and search it; the image stays pixel-identical | Functional, export | none |

**Device gate (Neni 72): exercised on the owner's iPhone, over the LAN (HTTP).**
- The server log shows the phone (`192.168.1.107`) loading `index-test.html?v547` at 14:35:45.
- The earlier attempts from the phone reached the server as TLS handshakes (400): Safari had tried `https://`. With `http://` typed explicitly, the page loaded.
- The owner ran the four checks agreed with the external reviewer on the PDF, saved to Files through "Paket teilen" → "Save to Files":
  1. long-press the e-mail, copy it and paste it into Notes; the exact address came out;
  2. search "Elektro"; it was found;
  3. select "Führerschein" or "Deutsch – B1"; the characters were correct;
  4. compare the appearance with V546; there was no visible change.
- The owner reported: **all four passed.**

**Backups.** Production: `index.html.bak-pre-v548-20260930-144638` (= V546, `e3a635da…`), hash-verified before the copy and again after it. Sandbox: `index-test.html.bak-pre-v548-20260930-144638` (= V547, `5b1ffa7e…`). After the copy, `md5 -q index.html index-test.html 548.html | sort -u | wc -l` printed 1.

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `python3 tools/verify.py --file index.html` | PASS 25, WARN 1 (`ui.langChanged`), FAIL 0 → YES |
| `python3 tools/verify.py --release` (after this record) | YES |
| `pdf_check` on `index.html`, desktop | CV and letter × de/en/sq: TEXT, ORDER and UNICODE PASS (CV de: 2800 characters, critical 3/3, content 75/75, extra 0); certificate unchanged; **VISUAL 9/9 pixel-identical to V546** |
| `pdf_check --mobile` on `index.html` | the same: 6/6 PASS; VISUAL 9/9 |
| Golden image export | 0.000 % in all six cases |
| Observatory on production, isolated origin | `V548`, `PROBLEMS: none` (7 terminals, 16 contacts, sources agree, curtain off) |

**Reference images stay V546.** The text layer is invisible, so the VISUAL reference in `tools/pdfcheck/baseline*/` (the V546 PDFs) remains the correct one. No `--accept` was run.

**Rollback:** production returns to V546 by copying `index.html.bak-pre-v548-20260930-144638` over `index.html` (the command is in *Current baseline*).

### Release record — V546 (2026-09-30) — three atomic changes, one release transaction

**Promoted on the owner's explicit instruction** ("po eshte ne rregull tani"), given in answer to the question whether V545 could
go to production. The transaction carries V543–V545. V546 is V545 plus the build label only; a byte comparison confirmed that
nothing else differs.

**What it carries, V542 → V546**

| Version | Change | Class | Persistence |
|---|---|---|---|
| V543 | Transient UI (notifications, an earlier image overlay) never enters an export | Functional, export | none |
| V544 | Build and date in the PDF properties (Title, Subject, Creator, Keywords); no name added, nothing on the page | Functional, export | none |
| V545 | The hidden notification box is fully off-screen at any width (fixes the 7 px sliver from V539, in production since V542) | UI | none |

**Device gate (Neni 72) — exercised on the owner's iPhone, over the LAN (HTTP), stated as reported.**
- **V544 (09:26–09:31):** the owner switched the flag, then went through preview → download → "Paket teilen", and an Apple
  sheet with "Save to Files" opened. The owner saved the PDF and reported the PDFs fine, with no notification inside. The owner
  then reported the mark at the top right, which became V545.
- **V545:** the server log shows the phone (`192.168.1.107`) loading `index-test.html?v545` at 11:37:42. The owner then
  confirmed "po eshte ne rregull tani".
- This is the first promotion since V529 whose changes the owner looked at on the phone before the OK. The checks were the
  owner's own, not an item-by-item matrix, so the device matrix records them as the owner's report.

**Backups.** Production: `index.html.bak-pre-v546-20260930-113924` (= V542, `929e8b2c…`), hash-verified before the copy and again
after it. Sandbox: `index-test.html.bak-pre-v546-20260930-113924` (= V545, `841494e6…`). After the copy
`md5 -q index.html index-test.html 546.html | sort -u | wc -l` printed 1.

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `python3 tools/verify.py --file index.html` | PASS 25, WARN 1 (`ui.langChanged`), FAIL 0 → YES |
| `python3 tools/verify.py --release` (after this record) | PASS 28, WARN 1, FAIL 0 → YES (baseline = production, 64 manifest rows match, production = sandbox) |
| Observatory on production, isolated origin | `V546`, `PROBLEMS: none` (7 terminals, 16 contacts, 0 duplicate ids, sources agree, curtain off, i18n complete, hidden notification off-screen) |
| Golden evidence on `index.html` | 0.000 % in all six cases → `VISUAL REGRESSION: NONE` |
| iOS Simulator, production URL | page complete, top-right corner clean; preview → download → "Als Bild speichern" rendered the export |

**Noted, not changed (known and recorded before):** the "Save as Image" overlay hint ("Shtyp gjatë mbi foton …") is Albanian in
every language. It was listed as fixed-language by choice after V537; it is a candidate for a future sandbox version if the owner
wants it to follow the flag.

**Rollback:** production returns to V542 by copying `index.html.bak-pre-v546-20260930-113924` over `index.html` (the command is in
*Current baseline* above).

### Release record — V542 (2026-09-29) — four atomic changes, one release transaction

**Promoted on the owner's explicit instruction** ("promovoje"). The transaction carries the four atomic changes that followed the
external review, V538–V541. V542 is V541 plus the build label only; a byte comparison confirmed that nothing else differs.

**What it carries, V537 → V542**

| Version | Change | Class | Persistence |
|---|---|---|---|
| V538 | The boot curtain loses its only `!important` (Neni 8.2c) | UI, all platforms | none |
| V539 | No static text in the notification element | UI | none |
| V540 | The app signals boot-ready; a start-up error reveals at once; fallbacks at load + 3 s and 20 s | Functional, start-up | none |
| V541 | The 20 s safety starts at `DOMContentLoaded`; absolute 60 s | Functional, start-up | none |

**Device gate (Neni 72) — stated as it is: NOT exercised on the owner's phone.**
- The server log shows V541 opened only from the Mac (`192.168.1.138`, 17:16:25), not from the phone.
- GitHub Pages was not enabled, so the HTTPS test did not happen.
- All four changes were verified on the Mac (the isolated origin, including instrumented test copies) and in the iOS Simulator: throttled loads at 130 and 40 KB/s, dark and light designs, and five screen sizes.
- The owner authorised promotion with the gate open, as with V501, V507, V509 and V520.
- The device coverage matrix above records the state. **Update 2026-09-30:** the HTTPS share path was then verified on the owner's iPhone, through the anonymised copy on GitHub Pages, with share code byte-identical to V542.

**Backups.** Production: `index.html.bak-pre-v542-20260929-171732` (= V537, `d2b8a938…`), hash-verified before the copy and again
after it. Sandbox: `index-test.html.bak-pre-v542-20260929-171732` (= V541, `ce767087…`). After the copy
`md5 -q index.html index-test.html 542.html | sort -u | wc -l` printed 1.

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `window.CV.build` | `V542` |
| Boot curtain after load | removed; `__cvBootReady` present |
| `window.Utils === Utils` · viewport on the Mac | true · `device-width` |
| `#autosaveMessage` at start | empty |
| Title centre / header centre | 595 / 595 |
| Contact items · terminals | 16 · 7 |
| Flag sq → Reset Default | stays `sq`; "Të gjitha pozicionet u rivendosën në default!" |
| JavaScript errors | none |
| iOS Simulator, production URL | Share Package → 1.1 MB PDF, share sheet opened |

```bash
cp "index.html.bak-pre-v542-20260929-171732" "index.html"
```

### Release record — V537 (2026-09-29) — five atomic changes, one release transaction

> **Terminology (external review, point 6).** V537 is **one release transaction carrying five atomic changes** (V532–V536).
> It is not one change: each atomic change keeps its own cause, fix, backup, snapshot and verification in the sandbox record above.
> The same reading applies to V520 (V510–V519) and V529 (V521–V528).

**Promoted on the owner's explicit instruction** ("cdo gje ne rregull, promovoji te gjith sandboxet"), carrying
V532–V536 at once. V537 is V536 plus the build label only (`CV.build = 'V537'` and its comment-chain entry).
A byte comparison confirmed that nothing else differs.

**What it carries, V531 → V537**

| Version | Change | Class | Persistence |
|---|---|---|---|
| V532 | `window.Utils = Utils`, so the photo-toolbar notifications and "PDF export failed" are finally shown | Functional, all platforms | none |
| V533 | The export sheet's labels follow the language flag (`TRANSLATIONS[lang].ui`) | UI, all platforms | none (a new `ui` keyset) |
| V534 | Phones get the 1200 px viewport in the head, before the first paint | UI, phones | none |
| V535 | Reset Default, a start with no stored state and `loadState()`'s zero-seed branch keep the chosen language | Functional | writes `language` into the reset state, as the flag already does |
| V536 | A boot curtain hides the progressive paint until `load`; the page appears complete at once | UI, all platforms | none |

**Device gate (Neni 72) — passed.** The phone loaded V536 over the LAN (server log: `192.168.1.107`, 15:11:25 and
a refresh at 15:11:29), and the owner reported that everything works. Earlier in the series the owner's phone had also
loaded V534 (`192.168.1.126`, 14:51–14:52). The native share sheet on the phone still needs HTTPS and remains untested.

**Backups.** Production: `index.html.bak-pre-v537-20260929-151453` (= V531, `c418ef74…`), hash-verified before the
copy and again after it. Sandbox: `index-test.html.bak-pre-v537-20260929-151453` (= V536, `4e1e3c0a…`). After the copy
`md5 -q index.html index-test.html 537.html | sort -u | wc -l` printed 1.

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `window.CV.build` | `V537` |
| Boot curtain after load | removed (`class="js"`, body opacity 1) |
| Viewport on the Mac | `device-width` (`__cvIsPhoneViewport()` false) |
| `window.Utils === Utils` | true |
| Title centre / header centre | 587 / 587 |
| Contact items · terminals | 16 · 7 |
| Flag sq → Reset Default | state, `currentLang` and `cv_language` stay `sq`; "Të gjitha pozicionet u rivendosën në default!" |
| Export sheet in sq | "Paketa e eksportit"; "Shkarko paketën", "Ruaj si foto", "Ndaj paketën" |
| JavaScript errors | none |
| iOS Simulator, production URL | Share Package → 1.1 MB PDF, share sheet opened |

```bash
cp "index.html.bak-pre-v537-20260929-151453" "index.html"
```

### Release record — V531 (2026-09-29) — notifications follow the language flag

**Promoted on the owner's explicit instruction** ("po bej te gjitha rregullimet", given in answer to the
question "a ta kaloj V530-n në kopjen zyrtare?"). V531 is V530 plus the build label only
(`CV.build = 'V531'` and its comment-chain entry). A byte comparison confirmed that nothing else differs.

**What it carries, V529 → V531**

| Version | Change | Class | Persistence |
|---|---|---|---|
| V530 | Every notification text comes from `TRANSLATIONS[lang].msg` (57 keys, de/en/sq) in the language of the flag | UI, all platforms | none (a new `msg` namespace; no consumer iterates the namespaces) |

**Device gate (Neni 72) — passed.** On 2026-09-29 the owner tested V530 on the iPhone (server log: `192.168.1.108`, 14:18:58):
- the flag;
- the notification in Albanian and in German;
- a normal PDF download.

The owner reported that everything works. This is the first release in the series whose headline change was confirmed on the phone before promotion.

**Backups.** Production: `index.html.bak-pre-v531-20260929-142927` (= V529, `924e655c…`), hash-verified
before the copy and again after it. Sandbox: `index-test.html.bak-pre-v531-20260929-142927` (= V530,
`afc15072…`). After the copy `md5 -q index.html index-test.html 531.html | sort -u | wc -l` printed 1.

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `window.CV.build` | `V531` |
| Title centre / header centre | 583 / 583 (a narrower pane than in the V529 check) |
| Contact items · terminals | 16 · 7 |
| Real flag button + leave-preview notification | sq "Modaliteti i redaktimit aktiv" → en "Edit mode on" → de "Bearbeitungsmodus aktiv"; language restored to de |
| CV Creator iframe (`cvCreator.msg`) | "CV Creator erfolgreich gestartet!" (de) |
| JavaScript errors | none |
| iOS Simulator, production URL | Share Package → 1.1 MB PDF, share sheet opened |

```bash
cp "index.html.bak-pre-v531-20260929-142927" "index.html"
```

### Release record — V529 (2026-09-28) — mobile PDF cap, design 3/4 title, old findings closed

**Promoted on the owner's explicit instruction** ("ne rregull, promovoje"), carrying the sandbox
series V521–V528 at once. V529 itself changes one thing over V528: `CV.build = 'V529'`, plus the
matching entry in the label's comment chain. A byte comparison confirmed that nothing else differs.

**What it carries, V520 → V529** (delta-audit, one class per change)

| Version | Change | Class | Persistence |
|---|---|---|---|
| V521 | The mobile PDF canvas respects the iOS cap (32.3 → 16.0 MP), with the same page size via `scale × pdfRatio = 1.5` | Functional, mobile only | none |
| V523 | Terminal 1's title is centred in the Neumorphic export (designs 3 and 4); `transform !important` removed | UI, export only | none |
| V524 | Subresource Integrity on the three CDN libraries | Architecture (security) | none |
| V525 | The ghost `#pdfExportModal` and its four CSS rules removed | Dead code removed | none |
| V526 | The raw NUL byte in `fingerprint()` is written as `'�'` | Architecture (source hygiene) | fingerprints verified identical |
| V527 | One mobile-detection source, `Utils.isMobileDevice()` | Architecture | none |
| V528 | One script tag per library; the libraries load in parallel | Functional, every export | none |

V522 was written and withdrawn inside the series and is not part of the release. No change touches
stored state, so no migration applies (checklist step 4). The one new failure mode is V524's by
design: if a CDN ever serves different bytes, the browser refuses the file and the export ends with
the existing V509 error path instead of running unknown code.

**Device gate (Neni 72) — stated as it is.** The owner opened V528 on the iPhone over the LAN (server
log: `GET /index-test.html?v528` from `192.168.1.126` at 15:01:38) and then gave the OK. Results on the
phone were not reported item by item. Confirmed in the **iOS Simulator**:
- V521 (canvas halved);
- V523 (design 4 title);
- V524–V528 together (Modern, 851 KB PDF);
- production V529 itself (Neumorphic, 1.1 MB PDF, share sheet opened).

The native share sheet on the real phone still needs an HTTPS origin and remains untested.

**Backups.** Production: `index.html.bak-pre-v529-20260928-151109` (= V520, `d02b3b39…`), hash-verified
before the copy and again after it. Sandbox: `index-test.html.bak-pre-v529-20260928-151109` (= V528,
`dd3524ee…`). After the copy `md5 -q index.html index-test.html 529.html | sort -u | wc -l` printed 1.

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `window.CV.build` | `V529` |
| Title centre / header centre | 590 / 590 |
| Contact items · terminals | 16 · 7. The same stored state loaded in `520.html` gives 16 · 7 too; the V520 record's 5 was measured in a different state. |
| Phone number colour (live, Neumorphic) | the design's `rgb(50, 63, 79)`, not link blue |
| Ghost modal | absent |
| html-to-image under SRI (desktop Neumorphic path) | loads, `toPng` renders |
| JavaScript errors from this load | none. The only console entry was the deliberate wrong-hash probe from V524 testing. |
| iOS Simulator, production URL | Neumorphic, Share Package → 1.1 MB PDF, share sheet opened |

```bash
cp "index.html.bak-pre-v529-20260928-151109" "index.html"
```

### Release record — V520 (2026-09-27) — the mobile export series, promoted as one

**Promoted on the owner's explicit instruction** ("bëje finalen 520 prodhim"), carrying ten sandbox
versions at once. V520 itself changes one thing over V519: `CV.build = 'V520'`.

**What it carries, V509 → V520**

| Version | Change | Class |
|---|---|---|
| V510 | `ssCanShareFiles()` gates the mobile share path on capability, not platform; without Web Share the sheet falls through to the existing download | Functional, mobile only |
| V511 | Share preparation is valid while its selection key is current; `ssShareGen` removed | Functional, mobile only |
| V512 | A package is published only when every job produced its file; otherwise one clear notification | Functional, mobile only |
| V513 | One preparation at a time; a second one queues instead of racing | Functional, mobile only |
| V515 | The live title centres with `left/top:50%` + `translate(-50%,-50%)` instead of `margin:auto`, which iOS does not resolve | Visual, all platforms |
| V517 | The V514 export rule removed — one centring authority | Visual, export |
| V518 | Contact links keep their colour inside the export (iOS styles them as links) | Visual, export |
| V519 | The Modern design's contact pills are rebuilt for the export from primitives the engine draws | Visual, export |

V514 and V516 were written and then withdrawn; both are recorded above with the evidence that retired them.

**Device gate (Neni 72) — stated as it is, not as it should be.** Confirmed on the owner's iPhone:
the download fallback for a single document (V510) and the centred title (V515 + V517). Confirmed in
the **iOS Simulator** but not yet on the phone: V518 and V519. Not exercised on the phone at all:
V511–V513, whose flow the owner has decided not to use — multi-document packages are dropped in
favour of one download at a time. The owner authorised promotion with that gate open, as with V501,
V507 and V509 before it.

**A measurement worth keeping.** The owner reported that Terminal 1's six contact pills and the
"Berufliche Beschreibung" block looked different in the new PDFs. A pixel comparison of the same
export from V509 and from V519 (Classic, top region) found **0.35 % of pixels differing, all of them
in the title band**. The pills and the description are byte-for-byte identical across the series. The
glow those pills carry on screen has never reached any export, V509 included: the engine does not
draw conic-gradient or blur (Neni 75b). Rasterising it deliberately (Neni 74) remains open work.

| Sanity check after promotion (Neni 72.4) | Result |
|---|---|
| `window.CV.build` | `V520` |
| Title centre / header centre | 590 / 590 |
| Contact items · terminals in the iframe | 16 · 5 |
| Phone number colour | white |
| JavaScript errors | none (only a 404 for a favicon the project does not ship) |
| iOS Simulator, production URL | renders correctly |

### Release record — V509 (2026-09-11) — script loading has a guaranteed end

**Promoted on explicit authorisation, about ten minutes after V507.** The change and its A/B evidence
are recorded under *"Sandbox after promotion — V509"* in the V507 record below; they are not repeated
here. The device gate (Neni 72) is **not passed** — this change targets exactly the phone case (a
locked screen or backgrounded tab during a stalled download), and was verified only in a hidden
desktop tab.

**Delta-audit, V507 → V509:** two hunks. (1) `ensure()` in `PdfPipeline.loadLibraries` — Functional,
auto-runs on every export and on mobile share preparation. (2) `window.CV.build = 'V509'`.

**Persistence (step 4): checked, not applicable.** `CV.build` is not only a label — it is read in three
places, all inside the BUG-017 frame instrument: `persist()` stamps it into `localStorage['cv_bug017_frames']`,
`stamp()` builds episode origins as `build/s3`, and `json()` exports it. On load the instrument copies the
stored episodes into `prior` and the stored build into `priorBuild` — **no comparison clears, rewrites or
migrates anything.** Episodes from before the promotion will now read as a prior build (`V487+adr035`),
which is exactly what the instrument's own comment calls expected. User state
(`cv_unified_app_state_v2`) does not contain the build label.

#### Verification (browser automation, Mac/Chrome, on the promoted artifact)

| Check | Result |
|---|---|
| Artifact served | SHA-256 `9fad8250…` over 1,267,059 bytes — the promoted file |
| Mirror | `index.html == index-test.html == 509.html` (one hash) |
| Label | `window.CV.build === 'V509'` |
| Headline change | `Timed out loading: ` present in served bytes |
| Loads / renders | 7 terminals, `#bodyFrame` present |
| Save/load round-trip | reload → state identical except `$.timestamp` |
| Normal export path (`saveimage`) | all three libraries loaded, zero errors on this page |
| Stalled-CDN path | measured on byte-identical `index-test.html` before promotion (V507 unsettled at 116.7 s, V509 rejects) |

> A `PDF export error: Timed out loading…` line was visible in the console panel during the smoke test.
> Its stack points to `index-test.html?v509=1` — the deliberate stall test, retained in the tab's history.
> The error recorder installed on the promoted page caught nothing. Recorded so no one misreads it.

```bash
cp "index.html.bak-pre-v509-20260911-001420" "index.html"
```

---

### Release record — V507 (2026-09-11) — mobile export: A4 geometry, preview boundary, share preparation

**Promoted on explicit authorisation, with the device gate (Neni 72) NOT passed.** Every change in
this release is mobile-motivated, and none was exercised on a real phone. That is recorded as
*pending*, never as *passed*. The V501 device debt is still open as well.

**Six sandbox versions reached production together.** V502–V507 were built on 2026-09-02/03 and had
**no entry in any document** until this record — the sandbox was six versions ahead of production,
silently. The chain was reconstructed from the per-step backups (`index-test.html.bak-pre-v50N-*`),
each of which holds the state immediately before version N.

| | Change | Class | Surface |
|---|---|---|---|
| V502 | `.a4-page { text-size-adjust:100% }` — iOS inflated A4 text 1.5× under `viewport width=1200`, so screen and export paginated differently (2 sheets vs 4) | UI | A4 view + PNG/PDF, iOS |
| V503 | Opening the share sheet no longer starts pre-generation (`ssUpdateMeta(false)`) — it blocked the main thread 16.3 s and swallowed the taps needed to change the selection | Functional | share sheet, mobile only |
| V504 | Preview mode enforced by capture-phase listeners (`__cvInstallPreviewGuard`) in the page **and** the iframe, read at event time; no DOM attribute touched | Functional | preview mode |
| V505 | Share button declares "Po përgatitet…" while files are prepared; two rAFs so the label paints before the main thread blocks | UI | share sheet, mobile only |
| V506 | Button no longer disabled during preparation; busy state is an in-flight counter decremented in a `finally` on every exit | Functional | share sheet, mobile only |
| V507 | (a) a tap during preparation no longer restarts it (`__ssPrepKey`); (b) rAF raced against a 300 ms timer — rAF is suspended for hidden pages, so a locked screen hung preparation forever | Functional | share sheet, mobile only |

**Delta-audit, V501 → V507:** 9 hunks, 6 lines removed, 92 added (mostly comment). **Persistence:**
no added or removed line mentions `localStorage`, `sessionStorage`, `JSON.stringify`, `save(` or
`SCHEMA`; V504 explicitly leaves `contenteditable` in place, so serialisation is unchanged. Migration
testing (step 4) is therefore not applicable. **Withdrawn, not shipped:** a V508 (90 s ceiling around
`generatePdfExport` in the share path) was written and removed before V507 was cut — it rested on a
diagnosis V507 itself falsified. Kept as `index-test.html.bak-with-v508-004836`.

#### Verification (browser automation, Mac/Chrome, on the promoted artifact)

| Check | Result |
|---|---|
| Artifact served | SHA-256 `766a6bd6…` over 1,265,541 bytes — the promoted file, not a cache |
| Mirror | `index.html == index-test.html == 507.html` (one hash) at promotion |
| Loads / renders | 7 terminals, `#bodyFrame` present |
| Headline markers | V502 CSS, V507 `__ssPrepKey` and timer race present in the served bytes |
| V504 guard | preview on → `beforeinput` prevented in page **and** iframe; preview off → editable again |
| Save/load round-trip | reload → state identical except `$.timestamp` |
| Preview toggle | stored state unchanged |
| Console errors | none |

`window.CV.build` still reads `V487+adr035` in this artifact — the promoted bytes are exactly the
snapshot that was built, so the label was not touched here. Fixed in the sandbox as V509.

#### Sandbox after promotion — V509 (deviation CLOSED: V509 promoted the same day, see its record above)

`index-test.html == 509.html` (`660bc50b050c0145b15fbb9122a94b94`, 1,267,059 bytes) ≠ `index.html` (V507). The mirror
invariant is suspended **inside this named transaction**, recorded here before anything else happens.

| | Change | Class |
|---|---|---|
| V509 | `ensure()` (script loader in `PdfPipeline.loadLibraries`) settles within 20 s: on expiry it re-tests, then rejects `Timed out loading: <src>`; handlers guarded so it settles exactly once | Functional |
| V509 | `window.CV.build = 'V509'` (frozen at `V487+adr035` since V487) | Docs/label |

Why: the loader rejected only on `onerror`. A stalled request (no `load`, no `error`) left
`generatePdfExport` pending forever, so its own `catch` was never reached — every export and the mobile
share preparation hung. The label **V508 is not reused**: it names the withdrawn caller-side ceiling.

**Verification — A/B with a stalled CDN** (script tags to cdnjs/jsdelivr swallowed: no event ever fires):

| | V507 (production, control) | V509 (sandbox) |
|---|---|---|
| Export via share-sheet `download` | **no settlement after 116.7 s** | rejects: `PDF export error: Timed out loading: …html2canvas.min.js` |
| Retry with CDN released | — | all three libraries load, fresh tags appended, zero errors |

The V509 rejection landed at 34.5 s, not 20 s: the Browser pane was hidden (`document.hidden=true`)
and Chrome throttles timers on hidden pages. **That is the relevant case** — the phone locked or
backgrounded — and the bound still held. The image overlay after the retry was not visually confirmed.
Diff vs `507.html`: exactly the loader hunk and the build line.


```bash
cp "index.html.bak-pre-v507-20260911-000426" "index.html"
```

---

### Release record — V501 (2026-09-02) — export scope routing + inter-sheet separator

**Promoted on explicit authorisation, with the device gate (Neni 72) NOT passed.** The user tested
on Mac/Chrome, approved, and said the phone test would come later. That is recorded as *pending*,
never as *passed* — the absence of a device test is an epistemic limit, not a negative result.

**Three changes reached production together** (V499 pre-existed in the sandbox unpromoted):

| | Change | Lines |
|---|---|---|
| V499 | `renderDocToCanvas` records the pagination outcome instead of swallowing it | pre-existing |
| V500 | `ExportPreparer.prepare()` strips `a4-mode` from the capture when scope ≠ document | 3 code |
| V501 | Separator bands drawn onto the canvas + context transform reset + engine publishes its geometry | ~12 code |

#### V500 — the exported artefact is decided by scope, not by the visible view

`prepare()` serialises the live document via `documentElement.outerHTML`, so `<body class="a4-mode">`
travelled into the export clone, where the same CSS hides the CV terminals and shows `#a4DocView`.
A CV export therefore rendered the **A4 document**, at `config.width` (1200px) instead of the live
width — which re-flows the text while the pagination pushes stay frozen, stranding text in the gaps.
Four earlier hypotheses missed this because the CV export *never produced a CV to look at*.

Removal is synchronous end-to-end (zero `await` between it and `unpctize`), so the browser cannot
repaint: no flash, and `pctize()` measures the terminals laid out rather than `display:none`.

#### V501 — three layers, two of which were wrong hypotheses

1. **First hypothesis: the gap lost its colour. FALSIFIED.** Setting the background dark darkened
   the **sheets too** (97%), which is impossible if the gradient had rendered.
2. **Actual cause:** `paint()` draws sheets with `repeating-linear-gradient(…#fff…transparent…)`
   and **html2canvas does not render it**. The sheets were white only because the flat backdrop was
   white — the stripes were never drawn, so the separator could not exist. The image export had
   *never* shown sheet separation.
3. **The fix drew nothing at first**, while the instrument reported `breza: 1` and every input was
   correct: `y=3369 h=120 w=2382 s=3 fill=rgb(10,12,18)`. Measuring the context state gave
   `a=3 d=3 e=300000 f=0` — **html2canvas leaves its own transform applied** (scale 3 plus the
   offscreen host's `left:-100000px` × 3). `fillRect(0,3369,…)` painted at `x=300000, y=10107`,
   off-canvas, **throwing no error**. `setTransform(1,0,0,1,0,0)` resolved it.

**The reusable lesson: measuring the INPUTS could not catch this.** All of them were perfect. The
hidden variable was the context state — the instrument reported what it was *told*, not what
*happened*. This is the same class as `mechanism ≠ behaviour`, one level lower.

Geometry is read from `window.__a4PaginateRoot.geom`, published by the pagination engine itself, so
`renderDocToCanvas` does not re-copy `SHEET_H`/`GAP` (Neni 7). The PDF path is untouched — it slices
its own pages and requires the white backdrop; it remained the only white host.

#### Verification (browser automation, on the promoted artifact)

| Check | Result |
|---|---|
| Document image | 93.2% white · exactly one dark band at `y 3372–3488` |
| Gap geometry | `1123×3 = 3369` → `+40×3` — matches the engine's own constants |
| CV export from the A4 view | 3600×8814, luminance 26.9 → the CV, not the document |
| Live view after export | still in `a4-mode`, no side effect |
| PDF path | untouched, still the only `background:#ffffff` host |
| Errors | none |
| Diagnostic instrument | removed (0 references to `cvPagDiag`); the *recorders* were kept deliberately — deleting them would restore the silent failure that made this bug invisible |

#### Not fixed here, deliberately

The terminal title is left-aligned in the CV export (`x 88–678`, centroid 393, image centre 1800).
**Proven pre-existing:** the control export with `a4-mode` off — where V500 executes nothing — shows
the identical offset, and the diff adds only 16 lines. Cause: `.terminal-title` centres via
`inset:0 + margin:auto + width:fit-content`, and **html2canvas does not resolve `fit-content`**, so
the auto margins collapse to 0. Held back under Neni 20.2; it is a separate cycle.

---

### Release record — V493 (2026-08-29) — slider touch adaptation + AMENDMENT-01 draft

**Two CSS declarations. Everything else in the delta is comment.**

```
line 1411   .flag-container svg   width:100%;height:100%  →  width:42px;height:42px
line 2099   @media (hover:hover) and (pointer:fine)       →  @media screen
```

**Why 1411 exists, and it is the whole release.** The slider's collapse/expand animation was
desktop-only. Enabling it on touch (`@media screen`) worked, but the language button showed a jolt
**at the end** of the opening, on iPhone only. A CSSOM audit of all 58 rules touching the slider
found the flag SVG was the **only** icon sized in percentages (`width:100%`) while every other icon
uses fixed `26px`. **Percentages inside a `transform` are resolved by layout, not the compositor, and
iOS performs that relayout when the transform ends** — exactly the shape of the symptom. Fixing the
geometry removed it. Confirmed on device by the owner.

A `scale`-based hypothesis was tested first with a single-variable instrument
(`diag-flag-noscale.html`) and **falsified** — both files behaved identically on iPhone. The flag's
4-deep redundant circular clipping (button + container + svg + clipPath, all drawing the same circle)
is a **proven Neni 9 violation** that was **never shown to be the cause**; it remains untouched and
must not be recorded as resolved.

**Still present, deliberately not fixed:** `.link:hover` and `.flag-button:hover` both apply
`transform:translateY(-3px)` over 0.3s from the base layer, so on iOS a tap fires them alongside the
parent's 0.45s+0.20s expansion — two nested transforms on different clocks. It did not need fixing,
which is the evidence that stopping at one variable was right.

**Also shipped, and the owner was told before authorising:** the AMENDMENT-01 constitutional DRAFT
(+21,434 chars, banded `DRAFT — NUK ËSHTË NË FUQI` five times) and the V388 CSS comment correction.
Neither is code. The Neni 20.2 objection — unrelated changes must not accumulate in one cycle — was
raised and the owner chose to promote all of it (option A).

**Process:** Neni 76.2 light cycle, proportional to two reversible CSS declarations with a proven
root cause. Neni 76.4 floor satisfied: root cause · backup · empirical verification · device-test.

```
pre-flight   index.html      56b0c30757f79a36a8e1afe4169a1ea9   (asserted before touching anything)
             index-test.html e8f9c29d08cba50cc9cb476ea24b3d4d   (asserted)
             493.html        must not already exist             (asserted)
backup       index.html.bak-pre-v493-20260829-014817  = 56b0c307  (verified BEFORE the copy)
step 1       index-test.html -> 493.html      (Release Snapshot)
step 2       493.html        -> index.html    (production)

after        index.html == index-test.html == 493.html == e8f9c29d
             SHA-256  b7b2c1fa883328ade43389236fc89dd9884f231daf2ecdcb6d0f49f65b8f4f56
             492.html        56b0c30757f79a36a8e1afe4169a1ea9   UNCHANGED
```

**Checklist:**

| Step | State |
|---|---|
| 1 · Artifacts identified by hash | ✅ |
| 2 · Backup created **and verified** | ✅ `index.html.bak-pre-v493-20260829-014817`, asserted before the copy |
| 3 · Delta-audit | ✅ **2 CSS declarations + 2 comment groups**, measured with difflib after stripping the constitutional comment — an index-based diff first reported "10,320 lines changed", which was an instrument artifact of the comment growing by 427 lines |
| 4 · Migrations tested | **NOT APPLICABLE** — no persisted field touched |
| 5 · Smoke test on the promoted artifact | ✅ syntax 27/27 · console 0 · hover 110→431px · 5 icons · flag SVG 42px |
| 6 · Rollback point confirmed | ✅ `cp "index.html.bak-pre-v493-20260829-014817" "index.html"` |
| 7 · Documentation updated | ✅ RELEASE_PROCESS · BACKUP_INDEX — same transaction |
| 8 · Baseline recorded | ✅ table at the top, same transaction |

**A/B against V492, same origin and same state — the only comparison that isolates the promotion:**
contacts `[755,1098,624,608,609,616,599,598]` · photo 490 · iframe 180478/3323/15/83 · live 45/4 ·
state SHA `fac7164ef4b4b45eafa6` — **identical on both.** The only measured difference is
`@media screen` present in V493 and absent in V492.

> **Measurement caveat, recorded rather than hidden.** An earlier post-promotion read differed from
> the pre-promotion baseline on four values. Cause: during touch testing a tap activated the flag
> button and the display language changed `de → sq` in the **test origin's** localStorage, which also
> shifted the template. That is `http://localhost:8742`, a different origin from the `file://` the
> owner uses, so no real CV data was affected — but it invalidated the baseline, and the A/B above
> was re-run under identical state to isolate the promotion. Reading those four deltas as a
> regression would have been wrong.

### Release record — V494 (2026-08-29) — draft articles made structurally distinguishable

**A documentation release. Five title markers. Zero code.**

```
Neni 83 — …   →   Neni 83 [DRAFT — NUK ËSHTË NË FUQI] — …
…                 …through Neni 87
```

**Why.** V493 shipped the AMENDMENT-01 draft, whose articles 83–87 were written in the **same format
as articles in force** (`Neni N — Title`). The banner declaring DRAFT surrounded the *block*, not each
*article*. A naive index of `^Neni N — ` therefore returned **87** articles instead of 82 — an error
committed during V493's own forensic audit, by the auditor, which is how it was found. After V494 the
same count returns **82**.

The principle, stated by the owner and worth keeping: **a constitutional draft must be
distinguishable by its own structure, not only by a paragraph nearby.**

**Scope discipline.** The audit also found 26 CSS/JS comments and 5 `law:` strings citing articles by
number (`(Neni 78)`). **None is a parser** — verified: zero regex, match, indexOf, includes, split or
RegExp operations over `Neni` in executable code. They were deliberately left alone. (An initial check
reported "2 parsing operations"; both were false positives where the regex matched a CSS comment
`/…(Neni 9.3). */` as a regex literal.)

```
pre-flight   index.html      e8f9c29d08cba50cc9cb476ea24b3d4d   (asserted)
             494.html        must not already exist             (asserted)
backup       index.html.bak-pre-v494-20260829-020510 = e8f9c29d  (verified BEFORE the copy)
gates        5 lines changed · 5 titles · articles 1-82 identical · code identical · naive count 82
step 1       draft-marker-test.html -> 494.html
step 2       494.html -> index.html  (and index-test.html re-synced)

after        index.html == index-test.html == 494.html == ddce3d51
             SHA-256  98b1a408df4152e0e2221ee5484dfcbc41c5558ce72a23f7475c7481c3754ddb
             493.html  e8f9c29d08cba50cc9cb476ea24b3d4d   UNCHANGED
```

**Checklist:**

| Step | State |
|---|---|
| 1 · Artifacts identified by hash | ✅ |
| 2 · Backup created **and verified** | ✅ `index.html.bak-pre-v494-20260829-020510`, asserted before the copy |
| 3 · Delta-audit | ✅ **5 lines, all of them draft article titles** — lines 1157, 1169, 1180, 1188, 1202 |
| 4 · Migrations tested | **NOT APPLICABLE** — comment text only |
| 5 · Smoke test | ✅ syntax 27/27 · **code stripped of all comments is byte-identical to V493** (870,540 chars, sha256 `e7955d6e…`) |
| 6 · Rollback point confirmed | ✅ dry-run: restoring the backup reproduces V493 exactly, and matches `493.html` |
| 7 · Documentation updated | ✅ RELEASE_PROCESS · BACKUP_INDEX — same transaction |
| 8 · Baseline recorded | ✅ table at the top, same transaction |

**Reversibility proof:** removing the marker string from V494 returns V493 **byte for byte**. The
change is exactly 165 bytes and carries no semantics of its own.

**AMENDMENT-01 remains DRAFT / NUK ËSHTË NË FUQI** — 7 occurrences of the banner, all five markers
inside the draft block's measured bounds. Articles 1–82 are untouched, verified both by title and by
byte-comparison of the entire text preceding the draft block (42,062 chars identical).

### Release record — V495 (2026-08-31) — mobile "Save as Image" fidelity

**Four code changes, all in the export path. Reported symptom: the saved photo did not match the
PDF — the Terminal-1 title was off-centre, clipped, and the text was the wrong size. iPhone only.**

```
.terminal-title              left:50%;top:50%;transform:translate(-50%,-50%)  →  inset:0;margin:auto;
.tpl-neumorphic .terminal-title   same, with !important                      →  width/height:fit-content;
                                                                                transform:none
renderScale (mode 'image')   Math.floor + integer s--                        →  exact max scale under the cap
html-to-image preference     removed from the mobile non-neumorphic branch
```

#### 1–2 · The title: `transform` was the cause, not the layout

**Terminal 1 is the only terminal that centres its title with a transform.** Terminals 2–6 use
`position:static` + flex (`#section-skills .terminal-title, …` sets `position:static;transform:none`).
Percentages inside a `transform` are resolved by layout, and html2canvas resolves them against its own
measurement of the element — so the one element positioned that way lands wrong while the other five
are fine. Exactly the mechanism found in the slider's flag button a cycle earlier.

Replaced with the no-transform centring idiom: `inset:0; margin:auto; width:fit-content;
height:fit-content`. **Geometry verified identical in all four templates** — title centre 591 =
header centre 591, y 94.84, 264×33, before and after — with `transform:none`. Terminals 2–6
untouched (`static`, `transform none`).

#### 3 · Render scale: the cap was fine, the search was not

`config.scale` is 3 for both PDF and image. For images the code floored to an integer and decremented
to fit iOS's ~16.78 MP canvas cap (Neni 75a). **The cap is a real device limit and is untouched; the
defect was that integer-only search throws away everything between 2 and 1.** For a CV of
fullH = 3400 the largest scale that *fits* is 1.98, and the loop chose 1 — half the linear resolution
lost to rounding, not to the device. Since `1200 × 3 × fullH × 3 > 16 M` for any fullH above 1481 px,
**every real CV image was rendered coarser than its PDF**, which is what produced "wrong size" text.

Now the exact maximum is computed: `min(scale, √(AREA/(W·H)), DIM/W, DIM/H)`. Verified over 14 heights
from 1 000 to 15 000 px: **zero cap violations, no regression at any height**, typical gain ~2× linear
(~4× area) in the 3 300–5 000 px band where a real CV falls.

The `Math.max(1, …)` floor was **removed deliberately**: both the old loop and my own first version
kept it, and it broke the guarantee — above 8 192 px even scale 1 exceeds `IMG_MAX_DIM`, and a canvas
over the cap comes back **blank** on iOS. A softer image beats an empty one. The test found this;
the code review did not.

#### 4 · One rasteriser per platform branch

The mobile non-neumorphic branch preferred `html-to-image` for `mode:'image'` while the PDF used
`html2canvas` — the same document through two rasterisers. Neni 75(c) and the V442 comment forty lines
above both record `html-to-image` (foreignObject) as **broken on iOS Safari**, and its guard was
`catch(e){canvas=null}`, which only fires on a *thrown* exception — on iOS it returns a wrong canvas
without throwing, so the fallback never ran and a broken result passed as success. Removed; mobile now
has one rasteriser. **Desktop (`VERBATIM V440`) and the neumorphic branch are untouched** — verified:
`htmlToImage.toCanvas` 3 → 2, both remaining uses on the desktop path.

#### Corrections made during this investigation, recorded because they shaped it

- **The black language bars are not a defect.** `.tpl-neumorphic .language-level` sets a dark gradient
  by design and `[data-export="pdf"] body.tpl-neumorphic` repeats it, so the PDF has them too. They
  were nearly "fixed".
- **Change 4 was made before the template was known** and targets a branch the owner does not use. It
  is a genuine fix for that branch, shipped here, but it was not what the reported symptom needed.
- A post-change reading showed the transform still present; the cause was **browser cache**, not a
  failed edit. Confirmed with a cache-busting query.

```
pre-flight   index.html      ddce3d515a62e8d949cb3c8c35aa3a72   (asserted)
             495.html        must not already exist             (asserted)
backup       index.html.bak-pre-v495-20260831-013719 = ddce3d51  (verified BEFORE the copy)
gates        transform on .terminal-title = 0 · Math.floor(config.scale) = 0
             htmlToImage.toCanvas = 2 (desktop) · neumorphic branch present · desktop branch present
step 1       index-test.html -> 495.html
step 2       495.html -> index.html

after        index.html == index-test.html == 495.html == b30c2599
             SHA-256  429cbb9fc31644b9b4a0de2b9610545e0e9f707939393dbfb320d5475850d1fb
             494.html  ddce3d515a62e8d949cb3c8c35aa3a72   UNCHANGED
```

**Checklist:**

| Step | State |
|---|---|
| 1 · Artifacts identified by hash | ✅ |
| 2 · Backup created **and verified** | ✅ `index.html.bak-pre-v495-20260831-013719`, asserted before the copy |
| 3 · Delta-audit | ✅ **+7 / −13 lines of comment-free code**, −428 chars, measured with difflib |
| 4 · Migrations tested | **NOT APPLICABLE** — no persisted field touched |
| 5 · Smoke test on the promoted artifact | ✅ syntax 27/27 · console 0 · 8 contacts · iframe 180 553 · 5 globals · title centred 591=591 with `transform:none` in all four templates |
| 6 · Rollback point confirmed | ✅ dry-run: the backup reproduces V494 exactly and matches `494.html` |
| 7 · Documentation updated | ✅ RELEASE_PROCESS · BACKUP_INDEX — same transaction |
| 8 · Baseline recorded | ✅ table at the top, same transaction |

**Device gate (Neni 72.3):** confirmed by the owner on iPhone before promotion — the title is centred
and no longer clipped, and the text is sharp. That is the acceptance; the desktop measurements above
only establish that nothing else moved.

### Release record — V496 (2026-09-01) — VËRTETIM document: content, pagination, design isolation

**Three unrelated-looking changes that share one subject: the A4 document.**

#### 1 · Content — seven word-level edits to VËRTETIM PUNE

Owner-supplied text. `integritet të lartë profesional` → `integritet profesional` ·
`njohuri të avancuara` → `njohuri mesatare` · removed `aftësi të mira organizative` ·
removed `(centraleve elektrike)` · UPS bullet shortened · `dy vinçave industrialë` →
`Sistemit Elektrik` · `kompetenca të plota profesionale` → `kompetenca`.

Two things in the supplied text were **not** applied verbatim and were reported: two empty bullets
(would render as blank list markers) and a `,.` double punctuation left by a deletion.

> **Note recorded because it cost a round trip.** The A4 document persists in
> `localStorage['cv_a4_doc_html']`, which **overrides** the file. The text in the file is the
> *pristine default* the reset button restores. The owner initially saw no change because they had
> opened `495.html` — the release snapshot, taken before the edit — not because of persistence.

#### 2 · Pagination survived preview instead of being destroyed by it

One condition handled two unrelated cases:

```js
if(!a4-mode || preview-mode){ reset(p); return 0; }      →   if(!a4-mode){ reset(p); return 0; }
                                                             if(preview-mode) return 0;
```

`reset(p)` strips `data-a4push` / `data-a4frag`. Leaving a4-mode legitimately needs that; **entering
preview does not** — preview must show what the editor computed. Any `paginate()` call in preview
therefore erased every break. **Measured: pushes 1→0, frags 1→0, minHeight 2286px→1123px, height
2286→1933** — the two sheets collapsed into one, content flowed unbroken, and the export then captured
a document with no boundaries, so lines landed inside the dark inter-sheet gap. Both reported
symptoms, one line.

The owner's sentence *"faqet mu bashkuan bashke dhe u bene 1 e tere"* is what located it. Before that
the investigation was still asking which export path was at fault; the answer was neither.

**Stress-tested, 19 positions:** the Gjadër bullet was pushed down one spacer at a time from y=1049 to
y=1660, re-paginating each step. **Zero elements in any gap zone at every position**, pages never
merged, and the document grew from 2 sheets to 3 on its own when content crossed the boundary.
Leaving a4-mode still resets; returning re-paginates.

**Export fidelity confirmed:** reproducing `renderDocToCanvas` exactly (794 px offscreen clone) gave
41 elements live / 41 in clone, scrollHeight 2286 = 2286, pushes and frags preserved, and **0 geometry
differences** element by element. The export is the pages, not an approximation.

#### 3 · The A4 document is now isolated from every design — by contract

```css
.tpl-neumorphic.tpl-bw * { color: rgb(255,255,255) !important; }
```

The Black & White design uses a universal selector with `!important`. It painted **everything** white
including the A4 document — white text on a white sheet, so the document rendered blank. Of every rule
prefixed `.tpl-` or `.design-`, **exactly one** reached inside the A4, and this was it.

Fixed with a **declared isolation block** (7 rules) rather than by narrowing that selector, because
before it the page was white **by accident** — no template rule happened to target it. That is not a
guarantee: a fifth template would have broken it silently. The block makes the document declare and
defend its own palette. Specificity `#a4DocView .a4-page X` (1,2,1) beats `.tpl-neumorphic.tpl-bw *`
(0,2,0), so the isolation does not depend on source order. Values are read from the existing base
rules, so no other design changes appearance.

**Verified the isolation did not leak:** in `tpl-bw` the CV outside the A4 is still white
(title, contacts, iframe all `rgb(255,255,255)`) — Black & White still works as designed.

> **Instrument correction worth keeping.** An earlier measurement concluded the A4 was already
> design-independent across "all 16 combinations". It was wrong: the design cycle has **five** states,
> not four — `tpl-bw` is a modifier on `tpl-neumorphic`, and setting the four template classes by hand
> never produced it. The defect was found only by driving the real design button. Enumerating what you
> believe the set to be is not enumerating the set.

```
pre-flight   index.html   b30c25993f576f6fd1e7f12bb6e35824   (asserted)
             496.html     must not already exist             (asserted)
backup       index.html.bak-pre-v496-20260901-173224 = b30c2599  (verified BEFORE the copy)
gates        7 text edits present · preview skips without reset · a4-mode exit still resets
             7 isolation rules present · absent from V495
after        index.html == index-test.html == 496.html == d331a41d
             SHA-256  e8299c8d6a57d842d63414cf4d501bec903f6803a8fd830939d70d18a69b1768
             495.html  b30c25993f576f6fd1e7f12bb6e35824   UNCHANGED
```

**Checklist:**

| Step | State |
|---|---|
| 1 · Artifacts identified by hash | ✅ |
| 2 · Backup created **and verified** | ✅ `index.html.bak-pre-v496-20260901-173224`, asserted before the copy |
| 3 · Delta-audit | ✅ **+11 / −3 lines** of comment-free code, +285 chars |
| 4 · Migrations tested | **NOT APPLICABLE** — no persisted schema touched (`cv_a4_doc_html` unchanged in shape) |
| 5 · Smoke test on the promoted artifact | ✅ syntax 27/27 · console 0 · 8 contacts · iframe alive · title `transform:none` (V495 intact) · new text present · pagination survives `paginate()` in preview (1 push, 2286px) · `tpl-bw` A4 readable |
| 6 · Rollback point confirmed | ✅ dry-run: reproduces V495 exactly, matches `495.html` |
| 7 · Documentation updated | ✅ RELEASE_PROCESS · BACKUP_INDEX — same transaction |
| 8 · Baseline recorded | ✅ table at the top, same transaction |

### Release record — V497 (2026-09-02) — ONE pagination authority (Word-like)

**An architectural change, authorised under Neni 76.3 with the design presented first, executed as
three atomic steps each leaving the app green (Neni 66.3).**

#### The root cause, in constitutional terms

Pagination was implemented **three times** for one concept — a direct Neni 9 violation, with Neni 7's
single-authority rule broken alongside it:

| | mechanism | splits inside a bullet? |
|---|---|---|
| **Editor** | `paginate` → `flowLines` → `flowBlocks` → `applyPushes` | **yes** |
| **PDF** | its own inline loop in `renderDocToA4Pdf`, **0 calls** to `__a4Paginate`, strips the editor's pushes | **no** |
| **Photo** | `renderDocToCanvas` | **no pagination at all** |

**The consequence was not theoretical.** The editor splits mid-bullet; the PDF's loop never did. The
document on screen and the document downloaded were produced by *different rules* — they differed **by
construction**, not by a bug. That is what the owner reported: text stranded in the dark inter-sheet
gap of the downloaded file.

And the placement defect lived in **both copies**: `pTop` measured once outside the loop, plus an
`if(add>0)` guard. Every push shifts everything below it, so after the first push `cur` was measured
against a stale `pTop`; if the element had already passed its own target, `add` went negative, the
guard skipped it, and it stayed where it fell — inside the gap. Two copies of one bug is exactly what
parallel implementations produce.

#### Why Word does not have this problem

Word has one layout engine: content flows into a page box, and when the box fills a new one opens.
**Deciding and placing are the same act**, and every view — screen, print preview, PDF — uses that
engine, so they cannot disagree. Here the two were separate acts with geometry changing in between,
so the decision was stale before it was applied.

#### Step 1 — placement in a single pass

`applyPushes` now re-measures `pTop` for **every** element, so each placement is computed against the
real state after the previous one. **The `add>0` guard was removed deliberately**: a negative `add`
means the element has fallen below its own page top, and pulling it back to target is precisely the
right action, not the one to skip.

Verified over **31 configurations** (0–30 spacers pushing the Gjadër bullet from y=1049 to beyond
y=1660): **zero elements in any gap**, pages grew 2→3 on their own, line-split fragments survived.

#### Step 2 — the PDF calls the engine

The second copy of the algorithm is gone. `renderDocToA4Pdf` now calls `window.__a4PaginateRoot(clone,
{stripes:false})` — the editor's engine, exposed to run on any root instead of the hardcoded
`.a4-page` in `pageEl()`. **Constants were verified identical before merging**: `SHEET_H 1123 · GAP 40
· TOPOFF 63 · MARGIN 57 · CONTENT1 1003 · CONTENTN 1009`, so no geometry shifted.

Verified over **10 configurations**, 41 to 71 elements: page count identical screen-vs-PDF in every
case, **0 geometry differences element by element**, 0 elements in any gap.

#### Step 3 — the photo calls it too

`renderDocToCanvas` performed no pagination at all: it cloned the live page as-is. The result *happened*
to be right only because the clone shares the live page's 794 px width and the live page was already
paginated — **accidental, dependent on DOM state**, not guaranteed. Stripes are kept here (the photo
shows the document as sheets, unlike the PDF which slices them itself and wants white).

**Verified with a sabotage test**, which is the one that matters: pagination was stripped from the live
page before cloning — exactly what preview used to do — and across 3 configurations the photo still
produced **0 page mismatches and 0 geometry differences**. It no longer depends on the DOM's state.

```
pre-flight   index.html   d331a41d3d30ca00013bb70fc63bcc9a   (asserted)
             497.html     must not already exist             (asserted)
backup       index.html.bak-pre-v497-20260902-011839 = d331a41d  (verified BEFORE the copy)
gates        engine exposed · PDF calls it · photo calls it · PDF's own loop gone
             applyPushes has no add>0 guard · measures pTop inside the loop · absent from V496
after        index.html == index-test.html == 497.html == 53421f19
             SHA-256  9ab2dcf550277b739a7650a1c612bab35dc32fd0a4f23e0496878cab70f778c0
             496.html  d331a41d3d30ca00013bb70fc63bcc9a   UNCHANGED
```

**Checklist:**

| Step | State |
|---|---|
| 1 · Artifacts identified by hash | ✅ |
| 2 · Backup created **and verified** | ✅ `index.html.bak-pre-v497-20260902-011839`, asserted before the copy |
| 3 · Delta-audit | ✅ **+26 / −8 lines** of comment-free code, +47 chars |
| 4 · Migrations tested | **NOT APPLICABLE** — no persisted field touched |
| 5 · Smoke test on the promoted artifact | ✅ syntax 27/27 · console 0 across all three steps |
| 6 · Rollback point confirmed | ✅ dry-run: reproduces V496 exactly, matches `496.html` |
| 7 · Documentation updated | ✅ RELEASE_PROCESS · BACKUP_INDEX — same transaction |
| 8 · Baseline recorded | ✅ table at the top, same transaction |

> **Two earlier attempts on this symptom failed and are recorded because they shaped the outcome.**
> The first blamed `html-to-image` and fixed a branch the owner does not use. The second rewrote the
> PDF's inline loop into a single pass — structurally sound, but **11 test configurations showed the
> old loop never failing**, so the change was a robustness improvement with no demonstrated link to
> the symptom. Only reading the *editor's* engine revealed the same defect there, and only counting
> the implementations revealed why fixing any one of them could not work. **The fix was not found by
> reasoning about the mechanism; it was found by counting how many mechanisms there were.**

### Release record — V498 (2026-09-02) — "keep lines together" for list items

**One line of code.**

```js
var off =  findBreak(el, pTop+pageBottom);
var off = (el.tagName==='LI') ? null : findBreak(el, pTop+pageBottom);
```

**Requirement.** A list item must never be split across two sheets — if it does not fit whole, it
moves whole. In a formal work certificate a bullet cut mid-sentence reads badly, and the risk applies
to *any* bullet that happens to land on a boundary, not just the one reported.

**Why one line was enough.** `flowLines` already owns a "move the whole element to the next page"
branch — it runs whenever `findBreak` finds no split point. Suppressing the split attempt for `<li>`
makes the element fall into that existing branch. **No new path, no duplicated logic**; the guard
against an item taller than a page (`Math.abs(top-pageStart)<1`, which accepts it rather than looping)
was already there and needed nothing.

**Deliberate boundary.** Paragraphs (`.a4-doc-p`, `.a4-doc-line`) **still split**. They are flowing
prose, and moving a whole paragraph would leave half a sheet empty. Word behaves the same way: "Keep
lines together" is a per-paragraph option there, not a blanket rule.

**Verified over 25 configurations** (0–24 spacers): **0 list items split · 0 elements in any gap · a
paragraph did split at n=16**, which is the evidence that the change is scoped to `<li>` and did not
disable splitting generally. 25 re-paginations in 38 ms.

**Effect on the reported case:** the Gjadër bullet was split `1049–1070` (sheet 1) + `1214–1255`
(sheet 2). It is now a single element at `1214–1275`, entirely on sheet 2.

```
pre-flight   index.html   53421f190eb344269d67a1b0664e13f4   (asserted)
             498.html     must not already exist             (asserted)
backup       index.html.bak-pre-v498-20260902-012633 = 53421f19  (verified BEFORE the copy)
after        index.html == index-test.html == 498.html == ad23162d
             SHA-256  ddf271edb246a7a966523c977125f6753e881809bd0bd09daaa1c6246f93afe6
             497.html  53421f190eb344269d67a1b0664e13f4   UNCHANGED
```

| Step | State |
|---|---|
| 1 · Artifacts identified by hash | ✅ |
| 2 · Backup created **and verified** | ✅ asserted before the copy |
| 3 · Delta-audit | ✅ **+1 / −1 line** |
| 4 · Migrations tested | **NOT APPLICABLE** |
| 5 · Smoke test | ✅ syntax 27/27 · console 0 · `paginate()` 0.9 ms |
| 6 · Rollback point confirmed | ✅ dry-run: reproduces V497 exactly, matches `497.html` |
| 7 · Documentation updated | ✅ same transaction |
| 8 · Baseline recorded | ✅ same transaction |

> This is what V497 bought. With three parallel engines, this rule would have had to be written three
> times — or, more likely, written once and silently absent from the other two, which is exactly how
> the screen and the download came to disagree in the first place.

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

### Release record — V487 (2026-08-16) — ADR-031, the ContactElement dimension contract

> **Promoted and verified per this process. No blocker was found during the verification performed.
> The rollback point is verified and available. BUG-017 remains MITIGATED, not resolved: this release
> does not claim to touch it, and the pre-promotion GPU baseline was recorded in `BUGS.md` precisely
> so that it cannot be silently credited later.**

Scope — one architectural change, deliberately alone. `dimensionOwner` becomes an explicit,
kind-derived declaration that every ContactElement is born with, enforcement refuses an undeclared
one, and the vertical size paths read the declaration instead of a CSS class.

| Change | Verification |
|---|---|
| Ownership declared by **kind**, never by instance id | 4 kinds × 6 call sites; the drop path translates the spawn vocabulary once |
| Enforcement: an undeclared kind throws | negative control — `THREW, no leakage` into registry or DOM |
| Vertical size paths read the declaration | 3 identity tests → 1 read; the horizontal width clamp deliberately untouched |
| Contract has an observable consequence | content-owned 113→341→113 px; layout-owned fixed at 58 px under long text |

Gate results on the **promoted** artifact: build reports **V487** · loads · iframe alive · 8 contact
items · registry 8/8 valid (7 `layout` + 1 `content`) · save→reload round-trip **content-identical**
(16,088 b both sides, only the save timestamp advances) · `CVStableIdMigration.verify()` **ok** ·
`CVSecurity` **4/4 PASS** · **0 console errors** · mirror invariant `md5 index.html index-test.html
487.html | sort -u | wc -l` = **1**.

**Checklist:**

| Step | State |
|---|---|
| 1 · Artifacts identified by hash | ✅ |
| 2 · Backup created **and verified** | ✅ `index.html.bak-v486-baseline`, assertion executed before the copy |
| 3 · Delta-audit | ✅ **4 hunks, all ADR-031, zero unrelated changes** (character-level, not line-level) |
| 4 · Migrations tested | **NOT APPLICABLE** — `dimensionOwner` is never serialized; verified absent from the saved state |
| 5 · Smoke test on the promoted artifact | ✅ above |
| 6 · Rollback point confirmed | ✅ `cp "index.html.bak-v486-baseline" "index.html"` |
| 7 · Documentation updated | ✅ ADR · BUGS · BACKUP_INDEX · this file |
| 8 · Baseline recorded | ✅ table at the top, same transaction |

**Step 4 is `NOT APPLICABLE`, never `PASS`.** Nothing was migrated, so nothing was migration-tested;
writing PASS there would claim a test that was never run.

**Two corrections this cycle made to its own claims — both kept:**

1. The step-1 implementation keyed the contract on the six default contact ids and *passed its own
   gate 8/8*. It was still wrong: a user-added contact has a generated id and no `type`, so the owner
   came out `undefined`. The gate was not at fault — it measured the population that existed. **A
   contract derived from the instances present is a transcription, and it cannot ever disagree with
   the implementation, which is the property that would have made it worth having.**
2. A second defect was reported from the same reading — that `calculateDefaultLayout()` would break a
   fresh install — and was **false**: its consumers merge positions only. Both defects were found by
   reading and reading could not tell them apart. A browser could, in a minute.

**On the byte count in this record:** the pre-promotion draft of this section stated 1,153,081 bytes.
The artifact is **1,153,063**. Corrected here rather than left to be discovered — a wrong number in a
baseline table is the same defect class as the stale restore commands this file already documents.

### Release record — V484 (2026-07-29)

> **Promoted and verified per this process. No blocker was found during the verification performed.
> The rollback point is verified and available. BUG-017 remains OPEN: this release carries its
> suspected fix, but a fix under observation is not a closed defect.**

Why it shipped quickly: **V483 was actively defective in daily use.** It doubled the number of blurred
shadow layers in Design 4 (59 → 125), which made scrolling heavy and dropped whole frames — the
"black mirror" the user reported. Leaving that in production while "observing" would have meant the
user paying the cost every day.

| Change | Verification |
|---|---|
| Paint load returned below the V482u baseline (BUG-017 suspected fix) | Design 4: **57 elements / blur 328** vs V482u 59/340, V483 125/736 |
| One «+» per skill window, always on the last row | 1/1/1 per category; lifecycle add → move → empty → re-add all measured |
| Rows added by «+» are typable | empty label 0px → 148px; text persists as `{de,en,sq}` |
| `CVBlackout` symptom detector (dormant observer) | present; 0 false positives; refuses to judge a degenerate viewport |

Gate results on the promoted artifact: build reports **V484** · renders (7 outer + 5 iframe terminals,
16 contact items) · editor **96/96** → preview **0/96** → editor **96/96** · strip/in-content opacity
parity intact (1 / 1 / 0.32) · **0 console errors**.

**Two corrections this cycle made to its own earlier claims — both worth keeping:**
1. BUG-017 was recorded as `Regression: No` on a byte-comparison of the drag code. That comparison was
   correct and the conclusion was not: the cause lived on a different axis (paint cost), where V483
   changed a great deal. *Choosing what to compare is itself a hypothesis.*
2. The first fix attempt reduced blur radius 6px → 2px. The symptom returned, which falsified
   "cost scales with blur size" and left "cost scales with the number of blurred layers". The failed
   attempt is what identified the real variable.

### Release record — V483 (2026-07-29)

> **Release V483 has been promoted and verified according to this process. No blocker was found
> during that verification. The rollback point is verified and available. One open defect (BUG-017)
> ships with the release: it was measured byte-for-byte to be present in V482u as well and is not a
> regression, and it is tracked separately in `BUGS.md`.**

Scope — a stabilising, UI-only release. No change to the domain model, persistence, or the
qualification apparatus.

| Change | Verification |
|---|---|
| Editor controls always visible; Terminal 1 is the reference intensity | strip 19 @ opacity 1 (= T1's 5) · in-content 59 @ 0.32 (= T1's) |
| All editor controls carry the Design-4 neumorphic token set | 65/65 conform to `.add-contact-btn`; 0 dark controls remain |
| Preview no longer leaks any control | editor 92/92 → preview **0/92** → editor 92/92 |
| Export hides the 6 controls **semantically** | 0/125 survive the ExportTheme rules; `display:none`, not `opacity:0` |
| Qualifikationen `−`/`+` joined the class contract | rest 0.32 → hover 1 → rest 0.32 (was: rest 0, hover-only) |
| `CVDragTrace` diagnostic (BUG-017) | pure observer, passive listeners, 0 rows at load, 0 console noise |

Gate results on the promoted artifact: build reports **V483** · renders (7 outer + 5 iframe
terminals, 16 contact items) · save→reload round-trip **content-identical** (`7ced5484`, only the
save `timestamp` advances) · **0 console errors** · PDF export confirmed clean by the user on the
release candidate.

**Two measured findings worth carrying forward, both recorded in ADR-031/032:** the export hide rules
had *never* worked for six controls — they were masked by `opacity:0`/`visibility:hidden`, which the
always-visible change removed; and a first fix that weakened the reveal rule (`!important` removal)
broke the editor, because three of those controls carry `display:none` inline. The hiding rule must
win; the revealing rule must not be weakened.

### Release record — V482u (2026-07-24)

> **Release V482u has been promoted and verified according to the documented release process. No
> blocker was found during that verification. The rollback point remains available. The only work
> planned outside the release is maintenance (backup cleanup) and ADR-029, which stays frozen until a
> dedicated architectural session.**

| Area | Status |
|---|---|
| Release V482u | ✅ promoted |
| Rollback | ✅ verified |
| Runtime | ✅ verified *in the reported tests* |
| Persistence | ✅ verified *in the scenarios tested* |
| Quick Look | ✅ verified on a real device |
| Qualification gates | ✅ PASS *on the gates executed* |
| Maintenance | 🟡 backup cleanup planned |
| ADR-029 | 🔒 deliberately frozen |

**How to word a release conclusion (rule, not style):** write *"no blocker was found during the
verification performed"*, never *"the project is sound"*. And *"verified at every gate"* means **the
gates defined in this document**, not every possible path through the application. Tests support what
was proven; they cannot support the absence of defects. Scoping the claim to what was measured is the
same discipline that governs the audit itself — see the two habits below.

---

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
