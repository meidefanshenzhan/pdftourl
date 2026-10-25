# Project instructions

## Release checks
For every new feature or public page, run the GEO/SEO check before release and verify it again on the deployed hostname. This is the owner's standing preference (2026-10-25).
- Run npm run build, npm test and npm run check:geo. After release run node scripts/check-geo.mjs --live.
- Update the shared page list in scripts/build-seo.mjs and scripts/check-geo.mjs when adding indexable pages. Use actual canonical URLs and reciprocal language alternatives. Never add uploaded files, private records or API paths to the sitemap.
- Keep titles, H1, descriptions and structured data truthful and consistent with visible functionality. No invented reviews, certifications or guarantees.
- Preserve crawler/content-use preferences; search discovery is not authorization for model training.
- Keep the no-login upload workflow, visitor isolation, limits and private backend credentials intact.
- Do not add login, MCP, OAuth placeholders or payment protocols solely for scanner points.
- Record run/session/checkpoints and rollback before long releases. Inspect current remote state before uploading and preserve old history.
- If using isitagentready.com, save actual output and time. Distinguish raw API checks, readiness level and browser-confirmed default-profile score. Never call it Google's SEO score or a ranking guarantee.
