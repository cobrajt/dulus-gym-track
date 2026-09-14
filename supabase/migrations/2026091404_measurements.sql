begin;
create table public.dulus_measurements(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.dulus_students(id) on delete cascade,
 measured_on date not null,
 weight_kg numeric(6,2),
 values_cm jsonb not null default '{}'::jsonb,
 recorded_by uuid not null default auth.uid() references public.dulus_accounts(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(student_id,measured_on),
 check(weight_kg is null or weight_kg between 20 and 500),
 check(jsonb_typeof(values_cm)='object' and octet_length(values_cm::text)<=5000)
);
create index dulus_measurements_student_date on public.dulus_measurements(student_id,measured_on desc);
alter table public.dulus_measurements enable row level security;
revoke all on public.dulus_measurements from anon,authenticated;
grant select on public.dulus_measurements to authenticated;
create policy measurement_read on public.dulus_measurements for select to authenticated using(exists(
 select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id
 where s.id=student_id and (s.user_id=(select auth.uid()) or t.owner_id=(select auth.uid()))
));
create function public.dulus_save_measurement(p_student uuid,p_date date,p_weight numeric,p_values jsonb) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid; item record; val numeric;
begin
 if auth.uid() is null then raise exception 'Debes iniciar sesion'; end if;
 if p_date is null or p_date>current_date or p_date<current_date-interval '10 years' then raise exception 'Fecha no valida'; end if;
 if p_weight is not null and (p_weight<20 or p_weight>500) then raise exception 'Peso fuera de rango'; end if;
 if p_values is null or jsonb_typeof(p_values)<>'object' or octet_length(p_values::text)>5000 then raise exception 'Medidas no validas'; end if;
 if not exists(select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id where s.id=p_student and (s.user_id=auth.uid() or t.owner_id=auth.uid())) then raise exception 'No puedes registrar estas medidas'; end if;
 for item in select * from jsonb_each_text(p_values) loop
  if item.key<>all(array['neck','shoulders','chest','leftArm','rightArm','leftForearm','rightForearm','waist','abdomen','hips','glutes','leftThigh','rightThigh','leftCalf','rightCalf']) then raise exception 'Medida no permitida'; end if;
  begin val:=item.value::numeric; exception when others then raise exception 'Valor de medida no valido'; end;
  if val<5 or val>300 then raise exception 'Valor de medida fuera de rango'; end if;
 end loop;
 insert into public.dulus_measurements(student_id,measured_on,weight_kg,values_cm,recorded_by) values(p_student,p_date,p_weight,p_values,auth.uid())
 on conflict(student_id,measured_on) do update set weight_kg=excluded.weight_kg,values_cm=excluded.values_cm,recorded_by=excluded.recorded_by,updated_at=now()
 returning id into result;
 return result;
end $$;
revoke all on function public.dulus_save_measurement(uuid,date,numeric,jsonb) from public,anon;
grant execute on function public.dulus_save_measurement(uuid,date,numeric,jsonb) to authenticated;
commit;