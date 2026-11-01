# Image to PDF Implementation Plan

Goal: Next approved KJAMZ tool, bilingual Image to PDF at /{zh,en}/image-to-pdf/, v1.10.0 on2026-11-01.
Architecture: native Canvas preprocessing and existing pdf-lib1.17.1, dynamically loaded from generated same-origin vendor folder. Static shared KJAMZ shell, no uploads/AI/API/persistence changes.
Alternatives: remote PDF service adds uploads/cost; direct JPEG embedding loses orientation consistency. Choose browser decoding/re-encoding with visible quality limits and white matte.

## Scope
- Static JPG/PNG/WebP validated with existing bounded magic-header/animation helper. Max30files,20MiB each,100MiB input. Each image<=32MP and20000px edge. Sequential reads/generation and cancellation; failures must be removed before generation, no silent skipped pages.
- One image per PDF page; up/down reorder, natural filename sort,90degree rotation,remove,append files,clear. Lazy360px thumbnails. CSP blob-image allowance on this page only.
- A4/Letter/image-aspect page size; auto/portrait/landscape orientation for paper sizes. Margins0–30mm. Contain(default) or cover/crop to content rectangle. Clip cover inside margins. Image-aspect pages follow rotated image; orientation disabled. PDF unitspt, 96dpi pixel mapping for image-aspect pages.
- JPEG normalization with white background; quality presets clear(4000edge,.95),balanced(2400,.90),small(1600,.78),original(6000,.98); normalized images capped12MP each. Visible explanation of re-encoding, white transparency and image-based PDFs. PDF generation uses selected order/rotation, no watermark.
- Output<=100MiB, embedded JPEG total<=80MiB. Preview opens generated PDF blob in a new tab; download link,filenameinput,safe filename; edits invalidate old PDF. Continue-to-PDF-link is a normal link, not automatic upload.
- Existing lib version/hash assertion and MIT LICENSE/NOTICE copied by build. Generated vendor directory gitignored, reproducible from lockfile; no binary/Git data dump.
- Both locales, sharedfooter, page-local navigation, home card and truthful SEO/JSONLD/sitemap/release. No scanner placeholders or compliance guarantees.

## Tasks
1. TDD pure layout/size/rotation/name/options tests, then browser engine and UI.
2. Bilingual browser tests: real JPEG/PNG/WebP,order/rotation/margins/cover/auto orientation, PDF count/size bounds, invalid-file blocking, cancel, settings invalidation, mobile and preview loading.
3. Render exported test PDFs using Python/Poppler equivalent for visual page order,crop,white background and margins. Use PDF skill for read-only verification of generated test output.
4. Full build/test/GEO; fresh reviewer; inspect current remote/run/checkpoints/rollback; single deploy; live browser/mainhostGEO; GitHub expected-head sync.

Evidence:.local/image-to-pdf. Rollback before run:Worker4e36a06c-314b-46b9-a7ff-bde7f195040a. Preserve history,credentials,AI budgets and PDF upload isolation.
