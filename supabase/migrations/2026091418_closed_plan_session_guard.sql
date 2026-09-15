begin;

create or replace function public.dulus_record_session(p_plan uuid,p_date date,p_completed text[])
returns uuid language plpgsql security definer set search_path='' as $$
declare plan public.dulus_plans; result uuid; ids text[];
begin
 select * into plan from public.dulus_plans where id=p_plan;
 if auth.uid() is null or not exists(
  select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id
  where s.id=plan.student_id and (s.user_id=auth.uid() or t.owner_id=auth.uid())
 ) then raise exception 'No puedes registrar esta rutina'; end if;
 if p_date is null or p_date<plan.start_date or p_date>current_date or (plan.end_date is not null and p_date>plan.end_date)
 then raise exception 'Fecha fuera del periodo de esta versión'; end if;
 select array_agg(distinct x) into ids from unnest(p_completed) x;
 if coalesce(cardinality(ids),0)=0 or exists(
  select 1 from unnest(ids) x where x is null or not exists(
   select 1 from jsonb_array_elements(plan.exercises) e where e->>'exerciseId'=x
  )
 ) then raise exception 'Selecciona ejercicios de esta rutina'; end if;
 insert into public.dulus_sessions(plan_id,date,completed_ids,total_exercises,recorded_by)
 values(p_plan,p_date,ids,jsonb_array_length(plan.exercises),auth.uid())
 on conflict(plan_id,date) do update set
  completed_ids=excluded.completed_ids,
  total_exercises=excluded.total_exercises,
  recorded_by=excluded.recorded_by,
  updated_at=now()
 returning id into result;
 return result;
end $$;

revoke all on function public.dulus_record_session(uuid,date,text[]) from public,anon;
grant execute on function public.dulus_record_session(uuid,date,text[]) to authenticated;

commit;
