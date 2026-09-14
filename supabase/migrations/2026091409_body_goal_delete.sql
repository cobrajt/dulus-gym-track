begin;
create or replace function public.dulus_delete_body_goal(p_goal uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(
  select 1 from public.dulus_body_goals g join public.dulus_students s on s.id=g.student_id left join public.dulus_teams t on t.id=s.team_id
  where g.id=p_goal and (s.user_id=auth.uid() or t.owner_id=auth.uid())
 ) then raise exception 'No puedes eliminar esta meta'; end if;
 delete from public.dulus_body_goals where id=p_goal;
end $$;
revoke all on function public.dulus_delete_body_goal(uuid) from public,anon;
grant execute on function public.dulus_delete_body_goal(uuid) to authenticated;
commit;
