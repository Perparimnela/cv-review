# How this public copy is made

Generated 2026-10-08 17:45 from the private production release **V609** by `tools/public_copy.py` (private).

| | Private (real data) | Public (this repository) |
|---|---|---|
| `index.html` md5 | `ec2498848cd7fb12e2fbfd244decaf62` | `692780c2340e8411aa4d1bfe710f87fe` |

**Why the hashes differ.** The public file is the private release with personal data replaced by fictitious values: name, e-mail, phone number, date of birth, postal address, personal and company ID numbers, the employer and a third party's name, and local file paths. The replacements change lengths, so the byte size differs slightly. Nothing else is changed. The project's release identity is the private hash above.

**Checks run before this copy was released:**
- known-token scan on the decoded text (`\\uXXXX` and HTML entities resolved): clean;
- generic scan (non-example.com e-mails, phone numbers, ID formats, IBAN): clean;
- `node --check` on every script of the anonymised application: 29 scripts, 0 errors.
