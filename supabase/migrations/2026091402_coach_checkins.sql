begin;
create table public.dulus_checkins(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.dulus_students(id) on delete cascade,
 author_id uuid not null default auth.uid() references public.dulus_accounts(id),
 body text not null check(length(trim(body)) between 1 and 2000),
 seen_at timestamptz,
 created_at timestamptz not null default now()
);
create index dulus_checkins_student_created on public.dulus_checkins(student_id,created_at desc);
alter table public.dulus_checkins enable row level security;
revoke all on public.dulus_checkins from anon,authenticated;
grant select,insert on public.dulus_checkins to authenticated;
grant update(seen_at) on public.dulus_checkins to authenticated;
create policy checkin_read on public.dulus_checkins for select to authenticated using(exists(
 select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id
 where s.id=student_id and (s.user_id=(select auth.uid()) or t.owner_id=(select auth.uid()))
));
create policy checkin_coach_insert on public.dulus_checkins for insert to authenticated with check(
 author_id=(select auth.uid()) and exists(select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id where s.id=student_id and t.owner_id=(select auth.uid()))
);
create policy checkin_student_seen on public.dulus_checkins for update to authenticated using(exists(select 1 from public.dulus_students s where s.id=student_id and s.user_id=(select auth.uid()))) with check(exists(select 1 from public.dulus_students s where s.id=student_id and s.user_id=(select auth.uid())));
do $$ begin if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='dulus_checkins') then alter publication supabase_realtime add table public.dulus_checkins; end if; end $$;
commit;