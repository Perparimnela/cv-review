# How this public copy is made

Generated 2026-10-08 16:38 from the private production release **V607** by `tools/public_copy.py` (private).

| | Private (real data) | Public (this repository) |
|---|---|---|
| `index.html` md5 | `2762b4277d044fd27e82b598f22195a1` | `f7b7cd89ec80898df2a008c7e5aa112a` |

**Why the hashes differ.** The public file is the private release with personal data replaced by fictitious values: name, e-mail, phone number, date of birth, postal address, personal and company ID numbers, the employer and a third party's name, and local file paths. The replacements change lengths, so the byte size differs slightly. Nothing else is changed. The project's release identity is the private hash above.

**Checks run before this copy was released:**
- known-token scan on the decoded text (`\\uXXXX` and HTML entities resolved): clean;
- generic scan (non-example.com e-mails, phone numbers, ID formats, IBAN): clean;
- `node --check` on every script of the anonymised application: 29 scripts, 0 errors.
