begin;

alter table public.dulus_plans add column if not exists end_date date;
alter table public.dulus_plans add column if not exists supersedes_plan_id uuid references public.dulus_plans(id) on delete set null;
alter table public.dulus_plans drop constraint if exists dulus_plans_end_date_check;
alter table public.dulus_plans add constraint dulus_plans_end_date_check check(end_date is null or end_date>=start_date);
create index if not exists dulus_plans_active_window on public.dulus_plans(student_id,start_date,end_date);

create or replace function public.dulus_replace_plan_version(
 p_plan uuid,
 p_name text,
 p_exercises jsonb,
 p_effective date,
 p_reason text default ''
) returns uuid
language plpgsql security definer set search_path='' as $$
declare old_plan public.dulus_plans%rowtype;
declare student_owner uuid;
declare team_owner uuid;
declare new_id uuid;
declare last_session date;
begin
 if auth.uid() is null then raise exception 'Inicia sesión'; end if;
 select * into old_plan from public.dulus_plans where id=p_plan for update;
 if old_plan.id is null then raise exception 'Rutina no encontrada'; end if;
 select s.user_id,t.owner_id into student_owner,team_owner
 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id
 where s.id=old_plan.student_id;
 if old_plan.created_by<>auth.uid() then raise exception 'Solo quien creó esta rutina puede editarla directamente'; end if;
 if auth.uid()<>student_owner and auth.uid()<>team_owner then raise exception 'No puedes editar esta rutina'; end if;
 if old_plan.end_date is not null then raise exception 'Esta versión ya está cerrada'; end if;
 if p_name is null or length(trim(p_name)) not between 1 and 120 then raise exception 'Nombre no válido'; end if;
 if p_exercises is null or jsonb_typeof(p_exercises)<>'array' or jsonb_array_length(p_exercises) not between 1 and 100 then raise exception 'Ejercicios no válidos'; end if;
 if p_effective is null or p_effective<current_date or p_effective<old_plan.start_date then raise exception 'Fecha de aplicación no válida'; end if;
 select max(date) into last_session from public.dulus_sessions where plan_id=p_plan;
 if last_session is not null and p_effective<=last_session then raise exception 'Aplica el cambio después de la última sesión registrada'; end if;
 if p_effective=old_plan.start_date and last_session is null then
  update public.dulus_plans set name=trim(p_name),exercises=p_exercises where id=p_plan;
  new_id:=p_plan;
 else
  update public.dulus_plans set end_date=p_effective-1 where id=p_plan;
  insert into public.dulus_plans(student_id,name,start_date,days,exercises,created_by,supersedes_plan_id)
  values(old_plan.student_id,trim(p_name),p_effective,old_plan.days,p_exercises,auth.uid(),old_plan.id)
  returning id into new_id;
 end if;
 if team_owner=auth.uid() then
  if length(trim(coalesce(p_reason,'')))<3 then raise exception 'Explica brevemente por qué cambiaste la rutina'; end if;
  insert into public.dulus_coach_decisions(student_id,category,summary,reason,effective_on,created_by)
  values(old_plan.student_id,'routine','Nueva versión de rutina: '||trim(p_name),trim(p_reason),p_effective,auth.uid());
 end if;
 return new_id;
end $$;

revoke all on function public.dulus_replace_plan_version(uuid,text,jsonb,date,text) from public,anon;
grant execute on function public.dulus_replace_plan_version(uuid,text,jsonb,date,text) to authenticated;

commit;
