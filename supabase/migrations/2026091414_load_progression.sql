begin;

create or replace function public.dulus_apply_load_progression(
 p_plan uuid,
 p_exercise text,
 p_weight numeric,
 p_label text,
 p_reason text
) returns void language plpgsql security definer set search_path='' as $$
declare
 v_student uuid;
 v_plan_name text;
 v_old numeric;
 v_label text;
begin
 if auth.uid() is null then raise exception 'Inicia sesión'; end if;
 if p_weight is null or p_weight<=0 or p_weight>1000 then raise exception 'Carga no válida'; end if;
 if length(trim(coalesce(p_reason,'')))<3 then raise exception 'Explica brevemente el motivo'; end if;
 select p.student_id,p.name,(x.item->>'weightKg')::numeric
 into v_student,v_plan_name,v_old
 from public.dulus_plans p
 cross join lateral jsonb_array_elements(p.exercises) x(item)
 where p.id=p_plan and x.item->>'exerciseId'=p_exercise and p.created_by=auth.uid();
 if v_student is null then raise exception 'Solo puedes modificar una rutina creada por ti'; end if;
 if v_old is null or v_old<=0 then raise exception 'Esta progresión necesita una carga previa mayor que cero'; end if;
 if p_weight<=v_old then raise exception 'La nueva carga debe ser mayor que la actual'; end if;
 if not exists(
  select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id
  where s.id=v_student and t.owner_id=auth.uid()
 ) then raise exception 'Solo el coach del equipo puede aplicar este cambio'; end if;
 update public.dulus_plans p set exercises=(
  select jsonb_agg(
   case when x.item->>'exerciseId'=p_exercise
    then jsonb_set(x.item,'{weightKg}',to_jsonb(p_weight),true)
    else x.item end
   order by x.ord
  )
  from jsonb_array_elements(p.exercises) with ordinality x(item,ord)
 ) where p.id=p_plan;
 v_label=coalesce(nullif(trim(p_label),''),p_exercise);
 insert into public.dulus_coach_decisions(student_id,category,summary,reason,effective_on,created_by)
 values(
  v_student,'load',left(v_label||': '||v_old||' → '||p_weight||' kg',240),
  left(trim(p_reason),1200),current_date,auth.uid()
 );
end $$;

revoke all on function public.dulus_apply_load_progression(uuid,text,numeric,text,text) from public,anon;
grant execute on function public.dulus_apply_load_progression(uuid,text,numeric,text,text) to authenticated;

commit;
