begin;
grant delete on public.dulus_checkins to authenticated;
create policy checkin_coach_delete on public.dulus_checkins for delete to authenticated using(exists(
 select 1 from public.dulus_students s join public.dulus_teams t on t.id=s.team_id
 where s.id=student_id and t.owner_id=(select auth.uid())
));
commit;