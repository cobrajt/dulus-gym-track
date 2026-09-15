begin;

create or replace function public.dulus_leave_team(p_team uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare target_student uuid;
begin
 if auth.uid() is null then raise exception 'Debes iniciar sesion'; end if;
 select s.id into target_student
 from public.dulus_students s
 where s.user_id=auth.uid() and s.team_id=p_team
 for update;
 if target_student is null then raise exception 'No estas vinculado a este equipo'; end if;
 if not exists(
  select 1 from public.dulus_members m
  where m.team_id=p_team and m.user_id=auth.uid() and m.role='student'
 ) then raise exception 'El vinculo ya no esta activo'; end if;
 update public.dulus_students set team_id=null where id=target_student;
 delete from public.dulus_members
 where team_id=p_team and user_id=auth.uid() and role='student';
 delete from public.dulus_agenda_snoozes where student_id=target_student;
 return target_student;
end $$;

create or replace function public.dulus_remove_student(p_student uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare target public.dulus_students;
begin
 if auth.uid() is null then raise exception 'Debes iniciar sesion'; end if;
 select * into target from public.dulus_students where id=p_student for update; if target.id is null or target.team_id is null then raise exception 'El alumno ya no esta vinculado'; end if;
 if not exists(
  select 1 from public.dulus_teams t
  where t.id=target.team_id and t.owner_id=auth.uid()
 ) then raise exception 'Solo el coach del equipo puede finalizar este vinculo'; end if;
 update public.dulus_students set team_id=null where id=target.id;
 delete from public.dulus_members
 where team_id=target.team_id and user_id=target.user_id and role='student';
 delete from public.dulus_agenda_snoozes where student_id=target.id;
 return target.id;
end $$;

revoke all on function public.dulus_leave_team(uuid),public.dulus_remove_student(uuid) from public,anon;
grant execute on function public.dulus_leave_team(uuid),public.dulus_remove_student(uuid) to authenticated;

commit;
