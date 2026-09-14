begin;

alter table public.dulus_students
 add column if not exists body_reference text
 check(body_reference is null or body_reference in ('male','female','unspecified'));
alter table public.dulus_students
 add column if not exists birth_date date
 check(birth_date is null or birth_date between date '1900-01-01' and current_date);

grant update(body_reference,birth_date) on public.dulus_students to authenticated;

create table if not exists public.dulus_body_goals(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.dulus_students(id) on delete cascade,
 metric text not null check(metric in ('weight','bmi','waist','glutes','hips','chest','abdomen','shoulders','neck','leftArm','rightArm','leftForearm','rightForearm','leftThigh','rightThigh','leftCalf','rightCalf')),
 start_value numeric(8,2) check(start_value is null or (start_value>0 and start_value<1000)),
 target_value numeric(8,2) not null check(target_value>0 and target_value<1000),
 unit text not null check(unit in ('kg','kg/m2','cm')),
 target_date date,
 note text not null default '' check(length(note)<=500),
 created_by uuid not null default auth.uid() references public.dulus_accounts(id),
 created_at timestamptz not null default now(),
 active boolean not null default true,
 reached_at timestamptz
);
create unique index if not exists dulus_body_goals_one_active_metric on public.dulus_body_goals(student_id,metric) where active;
alter table public.dulus_body_goals enable row level security;
revoke all on public.dulus_body_goals from anon,authenticated;
grant select on public.dulus_body_goals to authenticated;

create policy body_goal_read on public.dulus_body_goals for select to authenticated using(exists(
 select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id
 where s.id=student_id and (s.user_id=(select auth.uid()) or t.owner_id=(select auth.uid()))
));

create or replace function public.dulus_save_body_goal(p_student uuid,p_metric text,p_start numeric,p_target numeric,p_unit text,p_date date default null,p_note text default '') returns uuid
language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if auth.uid() is null or not exists(
  select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id
  where s.id=p_student and (s.user_id=auth.uid() or t.owner_id=auth.uid())
 ) then raise exception 'No puedes modificar estas metas'; end if;
 if p_metric not in ('weight','bmi','waist','glutes','hips','chest','abdomen','shoulders','neck','leftArm','rightArm','leftForearm','rightForearm','leftThigh','rightThigh','leftCalf','rightCalf') then raise exception 'Métrica no válida'; end if;
 if p_unit not in ('kg','kg/m2','cm') or p_target<=0 or p_target>=1000 then raise exception 'Meta no válida'; end if;
 if p_date is not null and p_date<current_date then raise exception 'La fecha objetivo no puede estar en el pasado'; end if;
 update public.dulus_body_goals set active=false where student_id=p_student and metric=p_metric and active;
 insert into public.dulus_body_goals(student_id,metric,start_value,target_value,unit,target_date,note,created_by) values(p_student,p_metric,p_start,p_target,p_unit,p_date,left(coalesce(p_note,''),500),auth.uid()) returning id into result;
 return result;
end $$;
create or replace function public.dulus_close_body_goal(p_goal uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(
  select 1 from public.dulus_body_goals g join public.dulus_students s on s.id=g.student_id left join public.dulus_teams t on t.id=s.team_id
  where g.id=p_goal and (s.user_id=auth.uid() or t.owner_id=auth.uid())
 ) then raise exception 'No puedes modificar esta meta'; end if;
 update public.dulus_body_goals set active=false where id=p_goal;
end $$;

revoke all on function public.dulus_save_body_goal(uuid,text,numeric,numeric,text,date,text),public.dulus_close_body_goal(uuid) from public,anon;
grant execute on function public.dulus_save_body_goal(uuid,text,numeric,numeric,text,date,text),public.dulus_close_body_goal(uuid) to authenticated;

commit;
