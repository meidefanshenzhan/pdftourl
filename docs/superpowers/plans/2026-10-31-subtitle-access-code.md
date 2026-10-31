# Subtitle shared access code plan
2026-10-31. Owner authorizes using same code as PDF for self/friends. No payment checkout requested; recommend contact-first.
- [x] Reuse existing POST/api/unlock and visitor-bound one-hour signed HttpOnly cookie; never embed code in public HTML/JS. Subtitle server validates cookie independently. Wrong code throttling remains existing10/hour/network.
- [x] Add trusted server-set privileged column and migration0004. Valid code bypasses ordinary browser3/day and ordinarynetwork6/day only; in-flight lock and global8jobs/1800seconds/day remain for every request. No user-supplied privilegeflag accepted. Private jobs do not consume ordinary quota.
- [x] Bilingual unobtrusive access-code panel, active-state message, expiry refresh before generation, clear contact-more-usage link to contact form. Retain input/editor/video state. No login/payment placeholder.
- [x] Tests first: signed/expired/forged authorization, ordinary/privileged/global caps, code absent from served JS/HTML; browser unlock with exhausted quota, wrongcode, retained edits; no real AI needed.
- [x] Build/test/GEO, review, inspect remote, additive migration, deploy v1.5.2, livechecks/GitHub/report/rollback.
Run ID subtitle-access-2026-10-31. Checkpoint .local/subtitle-access-release/. Prior Worker17f7d465-b18c-40cc-8515-9f230eb57cf4. Existing PDF secrets and auth workflow unchanged.

Complete: v1.5.2; Worker02daf1ce-2814-4d73-8769-08d42b1f7164;64 tests and localGEO20 passed; actual live shared-code unlock bothlanguages verified without AI calls;20 canonical mainhost pages verified. Legacy workers.dev DNS still fails fullliveGEO, documented. Securityreview no importantissues; localexpiry-state reset fixed and browser-tested even when refresh fails.
