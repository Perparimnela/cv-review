# How this public copy is made

Generated 2026-09-30 11:45 from the private production release **V546** by `tools/public_copy.py` (private).

| | Private (real data) | Public (this repository) |
|---|---|---|
| `index.html` md5 | `e3a635dac72932243c1c9cb3a9200071` | `8830d1a68e1653915f3e82c0ea7bd692` |

**Why the hashes differ.** The public file is the private release with personal data replaced by fictitious values: name, e-mail, phone number, date of birth, postal address, personal and company ID numbers, the employer and a third party's name, and local file paths. The replacements change lengths, so the byte size differs slightly. Nothing else is changed. The project's release identity is the private hash above.

**Checks run before this copy was released:**
- known-token scan on the decoded text (`\\uXXXX` and HTML entities resolved): clean;
- generic scan (non-example.com e-mails, phone numbers, ID formats, IBAN): clean;
- `node --check` on every script of the anonymised application: 28 scripts, 0 errors.
