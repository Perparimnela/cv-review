# Backup index — what is kept, and why
Generated 2026-07-30, at the V483 backup consolidation. **Hashes below were computed from the files
themselves, not transcribed** — verify with `md5 -q <file>`.

The retention rule is **not** "keep the N newest". It is: *keep what is unique in the
architectural sense.* Those differ — the audit that produced this list found a pilot
implementation surviving in only one backup, which a newest-N rule would have deleted.

41 backups were removed at this consolidation, after verifying that none of them carried a
global or an ADR reference absent from V483 or from the set below. What that check does **not**
claim: most were byte-unique intermediate states, so the step-by-step history of individual
edits is gone. Every capability and every decision the project holds today is not.

---

## Manifest — what the folder holds now (2026-09-30)

> A lean inventory, added after the external review (point 8). It is generated from the files themselves and their hashes. The narrative sections below remain the forensic history; this table is the operational list. Roles: **production** (live), **sandbox** (work in progress), **release snapshot** (immutable, Neni 6.5), **rollback** (production backup taken before a promotion, immutable), **sandbox iteration** (may be cleared by the owner, Neni 6.5).

| File | Holds | md5 | Role |
|---|---|---|---|
| `index.html` | V550 | `792082b8` | production |
| `index-test.html` | V550 | `792082b8` | sandbox |
| `486.html` | V486 | `b2c238c6` | release snapshot |
| `487.html` | V487 | `d0962600` | release snapshot |
| `488.html` | V488 | `deaeb3b1` | release snapshot |
| `489.html` | V489 | `acfe9627` | release snapshot |
| `490.html` | V490 | `b4143279` | release snapshot |
| `491.html` | V491 | `a71de5fa` | release snapshot |
| `492.html` | V492 | `56b0c307` | release snapshot |
| `493.html` | V493 | `e8f9c29d` | release snapshot |
| `494.html` | V494 | `ddce3d51` | release snapshot |
| `495.html` | V495 | `b30c2599` | release snapshot |
| `496.html` | V496 | `d331a41d` | release snapshot |
| `497.html` | V497 | `53421f19` | release snapshot |
| `498.html` | V498 | `ad23162d` | release snapshot |
| `501.html` | V501 | `5267701c` | release snapshot |
| `504.html` | V504 | `57c9dd4f` | snapshot of the pre-V507 series (release status not documented; kept) |
| `505.html` | V505 | `43b865d1` | snapshot of the pre-V507 series (release status not documented; kept) |
| `506.html` | V506 | `e19b4850` | snapshot of the pre-V507 series (release status not documented; kept) |
| `507.html` | V507 | `ac22bc52` | release snapshot |
| `509.html` | V509 | `660bc50b` | release snapshot |
| `520.html` | V520 | `d02b3b39` | release snapshot |
| `529.html` | V529 | `924e655c` | release snapshot |
| `531.html` | V531 | `c418ef74` | release snapshot |
| `537.html` | V537 | `d2b8a938` | release snapshot |
| `538.html` | V538 | `c68ab10f` | sandbox iteration |
| `539.html` | V539 | `aad7bd69` | sandbox iteration |
| `540.html` | V540 | `c070fc34` | sandbox iteration |
| `541.html` | V541 | `ce767087` | sandbox iteration |
| `542.html` | V542 | `929e8b2c` | release snapshot |
| `543.html` | V543 | `aca3eb6b` | sandbox iteration |
| `544.html` | V544 | `e4605753` | sandbox iteration |
| `545.html` | V545 | `841494e6` | sandbox iteration |
| `546.html` | V546 | `e3a635da` | release snapshot |
| `547.html` | V547 | `5b1ffa7e` | sandbox iteration |
| `548.html` | V548 | `ba88f1ef` | release snapshot |
| `549.html` | V549 | `6e4221c7` | sandbox iteration |
| `550.html` | V550 | `792082b8` | release snapshot |
| `index.html.bak-pre-v482u` | V479 | `27e9d4cc` | rollback |
| `index.html.bak-pre-v483` | V482u | `01f22f35` | rollback |
| `index.html.bak-pre-v493-20260829-014817` | V492 | `56b0c307` | rollback |
| `index.html.bak-pre-v494-20260829-020510` | V493 | `e8f9c29d` | rollback |
| `index.html.bak-pre-v495-20260831-013719` | V494 | `ddce3d51` | rollback |
| `index.html.bak-pre-v496-20260901-173224` | V495 | `b30c2599` | rollback |
| `index.html.bak-pre-v497-20260902-011839` | V496 | `d331a41d` | rollback |
| `index.html.bak-pre-v498-20260902-012633` | V497 | `53421f19` | rollback |
| `index.html.bak-pre-v501-20260902-115235` | V498 | `ad23162d` | rollback |
| `index.html.bak-pre-v507-20260911-000426` | V501 | `5267701c` | rollback |
| `index.html.bak-pre-v509-20260911-001420` | V507 | `ac22bc52` | rollback |
| `index.html.bak-pre-v520-20260927-172538` | V509 | `660bc50b` | rollback |
| `index.html.bak-pre-v529-20260928-151109` | V520 | `d02b3b39` | rollback |
| `index.html.bak-pre-v531-20260929-142927` | V529 | `924e655c` | rollback |
| `index.html.bak-pre-v537-20260929-151453` | V531 | `c418ef74` | rollback |
| `index.html.bak-pre-v542-20260929-171732` | V537 | `d2b8a938` | rollback |
| `index.html.bak-pre-v546-20260930-113924` | V542 | `929e8b2c` | rollback |
| `index.html.bak-pre-v548-20260930-144638` | V546 | `e3a635da` | rollback |
| `index.html.bak-pre-v550-20260930-152856` | V548 | `ba88f1ef` | rollback — **operational** (one release back) |
| `index.html.bak-v483-baseline` | V483 | `b2ece1ae` | rollback |
| `index.html.bak-v484-baseline` | V484 | `6fc7d00a` | rollback |
| `index.html.bak-v485-baseline` | V485 | `99e0f10d` | rollback |
| `index-test.html.bak-pre-pilot-retire` | pilot implementation (see its section) | `a0aa5484` | unique — kept |
| `index-test.html.bak-pre-v538-20260929-164057` | V537 | `d2b8a938` | sandbox iteration |
| `index-test.html.bak-pre-v539-20260929-164153` | V538 | `c68ab10f` | sandbox iteration |
| `index-test.html.bak-pre-v540-20260929-164355` | V539 | `aad7bd69` | sandbox iteration |
| `index-test.html.bak-pre-v541-20260929-164758` | V540 | `c070fc34` | sandbox iteration |
| `index-test.html.bak-pre-v542-20260929-171732` | V541 | `ce767087` | sandbox iteration |
| `index-test.html.bak-pre-v543-20260930-005650` | V542 | `929e8b2c` | sandbox iteration |
| `index-test.html.bak-pre-v544-20260930-010634` | V543 | `aca3eb6b` | sandbox iteration |
| `index-test.html.bak-pre-v545-20260930-113321` | V544 | `e4605753` | sandbox iteration |
| `index-test.html.bak-pre-v546-20260930-113924` | V545 | `841494e6` | sandbox iteration |
| `index-test.html.bak-pre-v547-20260930-134747` | V546 | `e3a635da` | sandbox iteration |
| `index-test.html.bak-pre-v548-20260930-144638` | V547 | `5b1ffa7e` | sandbox iteration |
| `index-test.html.bak-pre-v549-20260930-150739` | V548 | `ba88f1ef` | sandbox iteration |
| `index-test.html.bak-pre-v550-20260930-152856` | V549 | `6e4221c7` | sandbox iteration |

36 snapshots, 22 production backups, 14 sandbox backups. Verify any row with `md5 -q <file>`.

---

> **Sandbox deviation (named, 2026-09-30, after V548) — CLOSED the same day by the V550 promotion:**
> `index-test.html` = `index.html` = `550.html` = V550 (`792082b8…`). The sandbox had run ahead as V549.
> Sandbox backups: `index-test.html.bak-pre-v549-20260930-150739` (= V548) and `index-test.html.bak-pre-v550-20260930-152856` (= V549).
> The details are in `RELEASE_PROCESS.md` → *Release record — V550*.

> **Sandbox deviation (named, 2026-09-30, after V546) — CLOSED the same day by the V548 promotion:**
> `index-test.html` = `index.html` = `548.html` = V548 (`ba88f1ef…`). The sandbox had run ahead as V547.
> Sandbox backups: `index-test.html.bak-pre-v547-20260930-134747` (= V546) and `index-test.html.bak-pre-v548-20260930-144638` (= V547).
> The details are in `RELEASE_PROCESS.md` → *Release record — V548*.

> **Sandbox deviation (named, 2026-09-30, after V542) — CLOSED the same day by the V546 promotion:**
> `index-test.html` = `index.html` = `546.html` = V546 (`e3a635da…`). The sandbox had run ahead as V543–V545.
> Sandbox backups: `index-test.html.bak-pre-v543-20260930-005650` (= V542), `index-test.html.bak-pre-v544-20260930-010634` (= V543),
> `index-test.html.bak-pre-v545-20260930-113321` (= V544) and `index-test.html.bak-pre-v546-20260930-113924` (= V545).
> The details are in `RELEASE_PROCESS.md` → *Release record — V546*.

> **Sandbox deviation (named, 2026-09-29, after V537) — CLOSED the same day by the V542 promotion:**
> `index-test.html` = `index.html` = `542.html` = V542 (`929e8b2c…`). The sandbox had run ahead as V538–V541.
> Sandbox backups: `index-test.html.bak-pre-v538-20260929-164057` … `index-test.html.bak-pre-v541-20260929-164758`, and
> `index-test.html.bak-pre-v542-20260929-171732` (= V541). The details are in `RELEASE_PROCESS.md` → *Release record — V542*.

> **Cleanup (2026-09-29, on the owner's instruction, Neni 6.5) — 146 files, 148 MB moved to the macOS Trash.**
> The folder went from 195 MB to 53 MB. Neni 6.5 lets the owner clear working copies and sandbox iterations.
> The promoted artefacts it protects were left untouched:
> - every production backup (`index.html.bak*`, 18 files);
> - the snapshots of the production era: `486`–`498`, `501`, `504`–`507`, `509`, `520`, `529`, `531`, `537`.
>
> Before we moved anything, we checked that every moved file was tracked in git and identical to the committed version. The move went through Finder, so nothing was permanently deleted. What was moved:
> - **89 sandbox backups** `index-test.html.bak-*`. Only `index-test.html.bak-pre-pilot-retire` was kept, because this file records it as unique.
> - **24 sandbox snapshots** of versions that were never promoted themselves: `510`–`519`, `521`–`528`, `530` and `532`–`536`. Their accepted changes are all inside V537 (verified by a code trace per version). The withdrawn V514, V516 and V522 are recorded in `RELEASE_PROCESS.md`.
> - **29 document backups** `*.md.bak-*`.
> - **4 old working copies:** `index copyS.html`, `_KONTROLL-pre-v499.html`, `draft-marker-test.html` and `index-test` (no extension).
>
> The sandbox backups and snapshots named in the deviation notes and release records below for V510–V536 are therefore no longer in the folder.
>
> **Purged from git as well (2026-09-29, at the owner's explicit request: "nuk i dua ne git").**
> - The history was rewritten with `git filter-branch`, and every one of these files was removed from all commits. So were the four folders below and the three earlier diagnostic copies `diag-app-probe.html`, `diag-resize.html` and `diag-tel-ios.html`.
> - GitHub was then force-pushed.
> - The current tree is bit-identical before and after: tree `305bbdc4`.
> - `git fsck --full` is clean.
> - The kept artefacts (production backups, production-era snapshots, live files) still restore from git with their recorded hashes.
> - The repository went from 50 MB to under 1 MB, because identical HTML versions compress to deltas.
>
> **The purged files now exist only in the macOS Trash.** Emptying the Trash removes them for good. Commit hashes quoted in this file before 2026-09-29 refer to the old history and are no longer valid.
>
> **Addendum, the same day:** at the owner's word four folders that are not part of the app also went to the Trash:
> - `hyper/`: a separate Node.js project, 102 files;
> - `Glowing Dropdown Using HTML, CSS, and JavaScript - ByteWebster/`: a 2023 tutorial;
> - `.continue/` (one tool config file) and `.remember/` (empty): folders left by other tools.
>
> All four were purged from git with the files above, and exist only in the Trash.

> **Sandbox deviation (named, 2026-09-29) — CLOSED on 2026-09-29 by the V537 promotion:** `index-test.html` = `index.html` = `537.html` = V537 (`d2b8a938…`); the sandbox had run ahead as V536 (`4e1e3c0a…`),
> while production was V531 (`c418ef74…`). Pre-edit sandbox backups:
> - `index-test.html.bak-pre-v532-20260929-143612` (= V531, `c418ef74…`)
> - `index-test.html.bak-pre-v533-20260929-144107` (= V532, `9af11835…`)
> - `index-test.html.bak-pre-v534-20260929-144844` (= V533, `46323178…`)
> - `index-test.html.bak-pre-v535-20260929-145412` (= V534, `6f1b3176…`)
> - `index-test.html.bak-pre-v536-20260929-150111` (= V535, `7ef8ff9a…`)
> - `index-test.html.bak-pre-v537-20260929-151453` (= V536, `4e1e3c0a…`)
>
> Details are in `RELEASE_PROCESS.md` → *Sandbox ahead of production — V532–V536*. Details are also in *Release record — V537*.

> **Sandbox deviation (named, 2026-09-28) — CLOSED on 2026-09-29 by the V531 promotion:**
> `index-test.html` = `index.html` = `531.html` = V531 (`c418ef74…`). The sandbox had run ahead as V530
> (`afc15072…`) while production was V529 (`924e655c…`). Sandbox backups:
> - `index-test.html.bak-pre-v530-20260928-155148` (= V529, `924e655c…`)
> - `index-test.html.bak-pre-v531-20260929-142927` (= V530, `afc15072…`)
>
> Details are in `RELEASE_PROCESS.md` → *Sandbox ahead of production — V530* and *Release record — V531*.

> **Sandbox deviation (named, 2026-09-27) — CLOSED on 2026-09-28 by the V529 promotion:**
> `index-test.html` = `index.html` = `529.html` = V529 (`924e655c…`). The sandbox had run ahead as V528
> (`dd3524ee…`). V522 was withdrawn and rolled back on 2026-09-28, so V523 builds on V521 and V524–V528
> build on V523. Production was V520 (`d02b3b39…`) throughout. Sandbox backups, each hash-checked against
> the version before it:
> - `index-test.html.bak-pre-v521-20260927-173435` (= V520, `d02b3b39…`)
> - `index-test.html.bak-pre-v522-20260928-133334` (= V521, `5b415f6a…`)
> - `index-test.html.bak-pre-v523-20260928-141210` (= V521, `5b415f6a…`)
> - `index-test.html.bak-pre-v524-20260928-143459` (= V523, `8eca0b10…`)
> - `index-test.html.bak-pre-v525-20260928-143837` (= V524, `b11fae12…`)
> - `index-test.html.bak-pre-v526-20260928-144045` (= V525, `bed98df5…`)
> - `index-test.html.bak-pre-v527-20260928-144303` (= V526, `04647721…`)
> - `index-test.html.bak-pre-v528-20260928-144500` (= V527, `9d6e612f…`)
> - `index-test.html.bak-pre-v529-20260928-151109` (= V528, `dd3524ee…`)
>
> Details are in `RELEASE_PROCESS.md` → *Sandbox ahead of production — V521, V523–V528* and
> *Release record — V529*. Production was not touched until the promotion, and its rollback entry follows.

> **Sandbox deviation (named, 2026-09-22, extended 2026-09-27) — CLOSED on 2026-09-27 by the V520
> promotion:** `index-test.html` = `index.html` = `520.html` = V520 (`d02b3b39…`). The sandbox backups
> below stay as the step-by-step history of the series. Production itself was not touched, so its rollback
> entry below is unchanged. Details are in `RELEASE_PROCESS.md` → *Sandbox ahead of production — V510,
> V511*.
>
> | Sandbox backup | Holds | md5 |
> |---|---|---|
> | `index-test.html.bak-pre-v510-20260922-013831` | V509 (= `509.html`, = production) | `660bc50b…` |
> | `index-test.html.bak-pre-v511-20260922-014352` | V510 (= `510.html`). The sandbox was also restored from it once, after the rejected first V511 attempt. | `3b52e561…` |
> | `index-test.html.bak-pre-v512-20260927-000658` | V511 (= `511.html`) | `eeaea757…` |
> | `index-test.html.bak-pre-v513-20260927-001506` | V512 (= `512.html`) | `00adbe5e…` |
> | `index-test.html.bak-pre-v514-20260927-002552` | V513 (= `513.html`) | `3e3497ae…` |
> | `index-test.html.bak-pre-v515-20260927-005905` | V514 (= `514.html`) | `10feb135…` |
> | `index-test.html.bak-pre-v516-20260927-010040` | V515 (= `515.html`) | `40053948…` |
> | `index-test.html.bak-pre-v517-20260927-011716` | V516 (= `516.html`) | `3a0aa4a5…` |
> | `index-test.html.bak-pre-v518-20260927-162722` | V517 (= `517.html`) | `1c254fef…` |
> | `index-test.html.bak-pre-v519-20260927-164542` | V518 (= `518.html`) | `8c55cd79…` |

## `index.html.bak-pre-v550-20260930-152856`

| | |
|---|---|
| **Version** | V548 |
| **Hash (md5)** | `ba88f1ef186a52993719834109cdfa8a` |
| **Size** | 1,319,906 bytes |

**Purpose.** **The operational rollback for V550**, promoted 2026-09-30. Hash-verified against the outgoing `index.html`
immediately before the copy, and again after. It is the last production artifact whose A4 certificate PDF is images
only. Its CV and letter PDFs already carry the text layer.

Byte-identical to `548.html`.

```bash
cp "index.html.bak-pre-v550-20260930-152856" "index.html"
```

## `index.html.bak-pre-v548-20260930-144638`

| | |
|---|---|
| **Version** | V546 |
| **Hash (md5)** | `e3a635dac72932243c1c9cb3a9200071` |
| **Size** | 1,311,399 bytes |

**Purpose.** **The rollback for V548**, promoted 2026-09-30 (two releases back since V550). Hash-verified against the outgoing `index.html`
immediately before the copy, and again after. It is the last production artifact whose CV and letter PDFs are images
only, with 0 extractable characters: not readable by an ATS, and with no way to copy or search the text.

Byte-identical to `546.html`.

```bash
cp "index.html.bak-pre-v548-20260930-144638" "index.html"
```

## `index.html.bak-pre-v546-20260930-113924`

| | |
|---|---|
| **Version** | V542 |
| **Hash (md5)** | `929e8b2c48fece0eaae6b94dd27843a8` |
| **Size** | 1,309,320 bytes |

**Purpose.** **The rollback for V546**, promoted 2026-09-30 (two releases back since V548). Hash-verified against the outgoing `index.html`
immediately before the copy, and again after. It is the last production artifact in which:
- a notification visible at the moment of export (or an earlier image overlay) is baked into the image or PDF;
- the PDF properties carry no build or date;
- the hidden notification box leaves a 7 px sliver at the right edge of the screen.

Byte-identical to `542.html`.

```bash
cp "index.html.bak-pre-v546-20260930-113924" "index.html"
```

## `index.html.bak-pre-v542-20260929-171732`

| | |
|---|---|
| **Version** | V537 |
| **Hash (md5)** | `d2b8a938d07fed51fafbb7cfc7056407` |
| **Size** | 1,307,116 bytes |

**Purpose.** **The rollback for V542**, promoted 2026-09-29 (two releases back since V546). Hash-verified against the outgoing `index.html`
immediately before the copy, and again after. It is the last production artifact in which:
- the boot curtain carries an `!important`;
- the notification element holds static text;
- the curtain is lifted by the browser's `load` event rather than by the application;
- the 20 s safety can fire in the middle of a slow download.

Byte-identical to `537.html`.

```bash
cp "index.html.bak-pre-v542-20260929-171732" "index.html"
```

## `index.html.bak-pre-v537-20260929-151453`

| | |
|---|---|
| **Version** | V531 |
| **Hash (md5)** | `c418ef742351001fc5dbe5ef0883d6dd` |
| **Size** | 1,296,038 bytes |

**Purpose.** **The operational rollback for V537**, promoted 2026-09-29. Hash-verified against the
outgoing `index.html` immediately before the copy, and again after. It is the last production artifact in which:
- `window.Utils` is undefined (silent photo-toolbar and PDF-failure notifications);
- the export sheet is fixed in English;
- phones paint in the phone layout while loading;
- Reset Default switches the language back to German;
- the page appears piece by piece.

Byte-identical to `531.html`.

```bash
cp "index.html.bak-pre-v537-20260929-151453" "index.html"
```

## `index.html.bak-pre-v531-20260929-142927`

| | |
|---|---|
| **Version** | V529 |
| **Hash (md5)** | `924e655c1b7caaad149d46ed6a797798` |
| **Size** | 1,286,168 bytes |

**Purpose.** **The operational rollback for V531**, promoted 2026-09-29. Hash-verified against the
outgoing `index.html` immediately before the copy, and again after. It is the last production artifact
whose notifications are hard-coded in a mix of Albanian, German and English, regardless of the flag.
Byte-identical to `529.html`.

```bash
cp "index.html.bak-pre-v531-20260929-142927" "index.html"
```

## `index.html.bak-pre-v529-20260928-151109`

| | |
|---|---|
| **Version** | V520 |
| **Hash (md5)** | `d02b3b39bc05a232741c146c98f3d5aa` |
| **Size** | 1,280,308 bytes |

**Purpose.** **The operational rollback for V529**, promoted 2026-09-28. Hash-verified against the
outgoing `index.html` immediately before the copy, and again after.

It is the last production artifact before the series V521–V528:
- the mobile PDF renders a 32.3 MP canvas, twice the iOS cap;
- Terminal 1's title shifts left in the Neumorphic export;
- the CDN libraries load without integrity checks, one after another;
- the ghost `#pdfExportModal` is still present;
- the file holds a raw NUL byte;
- mobile detection exists twice.

Byte-identical to `520.html`.

```bash
cp "index.html.bak-pre-v529-20260928-151109" "index.html"
```

## `index.html.bak-pre-v520-20260927-172538`

| | |
|---|---|
| **Version** | V509 |
| **Hash (md5)** | `660bc50b050c0145b15fbb9122a94b94` |
| **Size** | 1,267,059 bytes |

**Purpose.** **The operational rollback for V520**, promoted 2026-09-27. Hash-verified against the
outgoing `index.html` immediately before the copy, and again after.

It is the last production artifact before the mobile-export series V510–V519: in it the share path
is gated on platform rather than capability, a package can be published incomplete, two preparations
can race, Terminal 1's title relies on `margin:auto` (which iOS does not resolve), and the export
leaves contact links blue on iOS. Byte-identical to `509.html`.

```bash
cp "index.html.bak-pre-v520-20260927-172538" "index.html"
```

## `index.html.bak-pre-v509-20260911-001420`

| | |
|---|---|
| **Version** | V507 |
| **Hash (md5)** | `ac22bc52592fe189240f46acc3d9bb5d` |
| **Size** | 1,265,541 bytes |

**Purpose.** **The operational rollback for V509**, promoted 2026-09-11. Hash-verified against the
outgoing `index.html` before the promotion and again immediately before the copy.

It is the last production artifact in which a stalled library download leaves every export pending
forever, and whose `CV.build` still reads `V487+adr035`. Byte-identical to `507.html`.

```bash
cp "index.html.bak-pre-v509-20260911-001420" "index.html"
```

> **Sandbox deviation (named, 2026-09-11) — CLOSED the same day by the V509 promotion:** `index-test.html` = `509.html` = V509 (`660bc50b…`),
> production = V507. Pre-edit sandbox state: `index-test.html.bak-pre-v509-20260911-000500`
> (`ac22bc52…`, byte-identical to `507.html`). `index-test.html.bak-with-v508-004836` holds the
> **withdrawn** V508 and is not a rollback target for anything.

## `index.html.bak-pre-v507-20260911-000426`

| | |
|---|---|
| **Version** | V501 |
| **Hash (md5)** | `5267701c9c45cdeee3c432172f254862` |
| **Size** | 1,256,028 bytes |

**Purpose.** **The operational rollback for V507**, promoted 2026-09-11. Hash-verified against the
outgoing `index.html` before the promotion; the hash above was read from the created backup.

It is the last production artifact without the V502–V507 mobile chain: restoring it reinstates iOS
text inflation on A4 sheets, the 16 s block on opening the share sheet, editable content in preview,
and the share preparation that can hang when the screen locks.

```bash
cp "index.html.bak-pre-v507-20260911-000426" "index.html"
```

## `index.html.bak-pre-v501-20260902-115235`

| | |
|---|---|
| **Version** | V498 |
| **Hash (md5)** | `ad23162df6eef14bc65675d99cdff255` |
| **Size** | 1,250,434 bytes |

**Purpose.** **The operational rollback for V501**, promoted 2026-09-02. Hash-verified against the
outgoing `index.html` before the promotion — the hash above was read from the created backup, not
copied from the baseline table.

It is the last artifact in which the CV export renders the A4 document whenever `a4-mode` is active,
and in which the document image has no separator between sheets. Restoring it reinstates both.

**Restoring also removes the outcome recorders** (`_pagOk`, `_pagErr`, `_gapBands`) that made the
V501 defect findable. That is the real cost of this rollback, and it is not visible in the hash.

```bash
cp "index.html.bak-pre-v501-20260902-115235" "index.html"
```

## `index.html.bak-pre-v498-20260902-012633`

| | |
|---|---|
| **Version** | V497 |
| **Hash (md5)** | `53421f190eb344269d67a1b0664e13f4` |
| **Size** | 1,249,059 bytes |

**Purpose.** **The operational rollback for V498**, promoted 2026-09-02. Hash-verified against the
outgoing `index.html` before the promotion; restore dry-run tested against `497.html`.

It is the last artifact in which a list item can be split across two sheets. Restoring it reinstates
mid-sentence bullet breaks.

```bash
cp "index.html.bak-pre-v498-20260902-012633" "index.html"
```

## `index.html.bak-pre-v497-20260902-011839`

| | |
|---|---|
| **Version** | V496 |
| **Hash (md5)** | `d331a41d3d30ca00013bb70fc63bcc9a` |
| **Size** | 1,244,858 bytes |

**Purpose.** **The operational rollback for V497**, promoted 2026-09-02. Created and hash-verified
against the outgoing `index.html` *before* the promotion; the restore was **dry-run tested** and
reproduces V496 exactly, matching `496.html`.

It is the last artifact carrying **three parallel pagination implementations** — the editor's engine,
the PDF's own inline loop, and no pagination at all in the photo path — and therefore the last one in
which the document on screen and the document downloaded could differ by construction. Restoring it
reinstates that divergence.

```bash
cp "index.html.bak-pre-v497-20260902-011839" "index.html"
```

## `index.html.bak-pre-v496-20260901-173224`

| | |
|---|---|
| **Version** | V495 |
| **Hash (md5)** | `b30c25993f576f6fd1e7f12bb6e35824` |
| **Size** | 1,241,990 bytes |

**Purpose.** **The operational rollback for V496**, promoted 2026-09-01. Created and hash-verified
against the outgoing `index.html` *before* the promotion; the restore was **dry-run tested** and
reproduces V495 exactly, matching `495.html`.

It is the last artifact in which the A4 document is repainted by the Black & White design
(`.tpl-neumorphic.tpl-bw *` turned its text white on a white sheet) and in which entering preview
mode destroyed the document's pagination. Restoring it reinstates both.

```bash
cp "index.html.bak-pre-v496-20260901-173224" "index.html"
```

## `index.html.bak-pre-v495-20260831-013719`

| | |
|---|---|
| **Version** | V494 |
| **Hash (md5)** | `ddce3d515a62e8d949cb3c8c35aa3a72` |
| **Size** | 1,239,281 bytes |

**Purpose.** **The operational rollback for V495**, promoted 2026-08-31. Created and hash-verified
against the outgoing `index.html` *before* the promotion, and the restore was **dry-run tested**: it
reproduces V494 exactly and matches `494.html`.

It is the last artifact in which the Terminal-1 title is centred by `transform:translate(-50%,-50%)`
and the mobile image render scale is searched with integers only — the two defects V495 removes.
Restoring it reinstates both.

```bash
cp "index.html.bak-pre-v495-20260831-013719" "index.html"
```

## `index.html.bak-pre-v494-20260829-020510`

| | |
|---|---|
| **Version** | V493 |
| **Hash (md5)** | `e8f9c29d08cba50cc9cb476ea24b3d4d` |
| **Size** | 1,239,116 bytes |

**Purpose.** **The operational rollback for V494**, promoted 2026-08-29. Created and hash-verified
against the outgoing `index.html` *before* the promotion, and the restore was **dry-run tested**: the
backup reproduces V493 exactly and matches `493.html`.

It is the last artifact in which the draft articles 83–87 are formatted **identically to articles in
force** — the ambiguity V494 exists to remove. Restoring it reinstates that ambiguity along with
everything else.

```bash
cp "index.html.bak-pre-v494-20260829-020510" "index.html"
```

## `index.html.bak-pre-v493-20260829-014817`

| | |
|---|---|
| **Version** | V492 |
| **Hash (md5)** | `56b0c30757f79a36a8e1afe4169a1ea9` |
| **Size** | 1,213,913 bytes |

**Purpose.** **The operational rollback for V493**, promoted 2026-08-29. Created and hash-verified
against the outgoing `index.html` *before* the promotion — the assertion was executed, not assumed.

It is also the last artifact holding the Constitution **without** the AMENDMENT-01 draft: V493 ships
that draft (banded `NUK ËSHTË NË FUQI`, +21,434 chars) inside the constitutional comment. Restoring
this file returns both the code and a 43,582-char Constitution.

```bash
cp "index.html.bak-pre-v493-20260829-014817" "index.html"
```

## `index.html.bak-v486-baseline` — ⚠️ **NO LONGER EXISTS** (recorded 2026-08-29)

| | |
|---|---|
| **Version** | V486 |
| **Hash (md5)** | `b2c238c6009183b522648bc70aa970ed` |
| **Size** | 1,147,188 bytes |
| **Present on disk** | **NO.** Verified absent 2026-08-29 |
| **Content survives in** | `486.html` — same hash, verified |

> **The entry is kept, not deleted.** What follows is the historical record of the V487 promotion and
> remains true of it. What is no longer true is that the file exists. Deleting the entry would erase
> the evidence that a protected artifact was lost; correcting it preserves both facts.
>
> **No replacement was fabricated from `486.html`.** The bytes are identical and the provenance is
> not: this entry's name asserts a pre-promotion backup, and `486.html` is a Release Snapshot.
> Recoverability is not preservation.

**Purpose.** **The operational rollback for V487 (ADR-031), promoted 2026-08-16.** Created and
hash-verified against the outgoing `index.html` *before* the promotion — the assertion was run, not
assumed: `md5 index.html == md5 index.html.bak-v486-baseline` → PASS. It is also the last artifact
holding the state **before** the ContactElement dimension contract, i.e. the last one in which an
undeclared `dimensionOwner` was possible.

```text
⚠️ NOT RUNNABLE — the file is gone. Kept as the historical record of what the V487
   rollback was. For the CURRENT rollback path see "Restoring" below.

   cp "index.html.bak-v486-baseline" "index.html"
```

> **Note on the count.** This takes the set to 9, over the 5-file target. It is not a retention
> failure: a promotion may not proceed without a verified rollback point, and `index-test.html.bak-pre-adr031`
> holds the same bytes under a name that describes a *sandbox* state. Two names for one set of bytes
> would normally break the retention rule — here the roles genuinely differ, and a rollback point whose
> name misdescribes it is the same defect this project already found twice in stale restore commands.
> Consolidation is a task for after the promotion, when one of the two names becomes redundant.

## `index.html.bak-v485-baseline`

| | |
|---|---|
| **Version** | V485 |
| **Hash (md5)** | `99e0f10da3bb754f19d0d3bb9127a4b8` |
| **Size** | 1,141,439 bytes |

**Purpose.** The only artifact holding the finished `CVFrame` line without `CVSecurity` or the
BUG-018 fix. Created and hash-verified *before* the V486 overwrite — not after, which is the
difference between a rollback and a hope. **Superseded as the operational rollback on 2026-08-16 by
`bak-v486-baseline`**; kept for the capability above, per the retention rule.

## `index.html.bak-v484-baseline`

| | |
|---|---|
| **Version** | V484 |
| **Hash (md5)** | `6fc7d00a8a74a806037819443a00fcc1` |
| **Size** | 1,123,852 bytes |

**Purpose.** Frozen baseline of V484 and the rollback target for V485. Superseded in that role by
`bak-v485-baseline` on 2026-08-04; kept as **the sole surviving copy of `CVDragTrace` and
`CVBlackout`**, the two retired diagnostics, which exist in no other artifact.

## `index.html.bak-v483-baseline`

| | |
|---|---|
| **Version** | V483 |
| **Hash (md5)** | `b2ece1ae83975ac0ba9e9a2425afae40` |
| **Size** | 1,109,390 bytes |

**Purpose.** Frozen baseline of V483 **and, since 2026-07-29, the operational rollback target for V484** — the outgoing production was byte-identical to it, so no duplicate was made. One set of bytes, two roles, both recorded here deliberately: duplicating it would have broken the retention rule this file states.

## `index.html.bak-pre-v483`

| | |
|---|---|
| **Version** | V482u |
| **Hash (md5)** | `01f22f35348a152532b92b770a0ccf33` |
| **Size** | 1,092,998 bytes |

**Purpose.** Rollback point for the V483 promotion. The one file that must exist: restoring it returns production to the state that ran before 2026-07-29.

## `index.html.bak-pre-v482u`

| | |
|---|---|
| **Version** | V479 |
| **Hash (md5)** | `27e9d4cc4aad3220a15fce8fad86c7bf` |
| **Size** | 903,341 bytes |

**Purpose.** Last production before the Foundation architecture cycle. Kept as the pre-Foundation reference — every ADR-014→032 decision post-dates it.

## `index-test.html.bak-pre-pilot-retire`

| | |
|---|---|
| **Version** | V480 (pilot) |
| **Hash (md5)** | `a0aa54845aa3069e1088b891161174f9` |
| **Size** | 954,292 bytes |

**Purpose.** SOLE surviving copy of `CVExperiencePilot` — the Canonical Document Model pilot (Validate PASS, Phase 0 and Phase 1 at 22/22, divergence matrix with teeth). The pilot was retired from the sandbox and exists in no other artifact. A "keep the 5 newest" rule would have destroyed it; a uniqueness audit found it.

---

## Chain of custody

The point of the four files is not that they are backups — it is that together they are a *traceable
lineage*. Four files with semantics beat forty-four without.

```
V479  ────────────────────  index.html.bak-pre-v482u
 │                          last production before the Foundation architecture
 ├─ Foundation transition
 │
V480  ────────────────────  index-test.html.bak-pre-pilot-retire
 │    CVExperiencePilot     Canonical Model pilot: Validate PASS, Phase 0/1 22/22
 ├─ pilot retired           (survives here and nowhere else)
 │
V482u ────────────────────  index.html.bak-pre-v483
 │                          THE rollback point — verified against production at creation
 ├─ V483 promotion
 │
V483  ────────────────────  index.html.bak-v483-baseline
 │                          frozen baseline AND the rollback target for V484
 ├─ paint-load regression found in daily use (BUG-017)
 │
V484  ────────────────────  index.html.bak-v484-baseline
 │                          frozen baseline AND the rollback target for V485 — the outgoing
 │                          production was byte-identical to it, so one set of bytes serves both
 ├─ V484's paint fix falsified (BUG-017 recurred); diagnostic layer swapped
 │
V485  ────────────────────  index.html.bak-v485-baseline
 │                          frozen baseline AND the rollback target for V486
 ├─ BUG-017's primary evidence moved outside the codebase (chrome://gpu), lifting the freeze
 │
V486  ────────────────────  index.html `b2c238c6`
 └─ BUG-018 fix + CVSecurity shipped; index.html == index-test.html == 486.html
```

**V486, 2026-08-04.** Production `b2c238c6` (1,147,188 bytes). `index.html` == `index-test.html` ==
`486.html`; `485.html` removed. Rollback is the **new** `index.html.bak-v485-baseline`
(`99e0f10d`), created and hash-verified *before* the overwrite. Ships the queued BUG-018 sanitiser
fix and `CVSecurity` — held back for six days while BUG-017's only signal was the symptom itself,
released once that signal became a browser-maintained counter. The sandbox and production are
byte-identical again for the first time since V485.

**V485, 2026-08-02/03.** Production is `99e0f10d` (1,141,439 bytes). The label covers **eleven** builds
of the one instrument, each fixing a defect the previous one revealed — that sequence is the record of
how it became trustworthy, so it is kept rather than collapsed:

| Build | What it fixed |
|---|---|
| `11b0aaec` | shipped `CVFrame`, retired `CVDragTrace` + `CVBlackout` |
| `50d9bb1c` | report shows **containment** — attributed scripts are a *subset* of `preRender`, not a sibling; added the `styleAndLayout` split and `pause()`/`resume()` |
| `4a3fd305` | episode validity became **temporal coverage**. A frame-count threshold encoded a hidden 60 Hz assumption, and the 900-frame buffer spanned only 6.2 s at 144 Hz — the 8-second window would have been silently truncated and the verdict would have described an interval never observed. Buffer now sized from the window (1400) |
| `def4fa2e` | an episode persisted **before** the coverage gate existed prints its stored verdict as unvalidated. Found when a teeth-test episode recorded in the sandbox reappeared inside a `report()` on production — `localStorage` is shared across `file://` documents here |
| `a0e73a76` | every episode now carries **`origin: incident \| calibration`**, stamped at creation. `report()` shows incidents only and returns only incidents; calibration needs `report({includeCalibration:true})`. Structure replacing procedure: the previous build relied on remembering `clear()`, and a forgotten `clear()` is exactly how the synthetic teeth test got read as evidence. The default is `calibration` **because the default must be the classification that cannot contaminate** — only SHIFT×3, the one path requiring a human to have seen something, produces `incident` |
| `2fc063d4` | `UNCLASSIFIED` stops being a third category and becomes an **integrity alarm**. Each episode is stamped with the build that created it (`by`), so `report()` can separate *legacy* (written before `origin` existed — expected, harmless) from *defect* (this build produced an episode with no origin, which `mark()` makes impossible — so it means an unclassified creation path exists, and the report says so loudly and voids every episode until explained). The invariant it enforces: **an episode created by the current build is always `incident` or `calibration`** |
| `9d09b987` | the response to that defect was **overreaching** and is now two-level. Knowing an unclassified path exists does not establish that any *particular* earlier episode came through it, so voiding them all claimed more than the evidence held — the same overreach the paint explanation once made. Now: `collection_status = TAINTED`, episodes **kept and readable**, automatic verdicts **suspended**, and the pre-registered reading withheld so a suspended verdict cannot be read as a live one. The status rides on the returned array (`inc.collectionStatus`) so a programmatic caller sees the suspension the printed report makes obvious |
| `34a9fd6b` | **the coverage gate had a hole, and the first three real marks fell straight through it.** `reachedWindowEdge` — set when a frame older than the window is met — was also set on the very first comparison, i.e. when the NEWEST buffered frame was already stale because rAF had stopped in a backgrounded tab. Stale was read as deep, so three episodes with `frames=0, coverage=0` returned `NEITHER` instead of `CANNOT RUN` — precisely the false negative the gate was built to prevent. Condition is now `count>0 && coverageMs>=WINDOW_MS-100`: coverage measured, never inferred |
| `05d6e798` | added the **heartbeat**, an orthogonal axis rather than a better instrument: a 25 ms `setTimeout` (not a vsync multiple, so it cannot alias) recording lateness, summarised per episode as p50/p95/max and counts over 16 ms and 50 ms. LoAF sees frame structure but is blind below its attribution threshold; the heartbeat sees event-loop availability but not where time went inside a frame. It feeds `verdict` nothing — `verdictOf()` does not reference it — and the report states the observation separately from what it is *compatible with*, because an earlier draft folded "ticks near 0 → compositor" into the measurement itself |
| `3d203ee4` | `CVFrame.heartbeat(false)` — an independent switch for the heartbeat alone. `pause()` stops rAF, the heartbeat AND the observer together, so under it no LoAF is collected and the one comparison that matters cannot be run: does the heartbeat change the **LoAF distribution**, which is the object under investigation? fps is only a proxy and could pass while that happened. Also records the heartbeat's own acceptance ladder — capability PENDING (built, never executed: a mechanism, not a behaviour), non-interference PENDING, evidential use BLOCKED |
| `99e0f10d` | the badge shown on SHIFT×3 now also asks the two questions no instrument can answer — *is Chrome's own UI dark too?* and *is the cursor visible?* — and holds for 12s so it outlasts a ~700ms dark period. The user said plainly they would not remember them; a question asked afterwards fails on recall, so it is placed on screen at the moment of the episode. Measures nothing, changes no verdict |

The first ten are superseded, **not** rollback targets; V484 remains that. `index.html` == `485.html`
(`484.html` removed). Rollback is `index.html.bak-v484-baseline` — the same one-bytes-two-roles
arrangement already used at V483, and recorded rather than duplicated.

**`index-test.html` deliberately does NOT match production at V485**, and the divergence is the point:
the sandbox (`cbbf84f0`, +5,749 bytes) additionally carries `CVSecurity` and the BUG-018 sanitiser
fix. Those were held back because BUG-017 is under observation and shipping an unrelated change would
destroy the attribution the observation depends on — the user chose this scope explicitly. Both files
report `window.CV.build='V485'`; **the hash, not the label, distinguishes them**, per the project's own
source-over-representation rule.

Read the roles as three different things, not one:

> **Corrected 2026-08-29.** The table below read *"Operational rollback = `bak-v485-baseline`"*. That
> was true at V486 and is false at V492: restoring it would return production seven releases. The
> roles are unchanged; **which file holds each one has moved.**

| Role | File | Never confuse with |
|---|---|---|
| **Operational rollback** | **`index.html.bak-pre-v498-20260902-012633`** (V497 `53421f19`) | the only file that is a deployment candidate for V498 |
| **Superseded rollbacks** | `bak-pre-v497-20260902-011839` (V496), `bak-pre-v496-20260901-173224` (V495), `bak-pre-v495-20260831-013719` (V494), `bak-pre-v494-20260829-020510` (V493), `bak-pre-v493-20260829-014817` (V492), `491.html` (V491), `bak-v485-baseline` (V485), `bak-v484-baseline` (V484), `bak-v483-baseline` (V483) | reference only — none is a target for V495 |
| **Architectural history** | `bak-pre-v483` (V482u), `bak-pre-v482u` (V479), `bak-pre-pilot-retire` (V480 pilot) | reference only |

**A file can hold a role its name does not announce.** `491.html` is named as a release artifact and
is currently also the operational rollback. That is a *consequence of a loss*, not a design: the
artifact named for the role — `index.html.bak-pre-v492-20260827-231513` — no longer exists. Recorded
so nobody later reads `491.html`'s name as the reason it holds the role.

## Uniqueness audit — 2026-08-15. Four removable, **executed**

11 backup files, 8.3 MB. Hashes recomputed, not transcribed. **Nothing was deleted**: the audit
classifies, the user decides.

| Candidate | Why it is removable |
|---|---|
| `index-test.html.bak-pre-sectests` | **Byte-identical to `index.html.bak-v484-baseline`** (`6fc7d00a`). Undocumented duplicate — its content survives complete in the named file |
| `index-test.html.bak-pre-cvframe` | Its own recorded condition was met: *"once CVFrame has passed its teeth test in a real window"* — passed 2026-08-03. Its content is now split between `bak-v484-baseline` and V486 |
| `BUGS.md.bak-pre-falsification` | Recorded as *"any time — the withdrawal is fully narrated in the live entry"* |
| `ARCHITECTURE_DECISIONS.md.bak-pre-census` | Recorded as *"routine pre-edit backup — any time"* |

**Executed 2026-08-15 on the user's authorisation: 11 → 7, 2.24 MB freed.** The transaction ran
guarded — it would have refused if production had drifted or if `bak-pre-sectests` had stopped being
byte-identical to `bak-v484-baseline`. Post-check: the four are gone, the seven remain, all three
V486 artifacts still hash `b2c238c6`, and nothing else was removed.

Each surviving file holds a stated role, and three of them are **sole surviving copies**
(`CVDragTrace`+`CVBlackout`, `CVExperiencePilot`, and the withdrawn METHOD §0 text).

**The 5-file target does not by itself justify going further.** Reaching exactly five would mean
dropping `bak-v483-baseline` (V483) or `bak-pre-v482u` (V479) — architectural *references*, not
rollbacks. Their weight is not measured by age, and dropping them is a judgement about how much
diagnostic history the project wants to keep, not a consequence of the retention rule.

**The procedure that was followed:** verify hashes → delete only those four → verify the remaining
seven are untouched → change nothing else. Every step passed; had any guard failed, the transaction
was written to stop without attempting automatic recovery.

## Restoring

**Production is V550 (`792082b8…`). To roll back one release, to V548:**

```bash
cp "index.html.bak-pre-v550-20260930-152856" "index.html"
```

Two releases back, to V546: `cp "index.html.bak-pre-v548-20260930-144638" "index.html"`.
Three back, to V542: `cp "index.html.bak-pre-v546-20260930-113924" "index.html"`.

> **Corrected 2026-09-11 at the V507 promotion.** This line still read *"Production is V498 … roll
> back to V497"* — it was not updated when V501 shipped on 2026-09-02, the exact drift the note
> below describes. Running it would have returned production **two** releases, V501 → V497.

> **Updated 2026-08-29 in the same transaction as the V493 promotion.** This release restored the
> practice the file itself demands: a **named pre-promotion backup**, verified against the outgoing
> production *before* the copy. V491 and V492 had none — theirs had been deleted — which is why the
> line below had to name `491.html`, a Release Snapshot standing in for a lost artifact.

> ### ⚠️ Corrected 2026-08-29 — the previous command was live and dangerous
>
> This section read `cp "index.html.bak-v485-baseline" "index.html"`. **That file exists**, so the
> command ran cleanly — and silently returned production **seven releases**, V492 → V485. It is the
> exact failure the paragraph below warns about, committed in the paragraph above it, and it survived
> five promotions because updating this line was never part of any of them.
>
> The rollback target is now `491.html` because
> **`index.html.bak-pre-v492-20260827-231513` no longer exists.** `491.html` holds byte-identical
> content (`a71de5fa…`, verified). No replacement backup was fabricated: the bytes would be right and
> the name would assert a creation moment that never happened. **Recoverability is not preservation.**
>
> Every surviving `index.html.bak-*` file covers V479–V485 only. **None is a rollback target for
> V492.**

**The 2026-08-02 correction** (kept as historical narrative)**:** this line was wrong until then — it still named `bak-v483-baseline`, the rollback for V484,
after V485 shipped and V484 became the target. A stale restore command is worse than none: it runs
cleanly and silently returns production two releases instead of one. Whoever promotes must update it
in the same transaction as the promotion.

Any other file here is a *reference*, not a rollback target: restoring V479 or the V480 pilot
over production would undo the entire Foundation arc. Read them, do not promote them.

---

## Files outside this manifest

Two `.md` backups sit in the directory without an entry above. They are **not** artifact backups and
are not covered by the retention rule — recorded here only so a future cleanup does not remove them
without knowing what they are.

| File | What it is | When it can go |
|---|---|---|
| `METHOD.md.bak-pre-revert` | **Incident audit artifact.** Holds the exact §0 text removed on 2026-08-02 after a review exchange was found to have been conducted in a chat carrying another project's context. It is the only record of what was withdrawn. | after §0 has been exercised in a real cycle |
| `ARCHITECTURE_DECISIONS.md.bak-pre-census` | routine pre-edit backup | any time |
| `index-test.html.bak-pre-cvframe` | Sandbox `6109b82b`, immediately before `CVDragTrace` + `CVBlackout` were replaced by `CVFrame` (2026-08-02). Routine pre-edit backup — **not** the archive of the retired instruments; that role belongs to `index.html.bak-v484-baseline`, which holds them and is frozen. | once `CVFrame` has passed its teeth test in a real window |
| `BUGS.md.bak-pre-falsification` | `650424f1`, immediately before BUG-017's root cause was withdrawn on 2026-08-02. Holds the entry as it read while the paint explanation still stood. | any time — the withdrawal is fully narrated in the live entry |

The first is deliberately kept. A revert that erases the evidence of what it reverted leaves the
project unable to answer *"what exactly was withdrawn, and was the withdrawal correct?"* — and that
question is the whole reason the incident was traceable at all.
