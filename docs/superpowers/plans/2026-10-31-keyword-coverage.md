# Listing Keyword Coverage Implementation Plan

Goal: Continue the owner-approved tool sequence with a bilingual browser-local Listing Keyword Coverage Checker.
Route: /{zh,en}/keyword-coverage-checker/. Release v1.8.0, actual publication date2026-10-31.
Architecture: pure text matching/export module, DOM-only UI, static bilingual builder using existing KJAMZ shell and registry. No API, scraping, AI, accounts, saved drafts or cloud credentials.
Choice: user-pasted fields keep data local and implementation light. Remote ASIN imports and AI edits are outside the approved tool's actual scope; do not add visitor FAQ just to list absent features.

## Scope / matching contract
- One keyword or phrase per line. Trim, NFC and whitespace normalization. Deduplicate under selected case rules, preserving first spelling/order. Max500unique keywords,20000 keyword-list characters,200characters/phrase,25unique tokens/phrase in all-words mode; listing combined max100000characters.
- Fields:title,bullet1…5,description,searchTerms. Scopes:all,front-end,title-only,backend-only. Phrase mode requires contiguous normalized phrase inside a single field. All-words mode requires all distinct letter/number tokens in one field; no cross-field assembly. Both support case and Unicode letter/mark/number/underscore boundaries. Literal punctuation in phrase mode. No stemming/plural merging.
- Summary total/covered/missing/list coverage percentage. Filter all/covered/missing and keyword substring. Table identifies covered fields; click row to inspect original text with safe highlight marks. Copy all missing keywords; CSV/TXT of current filtered rows. No automatic save.
- Related links to keyword filter/dedupe/counter, seller uses and accurate matching FAQ. Character/byte counts are informational, not platform limits or compliance scores.
- Shared footer, page-local navigation, both locales, homepage card, canonical/hreflang/JSONLD/sitemap and bilingual substantive release notes.

## Tasks
1. TDD pure module: literal phrase, Unicode/case boundaries, whitespace/NFC, same-field all-words, scope, dedup/limits, highlights offsets, CSV formula escaping.
2. Implement bilingual responsive tool; browser tests actual typing/modes/scope, missing filter/copy/export, safe literal input/highlight, mobile width and errors.
3. Integrate build/home/SEO/release. Run build,test,check:geo. Fresh read-only review and fix findings.
4. Inspect remote before one deploy; live browser and GEO on canonical host; preserve old Worker rollback and Git history; expected-head GitHub sync. Evidence/run/session/checkpoint in .local/keyword-coverage.

Rollback before run: Worker9435cb1a-48bc-4e0d-a9af-5fa07c196de5. Do not reset existing working tree.
