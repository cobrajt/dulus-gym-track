begin;

create table if not exists public.dulus_performance_entries(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.dulus_students(id) on delete cascade,
 metric text not null check(metric in ('vertical_jump','broad_jump','sprint_10m','sprint_20m','sprint_40m','pullups','plank')),
 value numeric(10,2) not null check(value>0 and value<100000),
 unit text not null check(unit in ('cm','s','reps')),
 measured_on date not null check(measured_on<=current_date),
 note text not null default '' check(length(note)<=500),
 recorded_by uuid not null default auth.uid() references public.dulus_accounts(id),
 created_at timestamptz not null default now()
);
create index if not exists dulus_performance_entries_student on public.dulus_performance_entries(student_id,measured_on);
alter table public.dulus_performance_entries enable row level security;
revoke all on public.dulus_performance_entries from anon,authenticated;
grant select,insert,delete on public.dulus_performance_entries to authenticated;
create policy performance_entry_read on public.dulus_performance_entries for select to authenticated using(exists(select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id where s.id=student_id and (s.user_id=(select auth.uid()) or t.owner_id=(select auth.uid()))));
create policy performance_entry_insert on public.dulus_performance_entries for insert to authenticated with check(recorded_by=(select auth.uid()) and exists(select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id where s.id=student_id and (s.user_id=(select auth.uid()) or t.owner_id=(select auth.uid()))));
create policy performance_entry_delete on public.dulus_performance_entries for delete to authenticated using(exists(select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id where s.id=student_id and (s.user_id=(select auth.uid()) or t.owner_id=(select auth.uid()))));

create table if not exists public.dulus_performance_goals(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.dulus_students(id) on delete cascade,
 metric text not null check(metric in ('e1rm','vertical_jump','broad_jump','sprint_10m','sprint_20m','sprint_40m','pullups','plank')),
 exercise_id text,
 start_value numeric(10,2),
 target_value numeric(10,2) not null check(target_value>0 and target_value<100000),
 unit text not null check(unit in ('kg','cm','s','reps')),
 target_date date,
 note text not null default '' check(length(note)<=500),
 created_by uuid not null default auth.uid() references public.dulus_accounts(id),
 active boolean not null default true,
 created_at timestamptz not null default now(),
 check((metric='e1rm' and exercise_id is not null) or (metric<>'e1rm' and exercise_id is null))
);
alter table public.dulus_performance_goals enable row level security;
revoke all on public.dulus_performance_goals from anon,authenticated;
grant select on public.dulus_performance_goals to authenticated;
create policy performance_goal_read on public.dulus_performance_goals for select to authenticated using(exists(select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id where s.id=student_id and (s.user_id=(select auth.uid()) or t.owner_id=(select auth.uid()))));

create function public.dulus_save_performance_goal(p_student uuid,p_metric text,p_exercise text,p_start numeric,p_target numeric,p_unit text,p_date date,p_note text default '') returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id where s.id=p_student and (s.user_id=auth.uid() or t.owner_id=auth.uid())) then raise exception 'No puedes editar este perfil'; end if;
 if p_metric not in ('e1rm','vertical_jump','broad_jump','sprint_10m','sprint_20m','sprint_40m','pullups','plank') then raise exception 'Métrica no válida'; end if;
 if p_target is null or p_target<=0 then raise exception 'Objetivo no válido'; end if;
 if (p_metric='e1rm' and p_exercise is null) or (p_metric<>'e1rm' and p_exercise is not null) then raise exception 'Ejercicio no válido'; end if;
 insert into public.dulus_performance_goals(student_id,metric,exercise_id,start_value,target_value,unit,target_date,note,created_by)
 values(p_student,p_metric,p_exercise,p_start,p_target,p_unit,p_date,coalesce(left(p_note,500),''),auth.uid()) returning id into result;
 return result;
end $$;

create function public.dulus_close_performance_goal(p_goal uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 update public.dulus_performance_goals g set active=false where g.id=p_goal and exists(select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id where s.id=g.student_id and (s.user_id=auth.uid() or t.owner_id=auth.uid()));
 if not found then raise exception 'Meta no disponible'; end if;
end $$;
create function public.dulus_delete_performance_goal(p_goal uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 delete from public.dulus_performance_goals g where g.id=p_goal and exists(select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id where s.id=g.student_id and (s.user_id=auth.uid() or t.owner_id=auth.uid()));
 if not found then raise exception 'Meta no disponible'; end if;
end $$;

revoke all on function public.dulus_save_performance_goal(uuid,text,text,numeric,numeric,text,date,text),public.dulus_close_performance_goal(uuid),public.dulus_delete_performance_goal(uuid) from public,anon;
grant execute on function public.dulus_save_performance_goal(uuid,text,text,numeric,numeric,text,date,text),public.dulus_close_performance_goal(uuid),public.dulus_delete_performance_goal(uuid) to authenticated;

do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='dulus_performance_entries') then alter publication supabase_realtime add table public.dulus_performance_entries; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='dulus_performance_goals') then alter publication supabase_realtime add table public.dulus_performance_goals; end if;
end $$;

commit;
