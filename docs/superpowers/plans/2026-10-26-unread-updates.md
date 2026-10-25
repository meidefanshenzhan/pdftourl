# Unread update marker

Approved scope: quiet update indicator, SEO naming advice, sensible release-note granularity. Keep /text-dedupe/ canonical URLs; English public display name Duplicate Text Remover, existing exact duplicate-lines/words title retained. text remover can mean removing image text; no unrelated keyword replacement.

Design: shared footer Changelog link has a small green dot + 有更新 / New label. No popup, animation or login. First visit shows latest published update as unread; visiting the actual changelog marks its release ID read only in this browser. New releases re-enable it; storage failure suppresses badge, never blocks tools. Other tabs synchronize on the storage event. PDF's client-side locale switch preserves marker structure and translates it. Static page stays useful without JavaScript.

Only substantive features/improvements get public release entries; small copy/spacing changes need not. Add v1.2.2 on 2026-10-26 for unread update marker, no separate naming entry.

- [ ] Test read-state/version change/storage failure.
- [ ] Implement shared footer module and styling; integrate localized display name.
- [ ] Build/test/GEO; browser unread/read/new-release/storage-blocked/multi-tab/locale tests.
- [ ] Fresh review, preserve remote history, deploy existing worker and verify live.

Checkpoint .local/unread-updates-release/. Previous production d42248e3-1791-439b-bb90-ed0e4a1a86a2. Keep raw deployment and verification evidence. No user text stored by marker.
