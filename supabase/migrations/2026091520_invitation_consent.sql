begin;

create or replace function public.dulus_create_invitation(p_team uuid) returns uuid
language plpgsql security definer set search_path='' as $$
declare invitation uuid;
begin
 if auth.uid() is null or not exists(
  select 1 from public.dulus_teams where id=p_team and owner_id=auth.uid()
 ) then raise exception 'Solo el coach puede invitar'; end if;
 delete from public.dulus_invitations
 where team_id=p_team and used_by is null and expires_at<=now();
 if (select count(*) from public.dulus_invitations where team_id=p_team and used_by is null and expires_at>now())>=5 then
  raise exception 'Ya tienes cinco invitaciones activas. Revoca una antes de crear otra';
 end if;
 insert into public.dulus_invitations(team_id) values(p_team) returning token into invitation;
 return invitation;
end $$;

create or replace function public.dulus_preview_invitation(p_token uuid)
returns table(team_id uuid,team_name text,coach_name text,expires_at timestamptz)
language sql stable security definer set search_path='' as $$
 select i.team_id,t.name,a.display_name,i.expires_at
 from public.dulus_invitations i
 join public.dulus_teams t on t.id=i.team_id
 join public.dulus_accounts a on a.id=t.owner_id
 where i.token=p_token and i.used_by is null and i.expires_at>now();
$$;
create or replace function public.dulus_list_invitations(p_team uuid)
returns table(token uuid,expires_at timestamptz,created_at timestamptz)
language sql stable security definer set search_path='' as $$
 select i.token,i.expires_at,i.created_at
 from public.dulus_invitations i
 join public.dulus_teams t on t.id=i.team_id
 where i.team_id=p_team and t.owner_id=auth.uid()
   and i.used_by is null and i.expires_at>now()
 order by i.created_at desc;
$$;

create or replace function public.dulus_revoke_invitation(p_token uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 delete from public.dulus_invitations i
 using public.dulus_teams t
 where i.token=p_token and i.team_id=t.id and t.owner_id=auth.uid() and i.used_by is null;
 if not found then raise exception 'Invitacion no disponible'; end if;
end $$;

revoke all on function public.dulus_create_invitation(uuid),public.dulus_preview_invitation(uuid),public.dulus_list_invitations(uuid),public.dulus_revoke_invitation(uuid) from public,anon;
grant execute on function public.dulus_create_invitation(uuid),public.dulus_preview_invitation(uuid),public.dulus_list_invitations(uuid),public.dulus_revoke_invitation(uuid) to authenticated;

commit;
