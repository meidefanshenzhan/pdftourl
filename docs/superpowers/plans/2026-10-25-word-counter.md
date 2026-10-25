# Word Counter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship bilingual, local-only word counting and complete keyword-density export on KJAMZ.
**Architecture:** Pure analysis module + module Worker; small browser controller; static bilingual page generator; shared page registry for SEO checks.
**Tech Stack:** Existing JavaScript ESM, Node test runner, static HTML/CSS, Playwright, Cloudflare Workers.
**Spec:** docs/superpowers/specs/2026-10-25-word-counter-design.md

## Global Constraints
- Keep existing no-login PDF workflows, credentials and S3 URLs unchanged.
- All text analysis runs in browser; no third-party scripts or text transmission.
- Default all keywords, optional top N; 100-row pages do not limit export.
- Maximum 500,000 Unicode code points, debounce 150ms; stale Worker results ignored.
- Browser storage is opt-in, only KJAMZ word-counter keys may be removed.
- Preserve user copy preferences and crawler training policy; no protocol padding.

## Review Focus
- Punctuation, apostrophes, mixed languages and decimal numbers must not silently create misleading phrases.
- Export after a filter/input change must never download stale rows.
- Disabled storage/Worker/clipboard must not destroy text or break navigation.
- CSV cells beginning as formulas must remain inert in spreadsheets.
- Long text and many unique words must not create unbounded DOM or block typing.

## Task 1: Analysis and export engine
Files: public/assets/word-counter-core.js; tests/word-counter.test.mjs.
Interfaces: analyzeText(text, options) -> stats, rows, denominator, error; selectRows(rows, filters) -> rows; exportRows(rows, format, metadata) -> text.
- [x] Write tests for empty/English/Chinese/mixed/Unicode input, case, punctuation and boundaries, stopwords, stable denominator, 1/2/3 grams, >10 unique words, top N, formula-safe quoted CSV/TXT, limits and readability eligibility.
- [x] Run tests and confirm missing-module failure.
- [x] Implement pure functions and run tests until assertions pass.

## Task 2: Bilingual local-only interface
Files: scripts/build-word-counter.mjs; public/assets/word-counter.js; public/assets/word-counter-worker.js; public/assets/word-counter.css.
- [x] Render shared navigation, editor, primary stats, expandable reading/readability and goal cards, full keyword table with advanced filters, exports and pagination.
- [x] Add editable text and named storage opt-in, copy/clear/sample, locale session transfer, disabled-clipboard fallback, Worker revision protocol and 500k limit.
- [x] Write original static usage/FAQ content explaining metrics, density denominator, privacy and scope.
- [x] Browser-test initial state, input, >10 terms, filters, CSV/TXT downloads, locale, goals, consent/clear, no text requests, mobile/desktop.

## Task 3: Workspace and discoverability
Files: scripts/site-pages.mjs; scripts/build-home.mjs; scripts/build-seo.mjs; scripts/check-geo.mjs; package.json.
- [x] Add homepage card and ordinary cross-tool navigation.
- [x] Share real page list; build canonical/hreflang/JSON-LD/sitemap for eight public pages.
- [x] Add meaningful static title/description/H1, preserving PDF page metadata.
- [x] Run build, all tests, GEO and UI regression tests.

## Task 4: Review and release
- [x] Read current remote branch and Cloudflare deployment; save run/checkpoint/backup/rollback.
- [x] Request independent branch review, fix substantive findings and rerun affected checks.
- [x] Sync verified source to existing GitHub branch, no secrets.
- [x] Deploy existing Worker once, verify canonical hostname and run live GEO; explicitly record host-network limitations.
- [x] Verify live tool/download behavior, save evidence/release report and final links.

Execution: user explicitly approved development and deployment; proceed inline without another approval loop.
