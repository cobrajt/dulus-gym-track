begin;

create or replace function public.dulus_can_access_student(p_student uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
  select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id
  where s.id=p_student and (s.user_id=auth.uid() or t.owner_id=auth.uid())
 );
$$;

create or replace function public.dulus_can_access_plan(p_plan uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
  select 1 from public.dulus_plans p join public.dulus_students s on s.id=p.student_id
  left join public.dulus_teams t on t.id=s.team_id
  where p.id=p_plan and (s.user_id=auth.uid() or t.owner_id=auth.uid())
 );
$$;

revoke all on function public.dulus_can_access_student(uuid),public.dulus_can_access_plan(uuid) from public,anon;
grant execute on function public.dulus_can_access_student(uuid),public.dulus_can_access_plan(uuid) to authenticated;

drop policy if exists plan_access on public.dulus_plans;
create policy plan_access on public.dulus_plans for select to authenticated
using(public.dulus_can_access_student(student_id));

drop policy if exists session_access on public.dulus_sessions;
create policy session_access on public.dulus_sessions for select to authenticated
using(public.dulus_can_access_plan(plan_id));

drop policy if exists message_read on public.dulus_messages;
create policy message_read on public.dulus_messages for select to authenticated
using(public.dulus_can_access_plan(plan_id));

drop policy if exists message_write on public.dulus_messages;
create policy message_write on public.dulus_messages for insert to authenticated with check(
 author_id=(select auth.uid()) and public.dulus_can_access_plan(plan_id)
 and exists(select 1 from public.dulus_plans p where p.id=plan_id and exists(
  select 1 from jsonb_array_elements(p.exercises) e where e->>'exerciseId'=exercise_id
 ))
 and (video_path is null or (
  split_part(video_path,'/',1)=plan_id::text
  and split_part(video_path,'/',2)=(select auth.uid())::text
  and exists(select 1 from storage.objects o where o.bucket_id='dulus-technique' and o.name=video_path)
 ))
);

drop policy if exists dulus_video_read on storage.objects;
create policy dulus_video_read on storage.objects for select to authenticated using(
 bucket_id='dulus-technique'
 and split_part(name,'/',1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 and public.dulus_can_access_plan(split_part(name,'/',1)::uuid)
);

drop policy if exists dulus_video_upload on storage.objects;
create policy dulus_video_upload on storage.objects for insert to authenticated with check(
 bucket_id='dulus-technique'
 and split_part(name,'/',2)=(select auth.uid())::text
 and split_part(name,'/',1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 and public.dulus_can_access_plan(split_part(name,'/',1)::uuid)
);

drop policy if exists dulus_video_remove on storage.objects;
create policy dulus_video_remove on storage.objects for delete to authenticated using(
 bucket_id='dulus-technique'
 and split_part(name,'/',2)=(select auth.uid())::text
 and split_part(name,'/',1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
 and public.dulus_can_access_plan(split_part(name,'/',1)::uuid)
);

create or replace function public.dulus_finish_session(
 p_plan uuid,p_date date,p_completed text[],p_details jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; item jsonb; plan public.dulus_plans; planned_id text; actual_id text;
begin
 if p_details is null or jsonb_typeof(p_details)<>'object' or octet_length(p_details::text)>100000 then raise exception 'Registro no valido'; end if;
 if coalesce(jsonb_typeof(p_details->'exercises'),'')<>'array' or jsonb_array_length(p_details->'exercises')>100 then raise exception 'Ejercicios no validos'; end if;
 if coalesce((p_details->>'effort')::numeric,0) not between 0 and 10 or coalesce((p_details->>'fatigue')::numeric,0) not between 0 and 10 or coalesce((p_details->>'pain')::numeric,0) not between 0 and 10 then raise exception 'Escalas fuera de rango'; end if;
 result:=public.dulus_record_session(p_plan,p_date,p_completed);
 select * into plan from public.dulus_plans where id=p_plan;
 for item in select * from jsonb_array_elements(p_details->'exercises') loop
  actual_id:=nullif(item->>'exerciseId','');
  planned_id:=coalesce(nullif(item->>'plannedExerciseId',''),actual_id);
  if actual_id is null or length(actual_id)>200 or planned_id is null
   or not (planned_id=any(p_completed))
   or not exists(select 1 from jsonb_array_elements(plan.exercises) e where e->>'exerciseId'=planned_id)
   or coalesce((item->>'weightKg')::numeric,0) not between 0 and 1000
   or coalesce((item->>'reps')::numeric,0) not between 0 and 100
   or coalesce((item->>'rir')::numeric,0) not between 0 and 10
   or (actual_id<>planned_id and coalesce((item->>'weightKg')::numeric,0)<>0)
  then raise exception 'Detalle de ejercicio no valido'; end if;
 end loop;
 update public.dulus_sessions set details=p_details where id=result;
 return result;
end $$;

revoke all on function public.dulus_finish_session(uuid,date,text[],jsonb) from public,anon;
grant execute on function public.dulus_finish_session(uuid,date,text[],jsonb) to authenticated;

create or replace function public.dulus_apply_load_progression(
 p_plan uuid,p_exercise text,p_weight numeric,p_label text,p_reason text
) returns void language plpgsql security definer set search_path='' as $$
declare
 v_plan public.dulus_plans%rowtype; v_old numeric; v_label text; v_exercises jsonb;
 v_last_session date; v_effective date;
begin
 if auth.uid() is null then raise exception 'Inicia sesion'; end if;
 if p_weight is null or p_weight<=0 or p_weight>1000 then raise exception 'Carga no valida'; end if;
 if length(trim(coalesce(p_reason,'')))<3 then raise exception 'Explica brevemente el motivo'; end if;
 select * into v_plan from public.dulus_plans where id=p_plan for update;
 if v_plan.id is null or v_plan.created_by<>auth.uid() or v_plan.end_date is not null then raise exception 'Solo puedes modificar una rutina activa creada por ti'; end if;
 select (x.item->>'weightKg')::numeric into v_old from jsonb_array_elements(v_plan.exercises) x(item) where x.item->>'exerciseId'=p_exercise limit 1;
 if v_old is null or v_old<=0 then raise exception 'Esta progresion necesita una carga previa mayor que cero'; end if;
 if p_weight<=v_old then raise exception 'La nueva carga debe ser mayor que la actual'; end if;
 if not exists(select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id where s.id=v_plan.student_id and t.owner_id=auth.uid()) then raise exception 'Solo el coach del equipo puede aplicar este cambio'; end if;
 select jsonb_agg(case when x.item->>'exerciseId'=p_exercise then jsonb_set(x.item,'{weightKg}',to_jsonb(p_weight),true) else x.item end order by x.ord)
 into v_exercises from jsonb_array_elements(v_plan.exercises) with ordinality x(item,ord);
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
 values(v_plan.student_id,'load',left(v_label||': '||v_old||' -> '||p_weight||' kg',240),left(trim(p_reason),1200),v_effective,auth.uid());
end $$;

revoke all on function public.dulus_apply_load_progression(uuid,text,numeric,text,text) from public,anon;
grant execute on function public.dulus_apply_load_progression(uuid,text,numeric,text,text) to authenticated;

commit;
