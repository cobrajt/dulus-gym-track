begin;
-- One account keeps one student identity. It may start without a team and later link to a coach.
do $$ begin
 if exists(select user_id from public.dulus_students group by user_id having count(*)>1) then
  raise exception 'No se puede activar perfil unico: existen usuarios con mas de un perfil de alumno';
 end if;
end $$;
alter table public.dulus_students alter column team_id drop not null;
create unique index if not exists dulus_students_user_unique on public.dulus_students(user_id);

alter table public.dulus_plans add column if not exists created_by uuid references public.dulus_accounts(id);
update public.dulus_plans p set created_by=coalesce(
 (select t.owner_id from public.dulus_students s join public.dulus_teams t on t.id=s.team_id where s.id=p.student_id),
 (select s.user_id from public.dulus_students s where s.id=p.student_id)
) where created_by is null;
alter table public.dulus_plans alter column created_by set default auth.uid();
alter table public.dulus_plans alter column created_by set not null;

drop policy if exists student_access on public.dulus_students;
create policy student_access on public.dulus_students for select to authenticated using(
 user_id=(select auth.uid()) or exists(select 1 from public.dulus_teams t where t.id=team_id and t.owner_id=(select auth.uid()))
);
drop policy if exists coach_goals on public.dulus_students;
create policy student_goals on public.dulus_students for update to authenticated using(
 user_id=(select auth.uid()) or exists(select 1 from public.dulus_teams t where t.id=team_id and t.owner_id=(select auth.uid()))
) with check(user_id=(select auth.uid()) or exists(select 1 from public.dulus_teams t where t.id=team_id and t.owner_id=(select auth.uid())));

drop policy if exists coach_plan on public.dulus_plans;
create policy plan_create on public.dulus_plans for insert to authenticated with check(
 created_by=(select auth.uid()) and exists(
  select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id
  where s.id=student_id and (s.user_id=(select auth.uid()) or t.owner_id=(select auth.uid()))
 )
);

create or replace function public.dulus_solo_available() returns boolean language sql stable security definer set search_path='' as $$ select auth.uid() is not null $$;

create or replace function public.dulus_ensure_solo_student() returns uuid language plpgsql security definer set search_path='' as $$
declare student uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.dulus_accounts where id=auth.uid()) then raise exception 'Completa tu perfil primero'; end if;
 select id into student from public.dulus_students where user_id=auth.uid() for update;
 if student is null then
  insert into public.dulus_students(team_id,user_id,name) select null,id,display_name from public.dulus_accounts where id=auth.uid() returning id into student;
 end if;
 return student;
end $$;

create or replace function public.dulus_open_student(p_team uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare student uuid; existing_team uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.dulus_members where team_id=p_team and user_id=auth.uid() and role='student') then raise exception 'Debes unirte al equipo como alumno'; end if;
 select id,team_id into student,existing_team from public.dulus_students where user_id=auth.uid() for update;
 if student is null then
  insert into public.dulus_students(team_id,user_id,name) select p_team,id,display_name from public.dulus_accounts where id=auth.uid() returning id into student;
 elsif existing_team is null then update public.dulus_students set team_id=p_team where id=student;
 elsif existing_team<>p_team then raise exception 'Tu perfil ya esta vinculado a otro equipo';
 end if;
 return student;
end $$;

create or replace function public.dulus_join_team(p_token uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare invitation public.dulus_invitations; student uuid; existing_team uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.dulus_accounts where id=auth.uid()) then raise exception 'Completa tu perfil primero'; end if;
 select * into invitation from public.dulus_invitations where token=p_token and expires_at>now() and used_by is null for update;
 if not found then raise exception 'Invitacion no valida, usada o vencida'; end if;
 select id,team_id into student,existing_team from public.dulus_students where user_id=auth.uid() for update;
 if existing_team is not null and existing_team<>invitation.team_id then raise exception 'Tu perfil ya esta vinculado a otro equipo'; end if;
 insert into public.dulus_members(team_id,user_id,role) values(invitation.team_id,auth.uid(),'student') on conflict do nothing;
 if student is null then
  insert into public.dulus_students(team_id,user_id,name) select invitation.team_id,id,display_name from public.dulus_accounts where id=auth.uid();
 elsif existing_team is null then update public.dulus_students set team_id=invitation.team_id where id=student;
 end if;
 update public.dulus_invitations set used_by=auth.uid() where token=p_token;
 return invitation.team_id;
end $$;

create or replace function public.dulus_record_session(p_plan uuid,p_date date,p_completed text[]) returns uuid language plpgsql security definer set search_path='' as $$
declare plan public.dulus_plans; result uuid; ids text[];
begin
 select * into plan from public.dulus_plans where id=p_plan;
 if auth.uid() is null or not exists(select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id where s.id=plan.student_id and (s.user_id=auth.uid() or t.owner_id=auth.uid())) then raise exception 'No puedes registrar esta rutina'; end if;
 if p_date is null or p_date<plan.start_date or p_date>current_date then raise exception 'Fecha fuera del periodo de la rutina'; end if;
 select array_agg(distinct x) into ids from unnest(p_completed) x;
 if coalesce(cardinality(ids),0)=0 or exists(select 1 from unnest(ids) x where x is null or not exists(select 1 from jsonb_array_elements(plan.exercises) e where e->>'exerciseId'=x)) then raise exception 'Selecciona ejercicios de esta rutina'; end if;
 insert into public.dulus_sessions(plan_id,date,completed_ids,total_exercises,recorded_by) values(p_plan,p_date,ids,jsonb_array_length(plan.exercises),auth.uid()) on conflict(plan_id,date) do update set completed_ids=excluded.completed_ids,total_exercises=excluded.total_exercises,recorded_by=excluded.recorded_by,updated_at=now() returning id into result;
 return result;
end $$;

revoke all on function public.dulus_solo_available(),public.dulus_ensure_solo_student(),public.dulus_open_student(uuid),public.dulus_join_team(uuid),public.dulus_record_session(uuid,date,text[]) from public,anon;
grant execute on function public.dulus_solo_available(),public.dulus_ensure_solo_student(),public.dulus_open_student(uuid),public.dulus_join_team(uuid),public.dulus_record_session(uuid,date,text[]) to authenticated;
commit;
