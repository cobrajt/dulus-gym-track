begin;

create table if not exists public.dulus_agenda_snoozes(
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.dulus_students(id) on delete cascade,
 signal_key text not null check(length(trim(signal_key)) between 3 and 180),
 snoozed_until timestamptz not null,
 created_by uuid not null default auth.uid() references public.dulus_accounts(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(student_id,signal_key,created_by)
);

create index if not exists dulus_agenda_snoozes_until on public.dulus_agenda_snoozes(created_by,snoozed_until);
alter table public.dulus_agenda_snoozes enable row level security;
revoke all on public.dulus_agenda_snoozes from anon,authenticated;
grant select on public.dulus_agenda_snoozes to authenticated;
create policy agenda_snooze_read on public.dulus_agenda_snoozes for select to authenticated using(
 created_by=(select auth.uid()) and exists(select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id where s.id=student_id and t.owner_id=(select auth.uid()))
);

create function public.dulus_snooze_agenda_signal(p_student uuid,p_signal text,p_until timestamptz) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id where s.id=p_student and t.owner_id=auth.uid()) then raise exception 'Solo el coach puede posponer este seguimiento'; end if;
 if p_until is null or p_until<=now() or p_until>now()+interval '7 days' then raise exception 'Plazo no válido'; end if;
 insert into public.dulus_agenda_snoozes(student_id,signal_key,snoozed_until,created_by)
 values(p_student,trim(p_signal),p_until,auth.uid())
 on conflict(student_id,signal_key,created_by) do update set snoozed_until=excluded.snoozed_until,updated_at=now()
 returning id into result;
 return result;
end $$;

create function public.dulus_clear_agenda_snooze(p_student uuid,p_signal text) returns void language plpgsql security definer set search_path='' as $$
begin
 delete from public.dulus_agenda_snoozes a where a.student_id=p_student and a.signal_key=trim(p_signal) and a.created_by=auth.uid();
end $$;

revoke all on function public.dulus_snooze_agenda_signal(uuid,text,timestamptz),public.dulus_clear_agenda_snooze(uuid,text) from public,anon;
grant execute on function public.dulus_snooze_agenda_signal(uuid,text,timestamptz),public.dulus_clear_agenda_snooze(uuid,text) to authenticated;

commit;
