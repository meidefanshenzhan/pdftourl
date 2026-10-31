# Auto Subtitles Implementation Plan
Date: 2026-10-31
Goal: bilingual KJAMZ video/audio transcription, editable timed captions, optional one-language translation and SRT/VTT export.
Owner approved lightweight version. Agent chooses 3 successful jobs per visitor per Beijing calendar day, 5-minute/25-MB input cap, 60-minute global daily audio reservation; no public global progress bar.
Approaches: Groq Whisper for accurate timestamp output + Cloudflare translation (preferred); Cloudflare Whisper fallback requires real sample validation; Replicate not selected (no durable free allowance).
- [x] Test subtitle normalization, timing validation, escaping, export, quota reservation and provider errors.
- [x] Implement backend with private credentials, bounded input and provider timeout, atomic visitor/global daily reservation, no retained audio. Failed jobs refund visitor quota; global budget remains conservatively reserved after provider dispatch.
- [x] Build bilingual upload/preview/editor UI with remaining count and contact link; no auth/code bypass for paid resource budget. Browser duration is UX validation, server validates WAV PCM duration before inference. Convert video to 16kHz mono WAV locally with browser AudioContext; fail clearly for unsupported formats.
- [x] Add translation using existing Cloudflare Workers AI binding only if verified; keep original cue IDs/timestamps, translate text only. Limit translated text, no silent truncation.
- [x] Add shared SEO, home card, release v1.5.0 only after real provider verified; no placeholder tool release.
- [x] Run build, tests, local GEO and browser tests; review, inspect remote state, deploy, run live GEO and real minimal sample smoke. Save evidence and rollback.
Privacy: no audio/text in logs or analytics events; audio transient in provider request, no S3 storage. Disclosure on upload. Do not use non-authorized existing files as provider test material.
Pending: Groq key or owner choice of Cloudflare-only provider. No paid account upgrades.
Rollback: prior Worker 299ee783-6abd-43a4-80da-01f08b190a1d; new tables additive and isolated from PDF quotas.

Final ruling: owner selected Cloudflare-only. Real Whisper+translation smoke succeeded using the existing account; Groq was not configured. Daily global cap is 8 jobs/1800s, network cap6, browser cap3. All20 canonical pages verified live. Legacy workers.dev DNS failure recorded separately. Deployed543b037f-b5bc-4acd-b2b0-39c32c4032a8; code8ecae979f42a4f7586a8c0886893626c30242064.
