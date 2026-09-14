-- Explicitly approved and applied 2026-09-13 after deployed-function checks.
-- Deploy dulus-video-cleanup before applying this activation.
update dulus_private.video_retention set enabled=true where id;
