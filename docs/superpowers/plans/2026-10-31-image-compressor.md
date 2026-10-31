# Image Compressor Implementation Plan

Goal: Ship the next approved seller-workspace tool: bilingual batch image compression at /{zh,en}/image-compressor/.
Owner asked to continue the agreed sequence after keyword filtering; direct execution authorized.
Architecture: browser-local Canvas encoding, bounded sequential file processing, pure header/options/name/ZIP helpers. Existing shared shell and static build/SEO registry. No API, credential, storage or AI changes.
Alternatives: remote compression adds uploads and cost; WASM codecs add download weight. Native browser encoding chosen for a small usable first release. PNG quality is not adjustable; visible explanation required.

## Scope and decisions
- Static JPEG, PNG, WebP input; magic-header validation, animation rejection. Max30files,20MiB each,100MiB total,32million pixels,edge20000 before decode. Output edge cap8192; default2000. No upscaling. Auto outputs JPEG for JPEG and WebP for PNG/WebP; explicit JPEG/WebP/PNG available.
- Quality10–100 for JPEG/WebP. PNG uses lossless encoding and resize cap. JPEG white background. Always return re-encoded output (no original fallback that would retain metadata). No guaranteed reduction/target size.
- Rows have original/result previews, dimensions, bytes, honest delta and individual download/remove. Sequential progress, cancel, clear, per-file errors, ZIP of successful results with unique safe filenames. Options invalidate old outputs. Temporary object URLs revoked.
- Input remains browser-local; no persistence. Both languages, page-local navigation, sharedfooter, home card and releasev1.7.0. Primary English label Image Compressor; no volume claims.

## Tasks
1. Red/green pure tests: magic headers, PNG/WebP animation, dimension bounds, resize aspect, names, delta, ZIP CRC/UTF8/structure and limits.
2. Implement Canvas engine and bilingual responsive UI; exercise actual encoders, alpha/white background, unsupported file isolation, option invalidation, cancel and ZIP extraction in browser tests.
3. Integrate registry/build/home/JSONLD/changelog. Run build, npm test, check:geo. Read-only fresh review, fix findings and rerun relevant checks.
4. Inspect remote, deploy once, run mandated live GEO and independent canonical-host checks; smoke both languages, sync existing GitHub branch with expected-head lease. Save evidence and rollback under .local/image-compressor.

Rollback before run: Worker283d0135-3f45-4311-913e-e7317f25f570. Preserve working tree and existing history; no reset or second site.
