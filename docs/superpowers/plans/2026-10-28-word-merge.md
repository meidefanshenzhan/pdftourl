# Word Merge implementation

Owner approved Word Merge /word-merge/ with explicit word/keyword-list subtitle, bilingual KJAMZ tool, not document or mail merging. Execute inline using current static generator architecture and no backend changes.

Core: newline-separated A/B required, optional C required if enabled; trim edges/drop blanks; forward/reverse list order; separator space/none/hyphen/underscore/custom (max20), prefix/suffix (max120 each). Case-insensitive deduplication optional, default on, preserving first spelling. Estimate candidate count before generating, cap50,000 candidate combinations and5million output UTF-16 units; each input max50,000. Deduplicate input groups first when enabled, then final results to handle join collisions. Generate explicitly; input/option edits invalidate previous result and exports. Show complete read-only result and counts; copy/TXT/CSV downloads. No autosave or input transmission. Reuse safe CSV escaping.

UI: two/three list columns, options, result card, seller examples, how-to and original FAQ. Warm paper/deep green existing shell and per-tool anchors; mobile stack. Positive supported-function copy only. No invented keyword search volumes. Cross-links to current remove-duplicates and word-counter tools, no auto transfer.

- [ ] Write failing core tests then implement deterministic generation/limits/export.
- [ ] Build bilingual controller/copy/CSS/static HTML; UI semantics and stale export guard.
- [ ] Add home card, shared page registry and truthful SEO, v1.3.0 released entry dated2026-10-28.
- [ ] Build/test/GEO; browser correctness/download/mobile/no transmission; fresh review.
- [ ] Inspect remote state; preserve existing history, deploy existing Worker once, live verify and record rollback.

Run word-merge-2026-10-28, checkpoint .local/word-merge-release/. Rollback previous e79dace1-9e32-4d29-a1c3-53eae50cde4a; verify current deployment before mutation. Backup public/scripts/package/seo-hashes. No login, credentials or PDF quotas change.
