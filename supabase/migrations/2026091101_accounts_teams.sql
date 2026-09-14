-- Dulus account/team foundation. Existing empty legacy tables are preserved.
begin;
alter table public.profiles enable row level security;
alter table public.rutinas enable row level security;
alter table public.detalle_rutina enable row level security;
alter table public.registro_series enable row level security;
alter table public.ejercicios enable row level security;
revoke all on public.profiles,public.rutinas,public.detalle_rutina,public.registro_series,public.ejercicios from anon,authenticated;
create table public.dulus_accounts(
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check(length(display_name) between 1 and 100),
 created_at timestamptz not null default now()
);
create table public.dulus_teams(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references public.dulus_accounts(id),
 name text not null check(length(name) between 1 and 100),
 created_at timestamptz not null default now()
);
create table public.dulus_members(
 team_id uuid not null references public.dulus_teams(id) on delete cascade,
 user_id uuid not null references public.dulus_accounts(id) on delete cascade,
 role text not null check(role in ('coach','student')),
 joined_at timestamptz not null default now(),
 primary key(team_id,user_id)
);
create index dulus_members_user on public.dulus_members(user_id);
create table public.dulus_invitations(
 token uuid primary key default gen_random_uuid(),
 team_id uuid not null references public.dulus_teams(id) on delete cascade,
 expires_at timestamptz not null default now()+interval '7 days',
 used_by uuid references public.dulus_accounts(id),
 created_at timestamptz not null default now()
);
alter table public.dulus_accounts enable row level security;
alter table public.dulus_teams enable row level security;
alter table public.dulus_members enable row level security;
alter table public.dulus_invitations enable row level security;
revoke all on public.dulus_accounts,public.dulus_teams,public.dulus_members,public.dulus_invitations from anon,authenticated;
grant select on public.dulus_accounts,public.dulus_teams,public.dulus_members to authenticated;
create policy account_self on public.dulus_accounts for select to authenticated using(id=(select auth.uid()));
create policy member_self on public.dulus_members for select to authenticated using(user_id=(select auth.uid()));
create policy team_member on public.dulus_teams for select to authenticated using(exists(select 1 from public.dulus_members m where m.team_id=id and m.user_id=(select auth.uid())));
create function public.dulus_save_account(p_name text) returns public.dulus_accounts language plpgsql security definer set search_path='' as $$
declare result public.dulus_accounts;
begin
 if auth.uid() is null then raise exception 'Debes iniciar sesion'; end if;
 insert into public.dulus_accounts(id,display_name) values(auth.uid(),trim(p_name))
 on conflict(id) do update set display_name=excluded.display_name returning * into result;
 return result;
end $$;
create function public.dulus_create_team(p_name text) returns uuid language plpgsql security definer set search_path='' as $$
declare team uuid;
begin
 if auth.uid() is null then raise exception 'Debes iniciar sesion'; end if;
 perform 1 from public.dulus_accounts where id=auth.uid() for update;
 if not found then raise exception 'Completa tu perfil primero'; end if;
 if (select count(*) from public.dulus_teams where owner_id=auth.uid())>=3 then raise exception 'Ya tienes tres equipos'; end if;
 insert into public.dulus_teams(owner_id,name) values(auth.uid(),trim(p_name)) returning id into team;
 insert into public.dulus_members(team_id,user_id,role) values(team,auth.uid(),'coach');
 return team;
end $$;
create function public.dulus_create_invitation(p_team uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare invitation uuid;
begin
 if auth.uid() is null or not exists(select 1 from public.dulus_teams where id=p_team and owner_id=auth.uid()) then raise exception 'Solo el coach puede invitar'; end if;
 insert into public.dulus_invitations(team_id) values(p_team) returning token into invitation;
 return invitation;
end $$;
create function public.dulus_join_team(p_token uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare invitation public.dulus_invitations;
begin
 if auth.uid() is null or not exists(select 1 from public.dulus_accounts where id=auth.uid()) then raise exception 'Completa tu perfil primero'; end if;
 select * into invitation from public.dulus_invitations where token=p_token and expires_at>now() and used_by is null for update;
 if not found then raise exception 'Invitacion no valida, usada o vencida'; end if;
 insert into public.dulus_members(team_id,user_id,role) values(invitation.team_id,auth.uid(),'student') on conflict do nothing;
 update public.dulus_invitations set used_by=auth.uid() where token=p_token;
 return invitation.team_id;
end $$;
revoke all on function public.dulus_save_account(text),public.dulus_create_team(text),public.dulus_create_invitation(uuid),public.dulus_join_team(uuid) from public,anon;
grant execute on function public.dulus_save_account(text),public.dulus_create_team(text),public.dulus_create_invitation(uuid),public.dulus_join_team(uuid) to authenticated;
commit;
