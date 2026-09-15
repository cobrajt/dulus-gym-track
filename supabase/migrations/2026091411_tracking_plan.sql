begin;

alter table public.dulus_students
 add column if not exists tracking_plan jsonb not null default '{}'::jsonb;

alter table public.dulus_students
 drop constraint if exists dulus_students_tracking_plan_object;
alter table public.dulus_students
 add constraint dulus_students_tracking_plan_object
 check(jsonb_typeof(tracking_plan)='object');

create or replace function public.dulus_save_tracking_plan(
 p_student uuid,
 p_body text[] default array[]::text[],
 p_performance text[] default array[]::text[],
 p_note text default ''
) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or not exists(
  select 1 from public.dulus_students s
  left join public.dulus_teams t on t.id=s.team_id
  where s.id=p_student and (s.user_id=auth.uid() or t.owner_id=auth.uid())
 ) then raise exception 'No puedes editar este perfil'; end if;
 if exists(select 1 from unnest(coalesce(p_body,array[]::text[])) x
  where x not in ('weight','waist','glutes','hips','chest','neck','shoulders','abdomen','leftArm','rightArm','leftForearm','rightForearm','leftThigh','rightThigh','leftCalf','rightCalf'))
 then raise exception 'Medida no válida'; end if;
 if exists(select 1 from unnest(coalesce(p_performance,array[]::text[])) x
  where x not in ('vertical_jump','broad_jump','sprint_10m','sprint_20m','sprint_40m','pullups','plank'))
 then raise exception 'Prueba no válida'; end if;
 if cardinality(coalesce(p_body,array[]::text[]))>10 or cardinality(coalesce(p_performance,array[]::text[]))>6
 then raise exception 'Demasiados elementos de seguimiento'; end if;
 result=jsonb_build_object(
  'version',1,
  'approved',true,
  'body',to_jsonb(coalesce(p_body,array[]::text[])),
  'performance',to_jsonb(coalesce(p_performance,array[]::text[])),
  'note',coalesce(left(p_note,500),''),
  'approved_at',now(),
  'approved_by',auth.uid()
 );
 update public.dulus_students set tracking_plan=result where id=p_student;
 return result;
end $$;
create or replace function public.dulus_clear_tracking_plan(p_student uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(
  select 1 from public.dulus_students s
  left join public.dulus_teams t on t.id=s.team_id
  where s.id=p_student and (s.user_id=auth.uid() or t.owner_id=auth.uid())
 ) then raise exception 'No puedes editar este perfil'; end if;
 update public.dulus_students set tracking_plan='{}'::jsonb where id=p_student;
end $$;

revoke all on function public.dulus_save_tracking_plan(uuid,text[],text[],text),public.dulus_clear_tracking_plan(uuid) from public,anon;
grant execute on function public.dulus_save_tracking_plan(uuid,text[],text[],text),public.dulus_clear_tracking_plan(uuid) to authenticated;

commit;
