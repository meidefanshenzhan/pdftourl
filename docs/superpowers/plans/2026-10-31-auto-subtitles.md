# Auto Subtitles Implementation Plan
Date: 2026-10-31
Goal: bilingual KJAMZ video/audio transcription, editable timed captions, optional one-language translation and SRT/VTT export.
Owner approved lightweight version. Agent chooses 3 successful jobs per visitor per Beijing calendar day, 5-minute/25-MB input cap, 60-minute global daily audio reservation; no public global progress bar.
Approaches: Groq Whisper for accurate timestamp output + Cloudflare translation (preferred); Cloudflare Whisper fallback requires real sample validation; Replicate not selected (no durable free allowance).
- [ ] Test subtitle normalization, timing validation, escaping, export, quota reservation and provider errors.
- [ ] Implement backend with private credentials, bounded input and provider timeout, atomic visitor/global daily reservation, no retained audio. Failed jobs refund visitor quota; global budget remains conservatively reserved after provider dispatch.
- [ ] Build bilingual upload/preview/editor UI with remaining count and contact link; no auth/code bypass for paid resource budget. Browser duration is UX validation, server validates WAV PCM duration before inference. Convert video to 16kHz mono WAV locally with browser AudioContext; fail clearly for unsupported formats.
- [ ] Add translation using existing Cloudflare Workers AI binding only if verified; keep original cue IDs/timestamps, translate text only. Limit translated text, no silent truncation.
- [ ] Add shared SEO, home card, release v1.5.0 only after real provider verified; no placeholder tool release.
- [ ] Run build, tests, local GEO and browser tests; review, inspect remote state, deploy, run live GEO and real minimal sample smoke. Save evidence and rollback.
Privacy: no audio/text in logs or analytics events; audio transient in provider request, no S3 storage. Disclosure on upload. Do not use non-authorized existing files as provider test material.
Pending: Groq key or owner choice of Cloudflare-only provider. No paid account upgrades.
Rollback: prior Worker 299ee783-6abd-43a4-80da-01f08b190a1d; new tables additive and isolated from PDF quotas.
