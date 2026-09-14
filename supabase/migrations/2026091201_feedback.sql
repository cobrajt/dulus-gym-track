begin;
alter table public.dulus_sessions add column if not exists details jsonb not null default '{}'::jsonb;
create table public.dulus_messages(
 id uuid primary key default gen_random_uuid(),
 plan_id uuid not null references public.dulus_plans(id),
 exercise_id text not null,
 author_id uuid not null default auth.uid() references public.dulus_accounts(id),
 body text not null default '' check(length(body)<=2000),
 video_path text,
 created_at timestamptz not null default now(),
 check(length(trim(body))>0 or video_path is not null)
);
alter table public.dulus_messages enable row level security;
revoke all on public.dulus_messages from anon,authenticated;
grant select,insert on public.dulus_messages to authenticated;
create policy message_read on public.dulus_messages for select to authenticated using(exists(select 1 from public.dulus_plans p where p.id=plan_id));
create policy message_write on public.dulus_messages for insert to authenticated with check(
 author_id=(select auth.uid()) and exists(select 1 from public.dulus_plans p where p.id=plan_id and exists(select 1 from jsonb_array_elements(p.exercises) e where e->>'exerciseId'=exercise_id))
 and (video_path is null or (split_part(video_path,'/',1)=plan_id::text and split_part(video_path,'/',2)=(select auth.uid())::text and exists(select 1 from storage.objects o where o.bucket_id='dulus-technique' and o.name=video_path)))
);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('dulus-technique','dulus-technique',false,20971520,array['video/mp4','video/webm','video/quicktime']) on conflict(id) do nothing;
create policy dulus_video_read on storage.objects for select to authenticated using(bucket_id='dulus-technique' and exists(select 1 from public.dulus_plans p where p.id::text=split_part(name,'/',1)));
create policy dulus_video_upload on storage.objects for insert to authenticated with check(bucket_id='dulus-technique' and split_part(name,'/',2)=(select auth.uid())::text and exists(select 1 from public.dulus_plans p where p.id::text=split_part(name,'/',1)));
create policy dulus_video_remove on storage.objects for delete to authenticated using(bucket_id='dulus-technique' and split_part(name,'/',2)=(select auth.uid())::text and exists(select 1 from public.dulus_plans p where p.id::text=split_part(name,'/',1)));
create function public.dulus_finish_session(p_plan uuid,p_date date,p_completed text[],p_details jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; item jsonb; plan public.dulus_plans;
begin
 if p_details is null or jsonb_typeof(p_details)<>'object' or octet_length(p_details::text)>100000 then raise exception 'Registro no valido'; end if;
 if jsonb_typeof(p_details->'exercises')<>'array' or jsonb_array_length(p_details->'exercises')>100 then raise exception 'Ejercicios no validos'; end if;
 if coalesce((p_details->>'effort')::numeric,0) not between 0 and 10 or coalesce((p_details->>'fatigue')::numeric,0) not between 0 and 10 or coalesce((p_details->>'pain')::numeric,0) not between 0 and 10 then raise exception 'Escalas fuera de rango'; end if;
 result:=public.dulus_record_session(p_plan,p_date,p_completed);
 select * into plan from public.dulus_plans where id=p_plan;
 for item in select * from jsonb_array_elements(p_details->'exercises') loop
  if not exists(select 1 from jsonb_array_elements(plan.exercises) e where e->>'exerciseId'=item->>'exerciseId') or
   coalesce((item->>'weightKg')::numeric,0) not between 0 and 1000 or coalesce((item->>'reps')::numeric,0) not between 0 and 100 or coalesce((item->>'rir')::numeric,0) not between 0 and 10 then raise exception 'Carga no valida'; end if;
 end loop;
 update public.dulus_sessions set details=p_details where id=result;
 return result;
end $$;
revoke all on function public.dulus_finish_session(uuid,date,text[],jsonb) from public,anon;
grant execute on function public.dulus_finish_session(uuid,date,text[],jsonb) to authenticated;
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='dulus_sessions') then alter publication supabase_realtime add table public.dulus_sessions; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='dulus_messages') then alter publication supabase_realtime add table public.dulus_messages; end if;
end $$;
commit;