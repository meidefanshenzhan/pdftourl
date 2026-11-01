# Text Compare Implementation Plan

Goal: Continue approved seller-workspace sequence with bilingual Text Compare / Diff Checker at /{zh,en}/text-compare/; releasev1.9.0 on2026-11-01.
Owner authorized direct next-tool implementation. Reuse static KJAMZ stack, shared shell, browser-local processing. No upload/API/AI/persistence/login changes.
Alternatives: third-party diff package adds dependency; unbounded LCS matrix risks memory growth. Choose bounded Myers token diff, prefix/suffix trimming and honest coarse fallback when edit complexity or rendering bounds are exceeded.

## Contract
- Two pasted texts, max100000Unicode code points each (at most200000UTF16code units), matching visible counters. Normalize CRLF/CR toLF for comparison and exported text. Default mode lines; optional words with Intl.Segmenter('en',word) (preserve whitespace/punctuation). Optional ignoreCase and ignoreWhitespace defaultfalse.
- Line whitespace-ignore trims/collapses horizontal whitespace per line, retaining line boundaries. Word whitespace-ignore omits whitespace from keys but attaches original whitespace to comparison units; original left/right text remains reconstructible.
- Unicode NFC comparison keys, original text retained. Equal spans can differ in ignored case/space. Outputs contiguous equal/delete/insert chunks; substitutions are removals plus additions. Bounded traces/steps and20000tokens per side; coarse delete+insert blocks preserve truth and display an explicit merged-block note.
- Split result panels: red deletions, green additions, optional changes-only mode with context ellipses; never render user HTML. Counts added/deleted contiguous fragments and input character counts. Swap, sample,clear,previous/next change with accessible focus, copy report and TXT export; plain report includes normalized before/after and explicit change list/rules, not a patch guarantee.
- Both languages, page navigation, seller examples, accurate FAQ, sharedfooter, homecard, canonical/hreflang/JSONLD/sitemap and release notes. No scanner-only placeholders.

## Tasks
1. Red/green pure tests for line/word substitutions, ignore options, whitespace preservation, Unicode, empty inputs, bound fallback, TXT safety and deterministic reconstruction/property checks.
2. Implement responsive bilingual UI. Browser tests both modes, ignored changes, swap, changes-only, safe markup, copy payload/TXT, nav, mobile width and oversize errors.
3. Integrate build/home/SEO/release. Build/fulltests/check:geo. Fresh read-only reviewer; fix findings and repeat relevant checks.
4. Record run/session/checkpoints and old remote Worker before single deploy. Live browser/GEO/mainhost verification; expected-head GitHub sync preserving history. Evidence under.local/text-compare.
