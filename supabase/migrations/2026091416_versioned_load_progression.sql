begin;

create or replace function public.dulus_apply_load_progression(
 p_plan uuid,
 p_exercise text,
 p_weight numeric,
 p_label text,
 p_reason text
) returns void language plpgsql security definer set search_path='' as $$
declare
 v_plan public.dulus_plans%rowtype;
 v_student uuid;
 v_old numeric;
 v_label text;
 v_exercises jsonb;
 v_last_session date;
 v_effective date;
begin
 if auth.uid() is null then raise exception 'Inicia sesión'; end if;
 if p_weight is null or p_weight<=0 or p_weight>1000 then raise exception 'Carga no válida'; end if;
 if length(trim(coalesce(p_reason,'')))<3 then raise exception 'Explica brevemente el motivo'; end if;
 select * into v_plan from public.dulus_plans where id=p_plan for update;
 if v_plan.id is null or v_plan.created_by<>auth.uid() or v_plan.end_date is not null then raise exception 'Solo puedes modificar una rutina activa creada por ti'; end if;
 select (x.item->>'weightKg')::numeric into v_old from jsonb_array_elements(v_plan.exercises) x(item) where x.item->>'exerciseId'=p_exercise limit 1;
 if v_old is null or v_old<=0 then raise exception 'Esta progresión necesita una carga previa mayor que cero'; end if;
 if p_weight<=v_old then raise exception 'La nueva carga debe ser mayor que la actual'; end if;
 if not exists(
  select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id
  where s.id=v_plan.student_id and t.owner_id=auth.uid()
 ) then raise exception 'Solo el coach del equipo puede aplicar este cambio'; end if;
 select jsonb_agg(
  case when x.item->>'exerciseId'=p_exercise then jsonb_set(x.item,'{weightKg}',to_jsonb(p_weight),true) else x.item end
  order by x.ord
 ) into v_exercises
 from jsonb_array_elements(v_plan.exercises) with ordinality x(item,ord);
 select max(date) into v_last_session from public.dulus_sessions where plan_id=p_plan;
 v_effective:=greatest(current_date,coalesce(v_last_session+1,current_date));
 if v_effective=v_plan.start_date and v_last_session is null then
  update public.dulus_plans set exercises=v_exercises where id=p_plan;
 else
  update public.dulus_plans set end_date=v_effective-1 where id=p_plan;
  insert into public.dulus_plans(student_id,name,start_date,days,exercises,created_by,supersedes_plan_id)
  values(v_plan.student_id,v_plan.name,v_effective,v_plan.days,v_exercises,auth.uid(),v_plan.id);
 end if;
 v_label=coalesce(nullif(trim(p_label),''),p_exercise);
 insert into public.dulus_coach_decisions(student_id,category,summary,reason,effective_on,created_by)
 values(v_plan.student_id,'load',left(v_label||': '||v_old||' → '||p_weight||' kg',240),left(trim(p_reason),1200),v_effective,auth.uid());
end $$;

revoke all on function public.dulus_apply_load_progression(uuid,text,numeric,text,text) from public,anon;
grant execute on function public.dulus_apply_load_progression(uuid,text,numeric,text,text) to authenticated;

commit;
