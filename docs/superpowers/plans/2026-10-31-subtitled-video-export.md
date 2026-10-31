# Subtitled MP4 Export Plan
2026-10-31. Owner requests video export as the primary page feature, editable translated subtitles, remove Cloudflare AI wording.
Approach: local single-thread ffmpeg.wasm, bundled same-origin assets and CJK font; no video upload and no additional AI requests for rendering. Single-thread avoids site-wide cross-origin isolation effects. Alternative server render adds compute/storage costs and is not selected.
Input investigation: owner's 202512020025.mp4 has one AAC audio stream only, no video. Explain audio-only metadata and render to a clearly stated solid background MP4; actual videos preserve their frames. Never suggest lost frames can be recovered.
- [x] Test MP4 stream detection, ASS escaping, render arguments, edited translated/bilingual cue export.
- [x] Self-host pinned ffmpeg/core assets split below Cloudflare25MiB/file, font with license and checksum; build reproducibly, no user media in Git.
- [x] Main prominent Download subtitled video button; preview result, progress/cancel/retry; freeze editing during render, invalidate output after edits/file/mode changes. Subtitle files secondary collapsed export.
- [x] Local video render: H264/AAC MP4, preserve aspect ratio with max1280edge, safe dimensions, audio-only720pbackground. ASS data file escapes commands, font supports CJK. Offline render must make zero AI calls and retain speech.
- [x] Remove named AI provider copy bothlanguages; retain brief truthful processing/privacy scope without vendor branding.
- [x] Verify actual owner's audio-only file locally, real synthetic H264 landscape/portrait and translated Chinese/Japanese text with ffprobe and rendered frames. Do not transmit owner's media to AI or public server.
- [x] Build,test,GEO,review, releasev1.5.1; inspect remote, deploy once, verify mainhost/live GEO, Github, report+rollback.
Run ID: subtitles-video-2026-10-31. Checkpoints: .local/subtitles-video-release/ . Rollback current543b037f-b5bc-4acd-b2b0-39c32c4032a8.

Completed: v1.5.1, Worker17f7d465-b18c-40cc-8515-9f230eb57cf4, Beijing2026-10-31 15:50. Localowner41s audio-only render and local/live synthetic landscape/portrait/audio renders verified. 60 tests passed, GEO20 local and20canonical mainhost verified. Legacy workers.dev DNS failure persists in fulllivecommand. Review SAR issue fixed with regression test. Assets generated from pinned npm dependencies; generated binaries intentionally ignored in Git, reproduced by npm ci && npm run build.
