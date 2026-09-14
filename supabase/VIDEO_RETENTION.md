# Technique video retention
Status: DEPLOYED AND ENABLED 2026-09-13 after explicit user confirmation. Real pg_net requests verified: authenticated dry-run 200, unauthenticated 401, active invocation 200 with deleted:0 (no expired files yet).
Policy: dulus-technique only; 7 days from storage.objects.created_at; hourly job at minute 17 UTC. Files may remain for up to one extra hour (or longer during outages); later runs retry. Messages, routines and sessions are never deleted. Includes orphan uploads. 100 oldest files per run.
Function: dulus-video-cleanup. Set verify_jwt=false because this server-only job validates its own 256-bit token through a service-role-only RPC BEFORE any deletion. The token is generated inside Vault and never copied into the browser app or Git. The built-in Edge service role key remains server-side. Public callers and students cannot invoke the privileged RPC or read its token.
Setup: apply 2026091302_video_retention.sql (disabled by default), deploy the Edge Function, test dry_run from SQL with the Vault header, inspect net._http_response. Do not log the header/token.
Activation (only after explicit confirmation): update dulus_private.video_retention set enabled=true where id;
Pause: update dulus_private.video_retention set enabled=false where id; (does not restore already removed files).
Cron status and errors: cron.job_run_details and net._http_response; non-2xx responses require investigation. There is no promise of email alerts.
Storage bytes MUST be removed through Storage API, not SQL DELETE on storage.objects.
Sources: https://supabase.com/docs/guides/storage/management/delete-objects and https://supabase.com/docs/guides/functions/schedule-functions
