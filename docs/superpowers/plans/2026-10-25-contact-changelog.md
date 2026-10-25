# KJAMZ contact consistency and changelog

Approved request: unify the contact page and audit other pages; Chinese Contact Us labels become 联系我们; add a small bilingual release-history page beside Contact Us in the shared footer. Keep contact form recipient hidden visually and working. Log real shipped changes only.

Implementation choice: static changelog at /zh/changelog/ and /en/changelog/, same KJAMZ style, dated entries with actual tool links and a suggestion link to contact. No automatic popup in this release: the owner asked for an opinion, not an explicit popup implementation. Recommend a later unobtrusive unread marker scoped to the browser if desired. No login or new storage.

- [x] Test shared footer translations and release-entry destinations.
- [x] Fix contact brand, site-wide contact wording, generic help copy, return-to-tools links and form subject.
- [x] Build bilingual changelog from a small shared entry list; add canonical pages, reciprocal hreflang and sitemap.
- [x] Run build/test/GEO, inspect desktop/mobile and form without sending messages, audit all headers and footers.
- [x] Review, sync GitHub, deploy existing Worker, verify production pages and record rollback.

Run ID: contact-changelog-2026-10-25. Backups/checkpoint: .local/contact-changelog-release/. Previous production version 41b41400-b394-4916-8141-c05ad383e7bb. Execute inline against existing workspace; preserve all existing changes and remote history.
