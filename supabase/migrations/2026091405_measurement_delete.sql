begin;
grant delete on public.dulus_measurements to authenticated;
create policy measurement_delete on public.dulus_measurements for delete to authenticated using(exists(
 select 1 from public.dulus_students s left join public.dulus_teams t on t.id=s.team_id
 where s.id=student_id and (s.user_id=(select auth.uid()) or t.owner_id=(select auth.uid()))
));
commit;