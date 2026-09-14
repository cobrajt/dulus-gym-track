begin;
create table public.dulus_students(
 id uuid primary key default gen_random_uuid(),
 team_id uuid not null references public.dulus_teams(id),
 user_id uuid not null references public.dulus_accounts(id),
 name text not null,
 goals text[] not null default '{}',
 created_at timestamptz not null default now(),
 unique(team_id,user_id)
);
create table public.dulus_plans(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.dulus_students(id),
 name text not null check(length(trim(name)) between 1 and 120),
 start_date date not null,
 days integer[] not null check(cardinality(days) between 1 and 7 and days <@ array[0,1,2,3,4,5,6]),
 exercises jsonb not null check(jsonb_typeof(exercises)='array' and jsonb_array_length(exercises) between 1 and 100),
 created_at timestamptz not null default now()
);
create index dulus_plans_student on public.dulus_plans(student_id);
create table public.dulus_sessions(
 id uuid primary key default gen_random_uuid(),
 plan_id uuid not null references public.dulus_plans(id),
 date date not null,
 completed_ids text[] not null,
 total_exercises integer not null,
 recorded_by uuid not null references public.dulus_accounts(id),
 updated_at timestamptz not null default now(),
 unique(plan_id,date)
);
alter table public.dulus_students enable row level security;
alter table public.dulus_plans enable row level security;
alter table public.dulus_sessions enable row level security;
revoke all on public.dulus_students,public.dulus_plans,public.dulus_sessions from anon,authenticated;
grant select on public.dulus_students,public.dulus_plans,public.dulus_sessions to authenticated;
grant update(goals) on public.dulus_students to authenticated;
grant insert(student_id,name,start_date,days,exercises) on public.dulus_plans to authenticated;
create policy student_access on public.dulus_students for select to authenticated using(
 exists(select 1 from public.dulus_teams t where t.id=team_id and t.owner_id=(select auth.uid()))
 or (user_id=(select auth.uid()) and exists(select 1 from public.dulus_members m where m.team_id=dulus_students.team_id and m.user_id=(select auth.uid())))
);
create policy coach_goals on public.dulus_students for update to authenticated using(exists(select 1 from public.dulus_teams t where t.id=team_id and t.owner_id=(select auth.uid()))) with check(exists(select 1 from public.dulus_teams t where t.id=team_id and t.owner_id=(select auth.uid())));
create policy plan_access on public.dulus_plans for select to authenticated using(exists(select 1 from public.dulus_students s where s.id=student_id));
create policy coach_plan on public.dulus_plans for insert to authenticated with check(exists(select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id where s.id=student_id and t.owner_id=(select auth.uid())));
create policy session_access on public.dulus_sessions for select to authenticated using(exists(select 1 from public.dulus_plans p where p.id=plan_id));
create function public.dulus_open_student(p_team uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare student uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.dulus_members where team_id=p_team and user_id=auth.uid() and role='student') then raise exception 'Debes unirte al equipo como alumno'; end if;
 insert into public.dulus_students(team_id,user_id,name) select p_team,id,display_name from public.dulus_accounts where id=auth.uid() on conflict(team_id,user_id) do nothing;
 select id into student from public.dulus_students where team_id=p_team and user_id=auth.uid();
 return student;
end $$;
create function public.dulus_record_session(p_plan uuid,p_date date,p_completed text[]) returns uuid language plpgsql security definer set search_path='' as $$
declare plan public.dulus_plans; result uuid; ids text[];
begin
 select * into plan from public.dulus_plans where id=p_plan;
 if auth.uid() is null or not exists(
 select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id
 where s.id=plan.student_id and (t.owner_id=auth.uid() or (s.user_id=auth.uid() and exists(select 1 from public.dulus_members m where m.team_id=s.team_id and m.user_id=auth.uid())))
 ) then raise exception 'No puedes registrar esta rutina'; end if;
 if p_date is null or p_date<plan.start_date or p_date>current_date then raise exception 'Fecha fuera del periodo de la rutina'; end if;
 select array_agg(distinct x) into ids from unnest(p_completed) x;
 if coalesce(cardinality(ids),0)=0 or exists(select 1 from unnest(ids) x where x is null or not exists(select 1 from jsonb_array_elements(plan.exercises) e where e->>'exerciseId'=x)) then raise exception 'Selecciona ejercicios de esta rutina'; end if;
 insert into public.dulus_sessions(plan_id,date,completed_ids,total_exercises,recorded_by) values(p_plan,p_date,ids,jsonb_array_length(plan.exercises),auth.uid())
 on conflict(plan_id,date) do update set completed_ids=excluded.completed_ids,total_exercises=excluded.total_exercises,recorded_by=excluded.recorded_by,updated_at=now()
 returning id into result;
 return result;
end $$;
revoke all on function public.dulus_open_student(uuid),public.dulus_record_session(uuid,date,text[]) from public,anon;
grant execute on function public.dulus_open_student(uuid),public.dulus_record_session(uuid,date,text[]) to authenticated;
commit;
