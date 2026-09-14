begin;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
create schema if not exists dulus_private;
revoke all on schema dulus_private from public,anon,authenticated;
create table if not exists dulus_private.video_retention(id boolean primary key default true check(id), enabled boolean not null default false);
alter table dulus_private.video_retention enable row level security;
insert into dulus_private.video_retention(id) values(true) on conflict do nothing;
revoke all on dulus_private.video_retention from public,anon,authenticated;
do $$ begin
 if not exists(select 1 from vault.secrets where name='dulus_video_cleanup_token') then
  perform vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'dulus_video_cleanup_token','Private hourly technique-video cleanup');
 end if;
end $$;
create or replace function public.dulus_video_cleanup_context(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare expected text; result jsonb;
begin
 select decrypted_secret into expected from vault.decrypted_secrets where name='dulus_video_cleanup_token';
 if expected is null or p_token is null or length(p_token)<>64 or extensions.digest(p_token,'sha256')<>extensions.digest(expected,'sha256') then raise exception 'Unauthorized cleanup' using errcode='42501'; end if;
 select jsonb_build_object('enabled',(select enabled from dulus_private.video_retention where id),
  'paths',coalesce((select jsonb_agg(q.name) from (select o.name from storage.objects o where o.bucket_id='dulus-technique' and o.created_at<=now()-interval '7 days' order by o.created_at,o.name limit 100) q),'[]'::jsonb)) into result;
 return result;
end $$;
revoke all on function public.dulus_video_cleanup_context(text) from public,anon,authenticated;
grant execute on function public.dulus_video_cleanup_context(text) to service_role;
create or replace function public.dulus_video_retention_status() returns jsonb language sql security definer set search_path='' as $$
 select jsonb_build_object('enabled',enabled,'days',7) from dulus_private.video_retention where id;
$$;
revoke all on function public.dulus_video_retention_status() from public,anon;
grant execute on function public.dulus_video_retention_status() to authenticated;
select cron.schedule('dulus-technique-retention','17 * * * *',$job$
 select net.http_post(url:='https://rnrciqyngdequkbmttxu.supabase.co/functions/v1/dulus-video-cleanup',
 headers:=jsonb_build_object('Content-Type','application/json','x-cleanup-token',(select decrypted_secret from vault.decrypted_secrets where name='dulus_video_cleanup_token')),
 body:='{}'::jsonb,timeout_milliseconds:=60000)
 where (select enabled from dulus_private.video_retention where id);
$job$);
commit;
