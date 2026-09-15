begin;

create table if not exists public.dulus_coach_decisions(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.dulus_students(id) on delete cascade,
 category text not null check(category in ('load','volume','exercise','routine','recovery','technique','schedule','goal','other')),
 summary text not null check(length(trim(summary)) between 3 and 240),
 reason text not null check(length(trim(reason)) between 3 and 1200),
 effective_on date not null default current_date check(effective_on<=current_date),
 created_by uuid not null default auth.uid() references public.dulus_accounts(id),
 created_at timestamptz not null default now()
);

create index if not exists dulus_coach_decisions_student_date on public.dulus_coach_decisions(student_id,effective_on desc,created_at desc);
alter table public.dulus_coach_decisions enable row level security;
revoke all on public.dulus_coach_decisions from anon,authenticated;
grant select,insert,delete on public.dulus_coach_decisions to authenticated;
create policy coach_decision_read on public.dulus_coach_decisions for select to authenticated using(
 exists(select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id where s.id=student_id and (s.user_id=(select auth.uid()) or t.owner_id=(select auth.uid())))
);

create policy coach_decision_insert on public.dulus_coach_decisions for insert to authenticated with check(
 created_by=(select auth.uid()) and exists(select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id where s.id=student_id and t.owner_id=(select auth.uid()))
);

create policy coach_decision_delete on public.dulus_coach_decisions for delete to authenticated using(
 exists(select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id where s.id=student_id and t.owner_id=(select auth.uid()))
);

create function public.dulus_save_coach_decision(p_student uuid,p_category text,p_summary text,p_reason text,p_effective date default current_date) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id where s.id=p_student and t.owner_id=auth.uid()) then raise exception 'Solo el coach del equipo puede registrar ajustes'; end if;
 if p_effective is null or p_effective>current_date then raise exception 'Fecha no válida'; end if;
 insert into public.dulus_coach_decisions(student_id,category,summary,reason,effective_on,created_by)
 values(p_student,p_category,trim(p_summary),trim(p_reason),p_effective,auth.uid()) returning id into result;
 return result;
end $$;
create function public.dulus_delete_coach_decision(p_decision uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 delete from public.dulus_coach_decisions d where d.id=p_decision and exists(select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id where s.id=d.student_id and t.owner_id=auth.uid());
 if not found then raise exception 'Ajuste no disponible'; end if;
end $$;

revoke all on function public.dulus_save_coach_decision(uuid,text,text,text,date),public.dulus_delete_coach_decision(uuid) from public,anon;
grant execute on function public.dulus_save_coach_decision(uuid,text,text,text,date),public.dulus_delete_coach_decision(uuid) to authenticated;

do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='dulus_coach_decisions') then alter publication supabase_realtime add table public.dulus_coach_decisions; end if;
end $$;

commit;
