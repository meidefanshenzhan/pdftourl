# Keyword Filter Implementation Plan

Goal: Ship a bilingual browser-local word remover and keyword-line filter in the existing KJAMZ UI.
Owner authorized direct implementation after the proposed tool shortlist. Scope: one page, three modes (remove selected terms, exclude matching lines, keep matching lines), literal matching, optional case sensitivity and Unicode whole-word boundaries, copy/TXT/CSV. No AI, uploads or storage.
Primary candidate: Remove Words from Text; secondary: Keyword Filter. Trends browser/API attempts are recorded in .local/keyword-filter; no verified highest-volume claim. Use /remove-words-from-text/ symmetrically.

## Tasks
- Write and observe failing core tests for literal phrases, Unicode boundaries, any/all line matching, CRLF, limits, CSV escaping and formula protection.
- Implement bounded pure filtering core; build bilingual UI with matching explanations and seller uses, accessible labels and clear empty states. Preserve all existing unrelated tools.
- Add home card, shared page registry, structured data, sitemap and bilingual v1.6.0 release notes.
- Run build, full tests, GEO, browser interaction/mobile checks. Inspect current remote before one deployment; verify live pages and preserve rollback.
- Review once before release; sync source and generated public pages to existing GitHub branch with expected-head lease.

Decisions: at most 200000 text characters, 10000 filter-list characters, 200 unique terms; no regex interpretation; NFC matching only with original output retained; whole-word uses Unicode letters/numbers/underscore boundaries. Terms may contain spaces; one term per line. All/any affects line modes only. Empty filter returns original unchanged. No automatic draft persistence. CSV one output line per row with spreadsheet formula protection.
