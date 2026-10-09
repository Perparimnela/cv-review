# How this public copy is made

Generated 2026-10-09 13:55 from the private production release **V613** by `tools/public_copy.py` (private).

| | Private (real data) | Public (this repository) |
|---|---|---|
| `index.html` md5 | `f7a0c614c66593b07f2d2337d9ed564e` | `d38e4d311b273e5eb49981dbd1f15314` |

**Why the hashes differ.** The public file is the private release with personal data replaced by fictitious values: name, e-mail, phone number, date of birth, postal address, personal and company ID numbers, the employer and a third party's name, and local file paths. The replacements change lengths, so the byte size differs slightly. Nothing else is changed. The project's release identity is the private hash above.

**Checks run before this copy was released:**
- known-token scan on the decoded text (`\\uXXXX` and HTML entities resolved): clean;
- generic scan (non-example.com e-mails, phone numbers, ID formats, IBAN): clean;
- `node --check` on every script of the anonymised application: 31 scripts, 0 errors.
