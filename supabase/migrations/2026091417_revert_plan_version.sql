begin;

create or replace function public.dulus_revert_plan_version(p_plan uuid)
returns uuid
language plpgsql security definer set search_path='' as $$
declare
 current_plan public.dulus_plans%rowtype;
 previous_plan public.dulus_plans%rowtype;
 decision_id uuid;
begin
 if auth.uid() is null then raise exception 'Inicia sesión'; end if;
 select * into current_plan from public.dulus_plans where id=p_plan for update;
 if current_plan.id is null or current_plan.supersedes_plan_id is null then raise exception 'Esta rutina no tiene una versión anterior para restaurar'; end if;
 if current_plan.created_by<>auth.uid() or current_plan.end_date is not null then raise exception 'Solo puedes deshacer tu versión activa más reciente'; end if;
 if exists(select 1 from public.dulus_sessions where plan_id=current_plan.id) then raise exception 'No se puede deshacer porque esta versión ya tiene sesiones registradas'; end if;
 select * into previous_plan from public.dulus_plans where id=current_plan.supersedes_plan_id for update;
 if previous_plan.id is null or previous_plan.created_by<>auth.uid() then raise exception 'No se encontró una versión anterior válida'; end if;
 if previous_plan.end_date is null or previous_plan.end_date<>current_plan.start_date-1 then raise exception 'La cadena de versiones cambió; actualiza antes de deshacer'; end if;
 update public.dulus_plans set end_date=null where id=previous_plan.id;
 select id into decision_id
 from public.dulus_coach_decisions
 where student_id=current_plan.student_id
   and created_by=auth.uid()
   and category='routine'
   and effective_on=current_plan.start_date
   and summary='Nueva versión de rutina: '||current_plan.name
   and created_at>=current_plan.created_at
 order by created_at desc
 limit 1;
 if decision_id is not null then delete from public.dulus_coach_decisions where id=decision_id; end if;
 delete from public.dulus_plans where id=current_plan.id;
 return previous_plan.id;
end $$;

revoke all on function public.dulus_revert_plan_version(uuid) from public,anon;
grant execute on function public.dulus_revert_plan_version(uuid) to authenticated;

commit;
