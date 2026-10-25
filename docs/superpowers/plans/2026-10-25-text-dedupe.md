# Text Dedupe Implementation Plan

Approved scope: one bilingual page, whole-line / word mode, seller use cases, truthful SEO/GEO and deployment. Reuse existing static generators and design. User has chosen this scope and asked to build; no additional product-choice gate needed.

Goal: remove repeated complete lines or words, retaining first occurrence and original spelling.
Architecture: pure browser core plus bilingual controller and static generator, no API/storage. No stemming. Default ignore case and trim edges, optional blank-line removal. Words split on whitespace, surrounding punctuation ignored for comparison only; internal apostrophes/hyphens preserved. Up to 500,000 UTF-16 input units; explicit error, no truncation.

- [ ] Test line/word semantics, normalization, Unicode, punctuation, blank lines, limits, CSV safety.
- [ ] Implement browser core, two-panel accessible UI, options, counts, sample/copy/clear/TXT/CSV. Use original bilingual seller examples and FAQ. Text cleaner described as a related use, not a full feature claim or verified-volume claim.
- [ ] Add home card, canonical page registry, JSON-LD feature list and hreflang; run build/test/local GEO.
- [ ] Verify mobile/desktop browser interactions, downloads and no input transmission; fresh review.
- [ ] Inspect current remote, upload only changed source/generated artifacts preserving history, deploy existing Worker, verify live canonical pages and GEO.

Run ID: text-dedupe-2026-10-25. Checkpoint/rollback files: .local/text-dedupe-release/. Deployments-before.json records previous version. Command/process identities appended there. No PDF backend changes.
